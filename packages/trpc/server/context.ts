/**
 * @file context.ts
 * @description Factory function that builds the per-request tRPC context object.
 * Called once per HTTP/WebSocket request by the tRPC adapter in `apps/api/src/index.ts`.
 *
 * The context is the shared object passed to every middleware and procedure. It contains:
 * - `req`       — Raw Node.js IncomingMessage (or Hono/Fastify equivalent)
 * - `res`       — Raw ServerResponse (used for cookie setting/clearing in auth mutations)
 * - `user`      — Resolved user object (null for unauthenticated), decoded from `parcha_session` cookie
 * - `clientIp`  — Caller IP, resolved through Vercel/Cloudflare proxy headers with fallback
 * - `country`   — ISO 3166-1 alpha-2 country code from Vercel or Cloudflare headers (nullable)
 *
 * @dependencies
 * - authService.resolveUserFromCookies (parses `parcha_session`, verifies JWT, refreshes if stale)
 * - @repo/redis.getClientIp (proxy-aware IP extraction utility)
 */
import { authService } from "./services";

import { getClientIp } from "@repo/redis";

export async function createContext({ req, res }: { req: any; res: any } | any) {
  const user = await authService.resolveUserFromCookies(req, res);
  const clientIp = getClientIp(req?.headers, req?.socket?.remoteAddress || req?.ip);
  const country = req?.headers?.["x-vercel-ip-country"] || req?.headers?.["cf-ipcountry"] || null;

  return { req, res, user, clientIp, country };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
