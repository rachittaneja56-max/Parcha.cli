import { z } from "zod";
import { router, publicProcedure } from "../../trpc";
import { responseService } from "../../services";
import { SubmitResponseSchema, TrackViewSchema } from "@repo/validators";
import { generatePath } from "../../utils/path-generator";
import { rateLimitMiddleware } from "../../middlewares/rateLimit";

const TAGS = ["Responses"];
const getPath = generatePath("/responses");

export const responseRouter = router({
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
    .mutation(async ({ input }) => {
      return await responseService.submitResponse(
        input.slug,
        input.payload,
        input.honeypotField,
        input.fingerprint
      );
    }),

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
});
