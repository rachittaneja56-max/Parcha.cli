import express from "express";
import { logger } from "@repo/logger";

import * as trpcExpress from "@trpc/server/adapters/express";
import { createOpenApiExpressMiddleware } from "trpc-to-openapi";

import { serverRouter, createContext } from "@repo/trpc/server";
import { openApiDocument } from "@repo/trpc/server/openapi";

import { env } from "./env";

import { securityRouter } from "./middlewares/security";
import { globalRateLimitMiddleware, authRateLimitMiddleware } from "./middlewares/rateLimit";
import { healthRouter } from "./routes/health";

export const app = express();

app.set("trust proxy", 1);

app.use(securityRouter);

app.use(globalRateLimitMiddleware);

app.use(/^\/trpc\/auth\.(login|register|forgotPassword|resetPassword|verifyEmail|logout)/, authRateLimitMiddleware);

app.use(express.json());

app.use(healthRouter);

logger.debug(`openapi.json: ${env.BASE_URL}/api/openapi.json`);
app.get("/api/openapi.json", (req, res) => {
  return res.json(openApiDocument);
});

logger.debug(`docs: ${env.BASE_URL}/docs`);
app.use("/docs", async (req, res, next) => {
  try {
    const { apiReference } = await (new Function('return import("@scalar/express-api-reference")'))();
    apiReference({ url: "/api/openapi.json" })(req, res, next);
  } catch (error) {
    next(error);
  }
});

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

export default app;
