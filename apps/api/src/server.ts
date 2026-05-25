import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import * as trpcExpress from "@trpc/server/adapters/express";
import { createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { serverRouter, createContext } from "@repo/trpc/server";
import { openApiDocument } from "@repo/trpc/server/openapi";

import { env } from "./env";

export const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
      },
    },
  }),
);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(/^\/trpc\/auth\.(login|register|forgotPassword|resetPassword|verifyEmail|logout)/, authLimiter);


if (env.NODE_ENV !== "prod") {
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
}

app.use(express.json());

app.use((req, res, next) => {
  if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    if (!req.headers["x-csrf-token"]) {
      return res.status(403).json({ error: "Missing CSRF token header" });
    }
  }
  next();
});

app.get("/", (req, res) => {
  return res.json({ message: "Parcha95 is up and running..." });
});

app.get("/health", (req, res) => {
  return res.json({ message: "Parcha95 server is healthy", healthy: true });
});

logger.debug(`openapi.json: ${env.BASE_URL}/api/openapi.json`);
app.get("/api/openapi.json", (req, res) => {
  return res.json(openApiDocument);
});

logger.debug(`docs: ${env.BASE_URL}/docs`);
app.use("/docs", apiReference({ url: "/api/openapi.json" }));

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
