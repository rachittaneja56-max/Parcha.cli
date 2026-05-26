import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const getRedisClient = () => {
  try {
    return Redis.fromEnv();
  } catch (error) {
    console.warn("UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is missing. Redis commands will fail.");
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL ,
      token: process.env.UPSTASH_REDIS_REST_TOKEN ,
    });
  }
};

export const redis = getRedisClient();

/**
 * 
 * @param maxRequests
 * @param windowString 
 */
export const createRateLimiter = (maxRequests: number, windowString: Parameters<typeof Ratelimit.slidingWindow>[1]) => {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, windowString),
    analytics: true,
    ephemeralCache: new Map(),
  });
};
