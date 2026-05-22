import { z } from "zod";
import { zodUndefinedModel } from "@repo/validators";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Health"];
const getPath = generatePath("/health");

const HealthOutputSchema = z.object({
  message: z.string().describe("health check message"),
  healthy: z.boolean().describe("whether the server is healthy"),
  status: z.literal("healthy").describe("status of the server"),
});

export const healthRouter = router({
  getHealth: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(HealthOutputSchema)
    .query(async () => {
      return {
        message: "Parcha.cli server is healthy",
        healthy: true,
        status: "healthy",
      };
    }),
});
