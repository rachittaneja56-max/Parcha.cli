import { TRPCError } from "@trpc/server";
import { authService } from "./services";

export async function createContext({ req, res }: { req: any; res: any } | any) {
  let user = null;
  if (req?.headers?.cookie) {
    const cookies = req.headers.cookie.split(";").map((c: string) => c.trim());
    const sessionCookieStr = cookies.find((c: string) => c.startsWith("parcha_session="));
    
    if (sessionCookieStr) {
      const tokenStr = sessionCookieStr.substring("parcha_session=".length);
      const [accessToken, refreshToken] = tokenStr.split(":::");
      
      try {
        user = await authService.verifySession(accessToken);
      } catch (e) {
        user = null;
      }

      if (!user && refreshToken) {
        try {
          const result = await authService.refreshSession(refreshToken);
          user = result.user;
          if (res && typeof res.setHeader === "function") {
            const isProd = process.env.NODE_ENV === "production";
            const sec = isProd ? "Secure; " : "";
            const cookiesArr = res.getHeader("Set-Cookie") ? (Array.isArray(res.getHeader("Set-Cookie")) ? res.getHeader("Set-Cookie") : [res.getHeader("Set-Cookie")]) : [];
            res.setHeader("Set-Cookie", [
              ...cookiesArr,
              `parcha_session=${result.tokens.accessToken}:::${result.tokens.refreshToken}; HttpOnly; ${sec}Path=/; Max-Age=604800; SameSite=Lax`
            ]);
          }
        } catch (e) {
          user = null;
        }
      }
    }
  }
  const clientIp = req?.headers?.["x-forwarded-for"] || req?.socket?.remoteAddress || req?.ip || "unknown";
  return { req, res, user, clientIp };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
