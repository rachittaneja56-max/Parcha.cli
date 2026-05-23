import { authService } from "./services";

export async function createContext({ req, res }: { req: any; res: any } | any) {
  let user = null;
  if (req?.headers?.cookie) {
    const cookies = req.headers.cookie.split(";").map((c: string) => c.trim());
    const sessionCookie = cookies.find((c: string) => c.startsWith("parcha_session="));
    if (sessionCookie) {
      const token = sessionCookie.split("=")[1];
      try {
        user = await authService.verifySession(token);
      } catch (e) {
      }
    }
  }
  const clientIp = req?.headers?.["x-forwarded-for"] || req?.socket?.remoteAddress || req?.ip || "unknown";
  return { req, res, user, clientIp };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
