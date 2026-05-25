import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";

import { createContext } from "./context";

export const tRPCContext = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createContext>()
  .create({});

const csrfMiddleware = tRPCContext.middleware(({ ctx, type, next }) => {
  if (type === "mutation") {
    if (!ctx.req?.headers?.["x-csrf-token"]) {
      throw new TRPCError({ code: "FORBIDDEN", message: "CSRF token missing or invalid" });
    }
  }
  return next();
});

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure.use(csrfMiddleware);

export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const verifiedProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.user.emailVerified) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Email verification required." });
  }
  return next({
    ctx,
  });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== "admin") {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authorized as admin" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
