import { eq, and } from "@repo/database";
import type { db } from "@repo/database";
import { formsTable, FormSchemaField } from "@repo/database/schema";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const formFieldSchema = z.object({
  id: z.string().startsWith("fld_"),
  type: z.string(),
  name: z.string(),
  prompt: z.string(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  conditional_logic: z.record(z.string(), z.any()).optional(),
  page_number: z.number().optional(),
});

export const formSchemaArray = z.array(formFieldSchema);

class FormService {
  constructor(private readonly dbInstance: typeof db) {}

  public async createForm(creatorId: string, title: string, theme: "standard_dark" | "git_commit" | "mongo_shell") {
    const slug = Math.random().toString(36).substring(2, 10);
    
    const [form] = await this.dbInstance.insert(formsTable).values({
      creatorId,
      title,
      theme,
      slug,
      schema: [],
    }).returning();
    
    return form;
  }

  public async updateSchema(formId: string, creatorId: string, newSchema: unknown) {
    const parsedSchema = formSchemaArray.parse(newSchema);
    
    const [updatedForm] = await this.dbInstance.update(formsTable)
      .set({ schema: parsedSchema })
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .returning();
      
    if (!updatedForm) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Form not found or unauthorized" });
    }
    
    return updatedForm;
  }

  public async updateSettings(formId: string, creatorId: string, updates: { visibility?: "public" | "unlisted" | "unpublished", theme?: "standard_dark" | "git_commit" | "mongo_shell" }) {
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

  public async getFormById(formId: string) {
    return await this.dbInstance.query.formsTable.findFirst({
      where: eq(formsTable.id, formId),
    });
  }
}


export default FormService;
