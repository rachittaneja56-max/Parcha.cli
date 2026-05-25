import { eq, sql } from "@repo/database";
import type { db } from "@repo/database";
import { TRPCError } from "@trpc/server";
import { formsTable, analyticsTable, responsesTable } from "@repo/database/schema";
import { appEventBus } from "../events";
import { z } from "zod";


class ResponseService {
  constructor(private readonly dbInstance: typeof db) {}

  public async trackView(slug: string) {
    const form = await this.dbInstance.query.formsTable.findFirst({
      where: eq(formsTable.slug, slug),
    });

    if (!form) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
    }

    await this.dbInstance.insert(analyticsTable)
      .values({
        formId: form.id,
        views: 1,
        submissions: 0,
        bounceRate: "0",
      })
      .onConflictDoUpdate({
        target: analyticsTable.formId,
        set: { views: sql`${analyticsTable.views} + 1` },
      });
  }

  public async submitResponse(
    slug: string,
    payload: Record<string, any>,
    honeypotField?: string,
    fingerprint?: string
  ) {
    const form = await this.dbInstance.query.formsTable.findFirst({
      where: eq(formsTable.slug, slug),
    });

    if (!form || form.visibility === "unpublished") {
      throw new TRPCError({ code: "NOT_FOUND", message: "Form not found or unpublished" });
    }

    if (honeypotField && honeypotField.length > 0) {
      // Spam check: drop silently
      return { success: true, message: "Response submitted" };
    }


    const schemaShape: Record<string, z.ZodTypeAny> = {};
    const formSchema = Array.isArray(form.schema) ? form.schema : [];
    
    for (const field of formSchema) {
      if (field.required) {
        schemaShape[field.id] = z
          .any()
          .refine(
            (val) => val !== undefined && val !== null && val !== "",
            { message: `Field ${field.id} is required` }
          );
      } else {
        schemaShape[field.id] = z.any().optional();
      }
    }

    const dynamicSchema = z.object(schemaShape);
    
    const parsedPayload = dynamicSchema.parse(payload);

    await this.dbInstance.transaction(async (tx) => {
      const [newResponse] = await tx
        .insert(responsesTable)
        .values({
          formId: form.id,
          payload: parsedPayload,
          respondentFingerprint: fingerprint,
        })
        .returning();

      await tx
        .insert(analyticsTable)
        .values({
          formId: form.id,
          views: 0,
          submissions: 1,
          bounceRate: "0",
          lastSubmissionAt: new Date(),
        })
        .onConflictDoUpdate({
          target: analyticsTable.formId,
          set: {
            submissions: sql`${analyticsTable.submissions} + 1`,
            lastSubmissionAt: new Date(),
          },
        });

      appEventBus.emit("NEW_SUBMISSION", {
        formId: form.id,
        response: newResponse,
      });
    });

    return { success: true, message: "Response submitted" };
  }

  public async getResponsesByFormId(formId: string) {
    return await this.dbInstance.query.responsesTable.findMany({
      where: eq(responsesTable.formId, formId),
      orderBy: (responses, { desc }) => [desc(responses.submittedAt)],
    });
  }
}

export default ResponseService;
