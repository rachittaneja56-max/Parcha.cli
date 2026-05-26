import { TRPCError } from "@trpc/server";
import { tRPCContext } from "../trpc";
import { createRateLimiter } from "@repo/redis";

// Allow 50 requests per 10 minutes
const ratelimit = createRateLimiter(50, "10 m");

export const rateLimitMiddleware = tRPCContext.middleware(async ({ ctx, next, input }) => {
  let identifier = ctx.clientIp as string;
  
  if (input && typeof input === "object" && "fingerprint" in input && typeof input.fingerprint === "string") {
    identifier = input.fingerprint;
  }

  try {
    const { success } = await ratelimit.limit(`trpc-ratelimit:${identifier}`);
    
    if (!success) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Rate limit exceeded. Try again later.",
      });
    }
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    console.error("Redis ratelimit error:", error);
  }

  return next();
});
