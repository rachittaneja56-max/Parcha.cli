/**
 * @file route.ts (Auth Router)
 * @description Handles all authentication flows for Parcha95 users.
 * Supports native email/password auth and Google OAuth. All auth state is
 * communicated via the `parcha_session` HttpOnly cookie (access + refresh token
 * concatenated with `:::`), which is set or cleared on every auth mutation.
 *
 * Cookie format: `parcha_session=<accessToken>:::<refreshToken>`
 * Cookie lifetime: 7 days (604800 seconds). SameSite=Lax, HttpOnly.
 *
 * Error handling is centralised through `mapAuthError`, which converts
 * `AuthError` domain errors into typed TRPCErrors.
 *
 * @dependencies
 * - authService (all auth business logic: hashing, JWT, email verification, OAuth)
 * - @repo/validators (Zod schemas for all inputs)
 * - @repo/services/auth/errors (AuthError domain error class)
 */
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
    `parcha_session=${accessToken}:::${refreshToken}; HttpOnly; ${sec}Path=/; Max-Age=604800; SameSite=Lax`
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

  /**
   * @procedure googleCallback
   * @description Handles the OAuth 2.0 redirect from Google after user consent.
   * Exchanges the `code` parameter for tokens, creates or retrieves the user account,
   * sets the `parcha_session` cookie, and redirects to `/dashboard` (or `state` path).
   * On failure, redirects to `/?login=error` with an encoded error message.
   * @requires publicProcedure
   */
  googleCallback: publicProcedure
    .meta({ openapi: { method: "GET", path: "/auth/callback/google", protect: false, tags: TAGS } })
    .input(GoogleCallbackSchema)
    .output(z.any())
    .query(async ({ input, ctx }) => {
      try {
        const result = await authService.handleGoogleCallback(input.code);
        if (ctx?.res) {
          setAuthCookies(ctx.res, result.accessToken, result.refreshToken);
          let redirectUrl = `${env.FRONTEND_URL}/dashboard`;
          if (input.state && input.state.startsWith("/") && !input.state.startsWith("/auth/")) {
            redirectUrl = `${env.FRONTEND_URL}${input.state}`;
          }
          ctx.res.redirect(redirectUrl);
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

  /**
   * @procedure register
   * @description Registers a new user with email, password (bcrypt-hashed), and full name.
   * On success: creates a user row, sends a verification email, creates JWT tokens,
   * sets the `parcha_session` cookie, and returns `{ success, user, accessToken, refreshToken }`.
   * @requires publicProcedure
   */
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

  /**
   * @procedure login
   * @description Authenticates a user by email and bcrypt-compared password.
   * On success: generates a new token pair, sets the `parcha_session` cookie.
   * Throws UNAUTHORIZED (via AuthError → mapAuthError) on bad credentials.
   * @requires publicProcedure
   */
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

  /**
   * @procedure verifyEmail
   * @description Consumes a verification token (from `tokensTable`) and marks
   * the user's `emailVerified = true`. Token is deleted after use.
   * @requires publicProcedure
   */
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

  /**
   * @procedure forgotPassword
   * @description Generates a `password_reset` token, stores it in `tokensTable`,
   * and sends a reset link to the user's email via the email service.
   * Always returns `{ success: true }` to prevent user enumeration.
   * @requires publicProcedure
   */
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

  /**
   * @procedure resetPassword
   * @description Validates the `password_reset` token from `tokensTable`, hashes
   * the new password, updates the user row, and deletes the consumed token.
   * @requires publicProcedure
   */
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

  /**
   * @procedure me
   * @description Returns the currently authenticated user from the tRPC context.
   * The context is populated by `createContext` → `authService.resolveUserFromCookies`.
   * Returns `{ success: true, user: null }` for unauthenticated requests (no throw).
   * @requires publicProcedure (guest-safe)
   */
  me: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/me"), protect: false, tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.any())
    .query(({ ctx }) => {
      return { success: true, user: ctx.user };
    }),

  /**
   * @procedure logout
   * @description Clears the `parcha_session` cookie by setting Max-Age=0.
   * This is a soft logout — the JWT remains valid until natural expiry,
   * but without the cookie the client is treated as unauthenticated.
   * @requires publicProcedure
   */
  logout: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/logout"), protect: false, tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.any())
    .mutation(async ({ ctx }) => {
      if (ctx?.res && typeof ctx.res.setHeader === "function") {
        const isProd = process.env.NODE_ENV === "production";
        const sec = isProd ? "Secure; " : "";
        ctx.res.setHeader("Set-Cookie", [
          `parcha_session=; HttpOnly; ${sec}Path=/; Max-Age=0; SameSite=Lax`
        ]);
      }
      return { success: true };
    }),
});
