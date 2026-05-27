import { eq, sql } from "@repo/database";
import type { db } from "@repo/database";
import { TRPCError } from "@trpc/server";
import { formsTable, analyticsTable, responsesTable } from "@repo/database/schema";
import { appEventBus } from "../events";
import { createResponsePayloadSchema } from "./validation";
import { getCache, setCache, delCache } from "@repo/redis";
import EmailService from "../email";

class ResponseService {
  private readonly emailService = new EmailService();

  constructor(private readonly dbInstance: typeof db) {}

  public async trackView(slug: string) {
    const form = await this.dbInstance.query.formsTable.findFirst({
      where: eq(formsTable.slug, slug),
    });

    if (!form) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
    }

    await this.dbInstance
      .insert(analyticsTable)
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

    appEventBus.emit("NEW_VIEW", { formId: form.id });
  }

  public async submitResponse(
    slug: string,
    payload: Record<string, any>,
    honeypotField?: string,
    fingerprint?: string,
    userId?: string,
    analytics?: { timeToComplete?: number },
    respondentEmail?: string
  ) {
    if (honeypotField && honeypotField.length > 0) {
      return { success: true, message: "Response submitted" };
    }

    const form = await this.getValidatedFormForSubmission(slug, userId);
    const parsedPayload = this.validatePayload(form.schema, payload);

    const newResponse = await this.executeSubmissionTransaction(
      form.id,
      parsedPayload,
      fingerprint,
      analytics?.timeToComplete
    );

    await this.firePostSubmissionHooks(form, newResponse, parsedPayload, respondentEmail);

    return { success: true, message: "Response submitted" };
  }

  public async getResponsesByFormId(formId: string, userId: string, isAdmin: boolean = false) {
    const form = await this.dbInstance.query.formsTable.findFirst({
      where: eq(formsTable.id, formId),
      columns: { creatorId: true }
    });
    
    if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
    if (!isAdmin && form.creatorId !== userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized: You do not own this form" });
    }

    const cacheKey = `responses:${formId}`;
    const cached = await getCache<any[]>(cacheKey);
    if (cached) return cached;

    const responses = await this.dbInstance.query.responsesTable.findMany({
      where: eq(responsesTable.formId, formId),
      orderBy: (responses, { desc }) => [desc(responses.submittedAt)],
    });

    await setCache(cacheKey, responses, 60 * 5); // cache for 5 minutes

    return responses;
  }

  // --- Private Helpers for SOLID Principles ---

  private async getValidatedFormForSubmission(slug: string, userId?: string) {
    const form = await this.dbInstance.query.formsTable.findFirst({
      where: eq(formsTable.slug, slug),
      with: { creator: true, analytics: true }
    });

    if (!form || form.visibility === "unpublished") {
      throw new TRPCError({ code: "NOT_FOUND", message: "Form not found or unpublished" });
    }

    if (form.requireAuth && !userId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required to submit this form" });
    }

    return form;
  }

  private validatePayload(schema: any, payload: Record<string, any>) {
    const dynamicSchema = createResponsePayloadSchema(schema);
    return dynamicSchema.parse(payload);
  }

  private async executeSubmissionTransaction(
    formId: string,
    parsedPayload: Record<string, any>,
    fingerprint?: string,
    timeToComplete?: number
  ) {
    return this.dbInstance.transaction(async (tx) => {
      const [newResponse] = await tx
        .insert(responsesTable)
        .values({
          formId,
          payload: parsedPayload,
          respondentFingerprint: fingerprint,
          timeToComplete,
        })
        .returning();

      await tx
        .insert(analyticsTable)
        .values({
          formId,
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

      return newResponse;
    });
  }

  private async firePostSubmissionHooks(
    form: any,
    newResponse: any,
    parsedPayload: Record<string, any>,
    respondentEmail?: string
  ) {
    appEventBus.emit("NEW_SUBMISSION", { formId: form.id, response: newResponse });
    
    // Fire and forget non-critical async tasks
    delCache(`responses:${form.id}`).catch(e => console.error("Cache invalidation failed", e));

    if (form.creator?.email) {
      const currentSubmissions = form.analytics ? form.analytics.submissions : 0;
      this.emailService.sendNewResponseEmail(form.creator.email, form.title, currentSubmissions + 1, form.id)
        .catch(e => console.error("[EMAIL ERROR] Failed to send new response notification:", e));
    }

    if (respondentEmail) {
      this.emailService.sendRespondentConfirmationEmail(respondentEmail, form.title)
        .catch(e => console.error("[EMAIL ERROR] Failed to send respondent confirmation:", e));
    }

    if (form.webhookUrl) {
      this.fireWebhook(form, parsedPayload);
    }
  }

  private fireWebhook(form: any, parsedPayload: Record<string, any>) {
    fetch(form.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "form.submitted",
        formId: form.id,
        formTitle: form.title,
        submittedAt: new Date().toISOString(),
        payload: parsedPayload,
      }),
    }).catch((e) => console.error("Failed to fire webhook:", e));
  }
}

export default ResponseService;

