import { z } from "zod";
import { zodUndefinedModel } from "@repo/validators";
import { authService } from "../../services";
import { env } from "@repo/services/env";
import { getAuthenticationMethodOutputSchema } from "@repo/services/user/model";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { TRPCError } from "@trpc/server";
import { AuthError } from "@repo/services/auth/errors";
import {
  RegisterSchema,
  LoginSchema,
  VerifyEmailSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  GoogleCallbackSchema
} from "@repo/validators";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

const setAuthCookies = (res: any, accessToken: string, refreshToken: string) => {
  if (!res || typeof res.setHeader !== "function") return;
  const isProd = process.env.NODE_ENV === "production";
  const sec = isProd ? "Secure; " : "";
  const cookiesArr = res.getHeader("Set-Cookie") ? (Array.isArray(res.getHeader("Set-Cookie")) ? res.getHeader("Set-Cookie") : [res.getHeader("Set-Cookie")]) : [];
  res.setHeader("Set-Cookie", [
    ...cookiesArr,
    `parcha_access_token=${accessToken}; HttpOnly; ${sec}Path=/; Max-Age=900; SameSite=Lax`,
    `parcha_refresh_token=${refreshToken}; HttpOnly; ${sec}Path=/; Max-Age=604800; SameSite=Lax`
  ]);
};

const mapAuthError = (error: any) => {
  if (error instanceof AuthError) {
    throw new TRPCError({ code: error.code as any, message: error.message });
  }
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message || "Unknown error" });
};

export const authRouter = router({
  getSupportedAuthenticationProviders: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/supported-providers"), protect: false, tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.readonly(z.array(getAuthenticationMethodOutputSchema)))
    .query(async () => {
      return await authService.getAuthenticationMethods();
    }),

  googleCallback: publicProcedure
    .meta({ openapi: { method: "GET", path: "/authentication/google-callback", protect: false, tags: TAGS } })
    .input(GoogleCallbackSchema)
    .output(z.any())
    .query(async ({ input, ctx }) => {
      try {
        const result = await authService.handleGoogleCallback(input.code);
        if (ctx?.res) {
          setAuthCookies(ctx.res, result.accessToken, result.refreshToken);
          ctx.res.redirect(`${env.FRONTEND_URL}/dashboard`);
          return { success: true, redirecting: true };
        }
        return { success: true, user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken };
      } catch (error: any) {
        if (ctx?.res) {
          ctx.res.redirect(`${env.FRONTEND_URL}/?login=error&message=` + encodeURIComponent(error?.message || "Unknown error"));
          return { success: false, redirecting: true };
        }
        mapAuthError(error);
      }
    }),

  register: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/register"), protect: false, tags: TAGS } })
    .input(RegisterSchema)
    .output(z.any())
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await authService.registerNative(input.email, input.password, input.fullName);
        const tokens = authService.createTokens(user.id);
        setAuthCookies(ctx?.res, tokens.accessToken, tokens.refreshToken);
        return { success: true, user, ...tokens };
      } catch (error: any) {
        mapAuthError(error);
      }
    }),

  login: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/login"), protect: false, tags: TAGS } })
    .input(LoginSchema)
    .output(z.any())
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await authService.loginNative(input.email, input.password);
        setAuthCookies(ctx?.res, result.accessToken, result.refreshToken);
        return { success: true, user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken };
      } catch (error: any) {
        mapAuthError(error);
      }
    }),

  verifyEmail: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/verify-email"), protect: false, tags: TAGS } })
    .input(VerifyEmailSchema)
    .output(z.any())
    .mutation(async ({ input }) => {
      try {
        await authService.verifyEmail(input.token);
        return { success: true };
      } catch (error: any) {
        mapAuthError(error);
      }
    }),

  verify: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/authentication/verify",
        protect: false,
        tags: TAGS,
      },
    })
    .input(z.object({ token: z.string() }))
    .output(z.any())
    .query(async ({ input, ctx }) => {
      try {
        await authService.verifyEmail(input.token);
        if (ctx?.res) {
          ctx.res.redirect(env.FRONTEND_URL);
          return { success: true, redirecting: true };
        }
        return { success: true };
      } catch (error: any) {
        if (ctx?.res) {
          ctx.res.redirect(`${env.FRONTEND_URL}/auth/login?error=` + encodeURIComponent(error?.message || "Invalid or expired token"));
          return { success: false, redirecting: true };
        }
        mapAuthError(error);
      }
    }),

  forgotPassword: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/forgot-password"), protect: false, tags: TAGS } })
    .input(ForgotPasswordSchema)
    .output(z.any())
    .mutation(async ({ input }) => {
      try {
        await authService.forgotPassword(input.email);
        return { success: true };
      } catch (error: any) {
        mapAuthError(error);
      }
    }),

  resetPassword: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/reset-password"), protect: false, tags: TAGS } })
    .input(ResetPasswordSchema)
    .output(z.any())
    .mutation(async ({ input }) => {
      try {
        await authService.resetPassword(input.token, input.newPassword);
        return { success: true };
      } catch (error: any) {
        mapAuthError(error);
      }
    }),

  me: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/me"), protect: false, tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.any())
    .query(({ ctx }) => {
      return { success: true, user: ctx.user };
    }),

  logout: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/logout"), protect: true, tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.any())
    .mutation(async ({ ctx }) => {
      if (ctx?.res && typeof ctx.res.setHeader === "function") {
        const isProd = process.env.NODE_ENV === "production";
        const sec = isProd ? "Secure; " : "";
        ctx.res.setHeader("Set-Cookie", [
          `parcha_access_token=; HttpOnly; ${sec}Path=/; Max-Age=0; SameSite=Lax`,
          `parcha_refresh_token=; HttpOnly; ${sec}Path=/; Max-Age=0; SameSite=Lax`
        ]);
      }
      return { success: true };
    }),
});
