import { eq, and, sql } from "@repo/database";
import type { db } from "@repo/database";
import { formsTable, usersTable } from "@repo/database/schema";
import { responsesTable } from "@repo/database/models/responses";
import { analyticsTable } from "@repo/database/models/analytics";
import { TRPCError } from "@trpc/server";
import { getCache, setCache, delCache } from "@repo/redis";
import type { UpdateSettingsInput } from "@repo/validators";
import bcrypt from "bcrypt";
import {
  PUBLIC_FORMS_CACHE_KEY,
  PUBLIC_FORMS_CACHE_TTL_SECONDS,
  invalidatePublicFormsCache,
} from "./cache";
import { fieldSchemaArray, normalizeBuilderSchema, sanitizePublicSchema } from "./schema";
import { prepareSettingsUpdate } from "./settings";
import { normalizeFormTheme, type PublicFormTheme } from "./theme";
import EmailService from "../email";

type PublicFormListItem = {
  id: string;
  title: string;
  theme: PublicFormTheme;
  slug: string;
  views: number;
  creator: {
    fullName: string;
    profileImageUrl: string | null;
  } | null;
};

class FormService {
  private readonly emailService = new EmailService();

  constructor(private readonly dbInstance: typeof db) {}

  public async createForm(
    creatorId: string,
    title: string,
    theme: "terminal" | "windowsxp" | "standard" | "code_editor",
    schema?: any,
  ) {
    const slug = Math.random().toString(36).substring(2, 10);

    const [form] = await this.dbInstance
      .insert(formsTable)
      .values({
        creatorId,
        title,
        theme,
        slug,
        status: "draft",
        visibility: "public",
        schema: schema || [],
        updatedAt: new Date(),
      })
      .returning();

    await invalidatePublicFormsCache();

    return form;
  }

