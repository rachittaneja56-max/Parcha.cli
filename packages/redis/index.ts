import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

type RateLimiter = {
  limit: (identifier: string) => Promise<RateLimitResult>;
};

type CacheEntry = {
  expiresAt: number;
  value: unknown;
};

const memoryRateLimitStore = new Map<string, { count: number; reset: number }>();
const memoryCache = new Map<string, CacheEntry>();

const hasRedisEnv = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

export const redis = hasRedisEnv ? Redis.fromEnv() : null;

const parseWindowMs = (windowString: Parameters<typeof Ratelimit.slidingWindow>[1]) => {
  const match = String(windowString)
    .trim()
    .match(/^(\d+)\s*([smhd])$/);
  if (!match) return 60_000;

  const value = Number(match[1]);
  const unit = match[2];
  const multipliers = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 };

  return value * multipliers[unit as keyof typeof multipliers];
};

const limitInMemory = (
  identifier: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult => {
  const now = Date.now();
  const existing = memoryRateLimitStore.get(identifier);
  const current = existing && existing.reset > now ? existing : { count: 0, reset: now + windowMs };
  const nextCount = current.count + 1;

  memoryRateLimitStore.set(identifier, { count: nextCount, reset: current.reset });

  return {
    success: nextCount <= maxRequests,
    limit: maxRequests,
    remaining: Math.max(maxRequests - nextCount, 0),
    reset: current.reset,
  };
};

export const createRateLimiter = (
  maxRequests: number,
  windowString: Parameters<typeof Ratelimit.slidingWindow>[1],
): RateLimiter => {
  const windowMs = parseWindowMs(windowString);
  const upstashLimiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(maxRequests, windowString),
        analytics: true,
        ephemeralCache: new Map(),
      })
    : null;

  return {
    async limit(identifier: string) {
      if (!upstashLimiter) {
        return limitInMemory(identifier, maxRequests, windowMs);
      }

      try {
        return await upstashLimiter.limit(identifier);
      } catch {
        return limitInMemory(identifier, maxRequests, windowMs);
      }
    },
  };
};

const readHeader = (
  headers: Record<string, string | string[] | undefined> | undefined,
  headerName: string,
) => {
  const value = headers?.[headerName] ?? headers?.[headerName.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
};

export const getClientIp = (
  headers: Record<string, string | string[] | undefined> | undefined,
  fallback = "unknown-ip",
) => {
  const forwardedFor = readHeader(headers, "x-forwarded-for");
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();
  const realIp = readHeader(headers, "x-real-ip")?.trim();

  return firstForwardedIp || realIp || fallback || "unknown-ip";
};

const getMemoryCache = <T>(key: string) => {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value as T;
};

export const getCache = async <T>(key: string) => {
  if (redis) {
    try {
      const cached = await redis.get<T>(key);
      if (cached !== null && cached !== undefined) return cached;
    } catch {
      return getMemoryCache<T>(key);
    }
  }

  return getMemoryCache<T>(key);
};

export const setCache = async <T>(key: string, value: T, ttlSeconds: number) => {
  const expiresAt = Date.now() + ttlSeconds * 1_000;
  memoryCache.set(key, { value, expiresAt });

  if (!redis) return;

  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch {
    return;
  }
};

export const delCache = async (key: string) => {
  memoryCache.delete(key);

  if (!redis) return;

  try {
    await redis.del(key);
  } catch {
    return;
  }
};
