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
      return await analyticsService.getDashboardStats(input.formId, ctx.user.id);
    }),

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
      return await analyticsService.getAllResponses(input.formId, ctx.user.id, input.limit, input.offset);
    }),

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
});
