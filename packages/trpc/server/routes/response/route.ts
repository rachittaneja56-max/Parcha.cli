/**
 * @file route.ts (Response Router)
 * @description Handles all public-facing form submission and view-tracking endpoints.
 * `submit` is the hot path executed every time a respondent fills out a form — it runs
 * honeypot detection, fingerprint deduplication, and triggers real-time subscriptions via
 * `appEventBus`. All endpoints are rate-limited via `rateLimitMiddleware` (Upstash Redis).
 *
 * Key flows:
 *   1. Respondent opens form → `trackView` increments `formsTable.views` + `analyticsTable.views`.
 *   2. Respondent submits   → `submit` inserts into `responsesTable`, fires `NEW_SUBMISSION` event.
 *   3. Owner's analytics tab listens via `analyticsRouter.onNewSubmission` WebSocket subscription.
 *
 * @dependencies
 * - responseService (submission validation, fingerprint check, webhook firing, email notify)
 * - rateLimitMiddleware (Upstash Redis sliding-window rate limiter, keyed by IP)
 * - @repo/validators (SubmitResponseSchema, TrackViewSchema)
 */
import { z } from "zod";

import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { responseService } from "../../services";
import { SubmitResponseSchema, TrackViewSchema } from "@repo/validators";
import { generatePath } from "../../utils/path-generator";
import { rateLimitMiddleware } from "../../middlewares/rateLimit";

const TAGS = ["Responses"];
const getPath = generatePath("/responses");

export const responseRouter = router({
  /**
   * @procedure submit
   * @description Core form submission handler. Validates the response payload against
   * the form schema, checks the honeypot field for bots, deduplicates by fingerprint
   * if configured, inserts the response, and fires the `NEW_SUBMISSION` event to notify
   * real-time subscribers. Also triggers webhook and email notification if configured.
   * @requires publicProcedure + rateLimitMiddleware
   * @output The persisted response record
   */
  submit: publicProcedure
    .use(rateLimitMiddleware)
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/submit"),
        protect: false,
        tags: TAGS,
        summary: "Submit a form response",
        successDescription: "The saved response result",
        errorResponses: { 400: "Invalid response payload", 404: "Form not found" },
      },
    })
    .input(SubmitResponseSchema)
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      return await responseService.submitResponse(
        input.slug,
        input.payload,
        input.honeypotField,
        input.fingerprint,
        ctx.user?.id,
        {
          timeToComplete: input.timeToComplete,
        },
        ctx.user?.email
      );
    }),

  /**
   * @procedure trackView
   * @description Increments the view counter on both `formsTable.views` and
   * `analyticsTable.views` atomically. Called once per unique form page load.
   * Fires the `NEW_VIEW` event to notify any active owner subscriptions.
   * @requires publicProcedure + rateLimitMiddleware
   * @output `{ success: true }`
   */
  trackView: publicProcedure
    .use(rateLimitMiddleware)
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/track-view"),
        protect: false,
        tags: TAGS,
        summary: "Track a form view",
        successDescription: "The view was tracked",
        errorResponses: { 404: "Form not found" },
      },
    })
    .input(TrackViewSchema)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input }) => {
      await responseService.trackView(input.slug);
      return { success: true };
    }),

  /**
   * @procedure getResponses
   * @description Fetches all submissions for a given `formId`. Used by the
   * `ResponsesAnalytics` component in the builder to populate charts and tables.
   * Subscribed to `NEW_SUBMISSION` events for live updates via `onNewSubmission`.
   * @requires protectedProcedure
   * @output Array of response records with `payload`, `submittedAt`, `timeToComplete`
   */
  getResponses: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/form/{formId}"),
        protect: true,
        tags: TAGS,
        summary: "Get responses for a form",
        successDescription: "List of responses",
        errorResponses: { 401: "Not authenticated" },
      },
    })
    .input(z.object({ formId: z.string() }))
    .output(z.any())
    .query(async ({ input, ctx }) => {
      return await responseService.getResponsesByFormId(input.formId, ctx.user.id, ctx.user.role === "admin");
    }),
});
