import { z } from "zod";
import { zodUndefinedModel } from "@repo/validators";
import { authService } from "../../services";
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

const getCookieString = (token: string) => {
  const isProd = process.env.NODE_ENV === "production";
  return `parcha_session=${token}; ${isProd ? "HttpOnly; Secure; " : ""}Path=/; Max-Age=604800; SameSite=Lax`;
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
          ctx.res.setHeader("Set-Cookie", getCookieString(result.token));
          ctx.res.redirect("http://localhost:3000/dashboard");
          return { success: true, redirecting: true };
        }
        return { success: true, user: result.user, token: result.token };
      } catch (error: any) {
        if (ctx?.res) {
          ctx.res.redirect("http://localhost:3000/?login=error&message=" + encodeURIComponent(error?.message || "Unknown error"));
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
        const token = authService.createSessionToken(user.id);
        if (ctx?.res) {
          ctx.res.setHeader("Set-Cookie", getCookieString(token));
        }
        return { success: true, user, token };
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
        if (ctx?.res) {
          ctx.res.setHeader("Set-Cookie", getCookieString(result.token));
        }
        return { success: true, user: result.user, token: result.token };
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

  me: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/me"), protect: true, tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.any())
    .query(({ ctx }) => {
      return { success: true, user: ctx.user };
    }),

  logout: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/logout"), protect: false, tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.any())
    .mutation(async ({ ctx }) => {
      if (ctx?.res) {
        ctx.res.setHeader("Set-Cookie", `parcha_session=; Path=/; Max-Age=0; SameSite=Lax`);
      }
      return { success: true };
    }),
});
