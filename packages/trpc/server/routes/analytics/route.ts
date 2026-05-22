import { router, protectedProcedure } from "../../trpc";
import { analyticsService } from "../../services";
import { GetDashboardAnalyticsSchema, GetAllResponsesSchema } from "@repo/validators";
import { observable } from "@trpc/server/observable";
import { appEventBus } from "@repo/services/events";

export const analyticsRouter = router({
  getDashboardStats: protectedProcedure
    .input(GetDashboardAnalyticsSchema)
    .query(async ({ input, ctx }) => {
      return await analyticsService.getDashboardStats(input.formId, ctx.user.id);
    }),

  getAllResponses: protectedProcedure
    .input(GetAllResponsesSchema)
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
