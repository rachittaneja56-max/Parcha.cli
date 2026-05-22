import { z } from "zod";

export const GetDashboardAnalyticsSchema = z.object({
  formId: z.string().uuid().describe("The unique identifier of the form to fetch analytics for"),
});

export const GetAllResponsesSchema = z.object({
  formId: z.string().uuid().describe("The unique identifier of the form"),
  limit: z.number().int().positive().default(100).describe("Maximum number of responses to return (for pagination)"),
  offset: z.number().int().nonnegative().default(0).describe("Number of responses to skip (for pagination)"),
});
