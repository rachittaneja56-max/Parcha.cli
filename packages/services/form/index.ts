import { eq, and, sql } from "@repo/database";
import type { db } from "@repo/database";
import { formsTable } from "@repo/database/schema";
import { responsesTable } from "@repo/database/models/responses";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { FieldSchema } from "@repo/validators";

const fieldSchemaArray = z.array(FieldSchema);

class FormService {
  constructor(private readonly dbInstance: typeof db) {}

  public async createForm(creatorId: string, title: string, theme: "terminal" | "windows95" | "silicon_valley" | "gamified_3d") {
    const slug = Math.random().toString(36).substring(2, 10);
    
    const [form] = await this.dbInstance.insert(formsTable).values({
      creatorId,
      title,
      theme,
      slug,
      schema: [],
      updatedAt: new Date(),
    }).returning();
    
    return form;
  }

  public async updateSchema(formId: string, creatorId: string, newSchema: unknown) {
    const parsedSchema = fieldSchemaArray.parse(newSchema);
    
    const [updatedForm] = await this.dbInstance.update(formsTable)
      .set({ schema: parsedSchema })
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .returning();
      
    if (!updatedForm) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Form not found or unauthorized" });
    }
    
    return updatedForm;
  }

  public async updateSettings(formId: string, creatorId: string, updates: { title?: string, status?: "draft" | "published", visibility?: "public" | "unlisted" | "unpublished", theme?: "terminal" | "windows95" | "silicon_valley" | "gamified_3d", requireAuth?: boolean, password?: string | null, successMessage?: string }) {
    const [updatedForm] = await this.dbInstance.update(formsTable)
      .set(updates)
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .returning();
      
    if (!updatedForm) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Form not found or unauthorized" });
    }
    
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
      responseCount: row.responseCount,
    }));
  }

  public async getPublicFormById(formIdOrSlug: string) {
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(formIdOrSlug);
    
    const [form] = await this.dbInstance.update(formsTable)
      .set({ views: sql`${formsTable.views} + 1` })
      .where(isUuid ? eq(formsTable.id, formIdOrSlug) : eq(formsTable.slug, formIdOrSlug))
      .returning({
        id: formsTable.id,
        title: formsTable.title,
        slug: formsTable.slug,
        status: formsTable.status,
        requireAuth: formsTable.requireAuth,
        password: formsTable.password,
        schema: formsTable.schema,
        successMessage: formsTable.successMessage,
        theme: formsTable.theme,
      });

    return form || null;
  }

  public async getFormById(formId: string) {
    return await this.dbInstance.query.formsTable.findFirst({
      where: eq(formsTable.id, formId),
    });
  }
}


export default FormService;
