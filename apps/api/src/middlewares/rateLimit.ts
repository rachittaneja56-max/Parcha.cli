import { Request, Response, NextFunction } from "express";
import { createRateLimiter } from "@repo/redis";

const globalLimiter = createRateLimiter(1000, "15 m");
const authLimiter = createRateLimiter(10, "15 m");


const upstashRateLimitWrapper = (limiter: ReturnType<typeof createRateLimiter>, prefix: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.headers["x-forwarded-for"] || req.ip || "unknown-ip";
    
    try {
      const { success, limit, remaining, reset } = await limiter.limit(`${prefix}:${identifier}`);
      
      res.setHeader("X-RateLimit-Limit", limit.toString());
      res.setHeader("X-RateLimit-Remaining", remaining.toString());
      res.setHeader("X-RateLimit-Reset", reset.toString());

      if (!success) {
        return res.status(429).json({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Try again later."
        });
      }
      
      next();
    } catch (error) {
      console.error(`Express Ratelimit Error (${prefix}):`, error);
      next();
    }
  };
};

export const globalRateLimitMiddleware = upstashRateLimitWrapper(globalLimiter, "express-global");
export const authRateLimitMiddleware = upstashRateLimitWrapper(authLimiter, "express-auth");
