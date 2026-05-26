import { eq, and, sql } from "@repo/database";
import type { db } from "@repo/database";
import { formsTable } from "@repo/database/schema";
import { responsesTable } from "@repo/database/models/responses";
import { TRPCError } from "@trpc/server";
import { getCache, setCache } from "@repo/redis";
import type { UpdateSettingsInput } from "@repo/validators";
import bcrypt from "bcrypt";
import {
  PUBLIC_FORMS_CACHE_KEY,
  PUBLIC_FORMS_CACHE_TTL_SECONDS,
  invalidatePublicFormsCache,
} from "./cache";
import { fieldSchemaArray, normalizeBuilderSchema } from "./schema";
import { prepareSettingsUpdate } from "./settings";
import { normalizeFormTheme, type PublicFormTheme } from "./theme";

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

  public async updateSchema(formId: string, creatorId: string, newSchema: unknown) {
    const parsedSchema = fieldSchemaArray.parse(newSchema);

    const [updatedForm] = await this.dbInstance
      .update(formsTable)
      .set({ schema: parsedSchema })
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .returning();

    if (!updatedForm) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Form not found or unauthorized" });
    }

    return updatedForm;
  }

  public async updateSettings(
    formId: string,
    creatorId: string,
    updates: UpdateSettingsInput["updates"],
  ) {
    const finalUpdates = await prepareSettingsUpdate(updates);

    const [updatedForm] = await this.dbInstance
      .update(formsTable)
      .set(finalUpdates)
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .returning();

    if (!updatedForm) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Form not found or unauthorized" });
    }

    await invalidatePublicFormsCache();

    return updatedForm;
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
      schema: isAuthorized ? form.schema : [],
      isPasswordProtected: !!(form.passwordHash || form.password),
      isAuthorized,
    };
  }

  public async getFormById(formId: string, creatorId: string) {
    const form = await this.dbInstance.query.formsTable.findFirst({
      where: and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)),
    });
    if (!form) return null;

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
