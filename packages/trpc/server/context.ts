import { TRPCError } from "@trpc/server";
import { authService } from "./services";

export async function createContext({ req, res }: { req: any; res: any } | any) {
  // 1. Resolve user session cleanly
  const user = await authService.resolveUserFromCookies(req, res);

  // 2. Safely resolve client IP, trusting proxy headers first
  const clientIp = 
    req?.headers?.["x-forwarded-for"]?.split(",")?.[0]?.trim() || 
    req?.socket?.remoteAddress || 
    req?.ip || 
    "unknown";

  return { req, res, user, clientIp };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