  public async updateSchema(formId: string, creatorId: string, newSchema: unknown, isAdmin: boolean = false) {
    const parsedSchema = fieldSchemaArray.parse(newSchema);

    const [updatedForm] = await this.dbInstance
      .update(formsTable)
      .set({ schema: parsedSchema })
      .where(
        isAdmin
          ? eq(formsTable.id, formId)
          : and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId))
      )
      .returning();

    if (!updatedForm) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Form not found or unauthorized" });
    }

    await delCache(`form:${formId}`);

    return updatedForm;
  }

  public async updateSettings(
    formId: string,
    creatorId: string,
    updates: UpdateSettingsInput["updates"],
    isAdmin: boolean = false,
  ) {
    const finalUpdates = await prepareSettingsUpdate(updates);

    // Fetch existing form to check if it's transitioning to published
    const [existing] = await this.dbInstance
      .select({ status: formsTable.status, title: formsTable.title, slug: formsTable.slug, userEmail: usersTable.email })
      .from(formsTable)
      .innerJoin(usersTable, eq(formsTable.creatorId, usersTable.id))
      .where(eq(formsTable.id, formId));

    const [updatedForm] = await this.dbInstance
      .update(formsTable)
      .set(finalUpdates)
      .where(
        isAdmin
          ? eq(formsTable.id, formId)
          : and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId))
      )
      .returning();

    if (!updatedForm) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Form not found or unauthorized" });
    }

    // Trigger email if transitioning to published
    if (existing && existing.status !== "published" && finalUpdates.status === "published" && existing.userEmail) {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const formUrl = `${frontendUrl}/f/${existing.slug}`;
      this.emailService.sendFormPublishedEmail(existing.userEmail, existing.title, formUrl).catch((err) => {
        console.error("[EMAIL ERROR] Failed to send publish notification:", err);
      });
    }

    await invalidatePublicFormsCache();
    await delCache(`form:${formId}`);

    return updatedForm;
  }

  public async deleteForm(formId: string, creatorId: string, isAdmin: boolean = false) {
    const form = await this.dbInstance.query.formsTable.findFirst({
      where: isAdmin
        ? eq(formsTable.id, formId)
        : and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)),
    });

    if (!form) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Form not found or unauthorized" });
    }

    await this.dbInstance.delete(responsesTable).where(eq(responsesTable.formId, formId));
    await this.dbInstance.delete(analyticsTable).where(eq(analyticsTable.formId, formId));
    
    await this.dbInstance.delete(formsTable).where(eq(formsTable.id, formId));
    await invalidatePublicFormsCache();
    await delCache(`form:${formId}`);

    return { success: true };
  }

  public async getMyForms(creatorId: string) {
    const formsWithCounts = await this.dbInstance
      .select({
        form: formsTable,
        responseCount: sql<number>`count(${responsesTable.id})::int`,
      })
      .from(formsTable)
      .leftJoin(responsesTable, eq(formsTable.id, responsesTable.formId))
      .where(eq(formsTable.creatorId, creatorId))
      .groupBy(formsTable.id)
      .orderBy(sql`${formsTable.updatedAt} DESC`);

    return formsWithCounts.map((row) => ({
      ...row.form,
      theme: normalizeFormTheme(row.form.theme),
      responseCount: row.responseCount,
    }));
  }

  public async getPublicFormById(formIdOrSlug: string, providedPassword?: string) {
    const isUuid =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        formIdOrSlug,
      );

    const [form] = await this.dbInstance
      .update(formsTable)
      .set({ views: sql`${formsTable.views} + 1` })
      .where(isUuid ? eq(formsTable.id, formIdOrSlug) : eq(formsTable.slug, formIdOrSlug))
      .returning({
        id: formsTable.id,
        title: formsTable.title,
        slug: formsTable.slug,
        status: formsTable.status,
        requireAuth: formsTable.requireAuth,
        password: formsTable.password,
        passwordHash: formsTable.passwordHash,
        schema: formsTable.schema,
        successMessage: formsTable.successMessage,
        theme: formsTable.theme,
      });

    if (!form) return null;

    let isAuthorized = true;
    if (form.passwordHash) {
      if (!providedPassword) {
        isAuthorized = false;
      } else {
        const isValid = await bcrypt.compare(providedPassword, form.passwordHash);
        isAuthorized = isValid;
      }
    } else if (form.password) {
      if (providedPassword !== form.password) {
        isAuthorized = false;
      }
    }

    return {
      id: form.id,
      title: form.title,
      slug: form.slug,
      status: form.status,
      requireAuth: form.requireAuth,
      theme: normalizeFormTheme(form.theme),
      successMessage: isAuthorized ? form.successMessage : undefined,
      schema: isAuthorized ? sanitizePublicSchema(form.schema) : [],
      isPasswordProtected: !!(form.passwordHash || form.password),
      isAuthorized,
    };
  }

  public async getFormById(formId: string, creatorId: string, isAdmin: boolean = false) {
    const cacheKey = `form:${formId}`;
    let form = await getCache<any>(cacheKey);

    if (!form) {
      form = await this.dbInstance.query.formsTable.findFirst({
        where: eq(formsTable.id, formId),
      });

      if (form) {
        await setCache(cacheKey, form, 3600); // Cache for 1 hour
      }
    }

    if (!form) return null;
    if (!isAdmin && form.creatorId !== creatorId) return null;

    return {
      ...form,
      theme: normalizeFormTheme(form.theme),
      schema: normalizeBuilderSchema(form.schema),
    };
  }

  public async getPublicForms() {
    const cachedForms = await getCache<PublicFormListItem[]>(PUBLIC_FORMS_CACHE_KEY);
    if (cachedForms) return cachedForms;

    const publicForms = await this.dbInstance.query.formsTable.findMany({
      columns: {
        id: true,
        title: true,
        theme: true,
        slug: true,
        views: true,
      },
      where: and(eq(formsTable.visibility, "public"), eq(formsTable.status, "published")),
      orderBy: (forms, { desc }) => [desc(forms.updatedAt)],
      with: {
        creator: {
          columns: {
            fullName: true,
            profileImageUrl: true,
          },
        },
      },
    });

    const normalizedForms = publicForms.map((form) => ({
      ...form,
      theme: normalizeFormTheme(form.theme),
    }));

    await setCache(PUBLIC_FORMS_CACHE_KEY, normalizedForms, PUBLIC_FORMS_CACHE_TTL_SECONDS);

    return normalizedForms;
  }
}

export default FormService;
