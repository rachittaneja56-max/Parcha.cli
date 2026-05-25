import { eq, and } from "@repo/database";
import type { db } from "@repo/database";
import { formsTable } from "@repo/database/schema";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { FieldSchema } from "@repo/validators";

const fieldSchemaArray = z.array(FieldSchema);

class FormService {
  constructor(private readonly dbInstance: typeof db) {}

  public async createForm(creatorId: string, title: string, theme: "terminal" | "windows95" | "silicon_valley") {
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

  public async updateSettings(formId: string, creatorId: string, updates: { title?: string, status?: "draft" | "published", visibility?: "public" | "unlisted" | "unpublished", theme?: "terminal" | "windows95" | "silicon_valley", requireAuth?: boolean, password?: string | null, successMessage?: string }) {
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
    return await this.dbInstance.query.formsTable.findMany({
      where: eq(formsTable.creatorId, creatorId),
    });
  }

  public async getPublicFormById(formIdOrSlug: string) {
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(formIdOrSlug);
    return await this.dbInstance.query.formsTable.findFirst({
      where: isUuid ? eq(formsTable.id, formIdOrSlug) : eq(formsTable.slug, formIdOrSlug),
      columns: {
        id: true,
        title: true,
        slug: true,
        status: true,
        requireAuth: true,
        password: true,
        schema: true,
        successMessage: true,
        theme: true,
      }
    });
  }

  public async getFormById(formId: string) {
    return await this.dbInstance.query.formsTable.findFirst({
      where: eq(formsTable.id, formId),
    });
  }
}


export default FormService;
