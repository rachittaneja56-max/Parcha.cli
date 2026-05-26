import { authService } from "./services";
import { getClientIp } from "@repo/redis";

export async function createContext({ req, res }: { req: any; res: any } | any) {
  const user = await authService.resolveUserFromCookies(req, res);
  const clientIp = getClientIp(req?.headers, req?.socket?.remoteAddress || req?.ip);

  return { req, res, user, clientIp };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
