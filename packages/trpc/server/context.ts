import { TRPCError } from "@trpc/server";
import { authService } from "./services";

export async function createContext({ req, res }: { req: any; res: any } | any) {
  let user = null;
  if (req?.headers?.cookie) {
    const cookies = req.headers.cookie.split(";").map((c: string) => c.trim());
    const accessCookie = cookies.find((c: string) => c.startsWith("parcha_access_token="));
    const refreshCookie = cookies.find((c: string) => c.startsWith("parcha_refresh_token="));
    
    if (accessCookie) {
      const token = accessCookie.substring("parcha_access_token=".length);
      try {
        user = await authService.verifySession(token);
      } catch (e) {
        user = null;
      }
    }

    if (!user && refreshCookie) {
      const token = refreshCookie.substring("parcha_refresh_token=".length);
      try {
        const result = await authService.refreshSession(token);
        user = result.user;
        if (res && typeof res.setHeader === "function") {
          const isProd = process.env.NODE_ENV === "production";
          const sec = isProd ? "Secure; " : "";
          const cookiesArr = res.getHeader("Set-Cookie") ? (Array.isArray(res.getHeader("Set-Cookie")) ? res.getHeader("Set-Cookie") : [res.getHeader("Set-Cookie")]) : [];
          res.setHeader("Set-Cookie", [
            ...cookiesArr,
            `parcha_access_token=${result.tokens.accessToken}; HttpOnly; ${sec}Path=/; Max-Age=900; SameSite=Lax`,
            `parcha_refresh_token=${result.tokens.refreshToken}; HttpOnly; ${sec}Path=/; Max-Age=604800; SameSite=Lax`
          ]);
        }
      } catch (e) {
        user = null;
      }
    }
  }
  const clientIp = req?.headers?.["x-forwarded-for"] || req?.socket?.remoteAddress || req?.ip || "unknown";
  return { req, res, user, clientIp };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
