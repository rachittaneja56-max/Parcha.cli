import { TRPCError } from "@trpc/server";
import { tRPCContext } from "../trpc";
import { createRateLimiter, getClientIp } from "@repo/redis";

const ratelimit = createRateLimiter(50, "10 m");

const getRateLimitIdentifier = (ctx: {
  user?: { id: string } | null;
  req?: any;
  clientIp?: string;
}) => {
  if (ctx.user?.id) return `user:${ctx.user.id}`;
  return `ip:${getClientIp(ctx.req?.headers, ctx.clientIp)}`;
};

export const rateLimitMiddleware = tRPCContext.middleware(async ({ ctx, next }) => {
  const identifier = getRateLimitIdentifier(ctx);
  try {
    const { success, limit, remaining, reset } = await ratelimit.limit(
      `trpc-ratelimit:${identifier}`,
    );

    if (ctx.res && typeof ctx.res.setHeader === "function") {
      ctx.res.setHeader("X-RateLimit-Limit", String(limit));
      ctx.res.setHeader("X-RateLimit-Remaining", String(remaining));
      ctx.res.setHeader("X-RateLimit-Reset", String(reset));
    }

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
