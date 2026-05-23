import { TRPCError } from "@trpc/server";
import { tRPCContext } from "../trpc";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export const rateLimitMiddleware = tRPCContext.middleware(async ({ ctx, next, input }) => {
  let identifier = ctx.clientIp as string;
  
  if (input && typeof input === "object" && "fingerprint" in input && typeof input.fingerprint === "string") {
    identifier = input.fingerprint;
  }

  const now = Date.now();
  const windowTime = 10 * 60 * 1000; 

  const record = rateLimitMap.get(identifier);

  if (record && record.resetAt > now) {
    if (record.count >= 3) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Rate limit exceeded. Try again in 10 minutes.",
      });
    }
    record.count += 1;
  } else {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowTime });
  }

  return next();
});
