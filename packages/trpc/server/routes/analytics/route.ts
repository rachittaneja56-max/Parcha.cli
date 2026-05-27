/**
 * @file route.ts (Analytics Router)
 * @description Provides per-form analytics data and real-time WebSocket subscriptions
 * for the form builder analytics panel (`ResponsesAnalytics.tsx`).
 *
 * Real-time subscriptions use the `appEventBus` (Node.js EventEmitter) as a pub/sub
 * channel. Events are emitted by `responseService` on every submit/view, and consumed
 * here to push live updates to the subscribed client via tRPC's observable API.
 *
 * Subscriptions (`onNewSubmission`, `onNewView`) are WebSocket-only — they use the
 * tRPC WebSocket transport configured in `apps/api/src/index.ts`.
 *
 * @dependencies
 * - analyticsService (aggregates stats, paginates responses with ownership check)
 * - appEventBus (@repo/services/events — in-memory EventEmitter, not Redis pub/sub)
 * - @repo/validators (GetDashboardAnalyticsSchema, GetAllResponsesSchema)
 */
import { z } from "zod";

import { router, protectedProcedure } from "../../trpc";
import { analyticsService } from "../../services";
import { GetDashboardAnalyticsSchema, GetAllResponsesSchema } from "@repo/validators";
import { observable } from "@trpc/server/observable";
import { appEventBus } from "@repo/services/events";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Analytics"];
const getPath = generatePath("/analytics");

export const analyticsRouter = router({
  /**
   * @procedure getDashboardStats
   * @description Returns aggregated analytics for a form: views, total responses,
   * conversion rate, bounce rate, and a 7-day response volume time series.
   * Admins can query stats for any form; owners are restricted to their own.
   * @requires protectedProcedure
   * @output `{ views, totalResponses, conversionRate, bounceRate, chartData[] }`
   */
  getDashboardStats: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/dashboard/{formId}"),
        protect: true,
        tags: TAGS,
        summary: "Get dashboard analytics",
        successDescription: "Analytics for the requested form",
        errorResponses: { 401: "Not authenticated", 404: "Form not found" },
      },
    })
    .input(GetDashboardAnalyticsSchema)
    .output(z.any())
    .query(async ({ input, ctx }) => {
      return await analyticsService.getDashboardStats(input.formId, ctx.user.id, ctx.user.role === "admin");
    }),

  /**
   * @procedure getAllResponses
   * @description Returns paginated response records for a form.
   * Supports `limit` and `offset` for cursor-style pagination.
   * Ownership is enforced — users can only access their own form responses unless admin.
   * @requires protectedProcedure
   * @output Array of response rows with `payload`, `submittedAt`, `timeToComplete`, `country`
   */
  getAllResponses: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/responses/{formId}"),
        protect: true,
        tags: TAGS,
        summary: "List form responses",
        successDescription: "Responses for the requested form",
        errorResponses: { 401: "Not authenticated", 404: "Form not found" },
      },
    })
    .input(GetAllResponsesSchema)
    .output(z.any())
    .query(async ({ input, ctx }) => {
      return await analyticsService.getAllResponses(input.formId, ctx.user.id, input.limit, input.offset, ctx.user.role === "admin");
    }),

  /**
   * @procedure onNewSubmission
   * @description WebSocket subscription that emits a real-time event whenever a new
   * response is submitted to the specified `formId`. Listens to the in-memory
   * `appEventBus` for `NEW_SUBMISSION` events emitted by `responseService.submitResponse`.
   * Used by `ResponsesAnalytics.tsx` to live-refresh response tables without polling.
   * @requires protectedProcedure (WebSocket transport only)
   * @output Stream of new response payloads
   */
  onNewSubmission: protectedProcedure
    .input(GetDashboardAnalyticsSchema)
    .subscription(({ input, ctx }) => {
      return observable<any>((emit) => {
        const onNewSubmission = (data: { formId: string; payload: any }) => {
          if (data.formId === input.formId) {
            emit.next(data.payload);
          }
        };

        appEventBus.on("NEW_SUBMISSION", onNewSubmission);

        return () => {
          appEventBus.off("NEW_SUBMISSION", onNewSubmission);
        };
      });
    }),

  /**
   * @procedure onNewView
   * @description WebSocket subscription that emits whenever a new view is tracked
   * for the specified `formId`. Listens for `NEW_VIEW` events on `appEventBus`.
   * Used by `ResponsesAnalytics.tsx` to live-update the view counter in the stat cards.
   * @requires protectedProcedure (WebSocket transport only)
   * @output Stream of `{ formId }` view events
   */
  onNewView: protectedProcedure
    .input(GetDashboardAnalyticsSchema)
    .subscription(({ input }) => {
      return observable<any>((emit) => {
        const onNewView = (data: { formId: string }) => {
          if (data.formId === input.formId) {
            emit.next(data);
          }
        };

        appEventBus.on("NEW_VIEW", onNewView);

        return () => {
          appEventBus.off("NEW_VIEW", onNewView);
        };
      });
    }),
});
