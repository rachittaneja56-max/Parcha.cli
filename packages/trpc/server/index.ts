/**
 * @file index.ts (tRPC Server Root)
 * @description Assembles the root `serverRouter` by merging all domain sub-routers.
 * This is the single entrypoint imported by `apps/api/src/index.ts` to mount the
 * full tRPC API. The router tree is:
 *
 *   serverRouter
 *   ├── health    → healthRouter   (simple liveness probe)
 *   ├── auth      → authRouter     (register, login, OAuth, session management)
 *   ├── form      → formRouter     (CRUD, schema/settings updates, public gallery)
 *   ├── response  → responseRouter (submit, trackView, getResponses)
 *   ├── analytics → analyticsRouter (stats, paginated responses, WS subscriptions)
 *   └── admin     → adminRouter    (telemetry, moderation, password — admin-only)
 *
 * The inferred `ServerRouter` type is re-exported and used by the Next.js client
 * (`apps/web/trpc/client.ts`) to provide end-to-end type safety with zero codegen.
 */
import { healthRouter } from "./routes/health/route";

import { authRouter } from "./routes/auth/route";
import { formRouter } from "./routes/form/route";
import { responseRouter } from "./routes/response/route";
import { analyticsRouter } from "./routes/analytics/route";
import { adminRouter } from "./routes/admin/route";
import { router } from "./trpc";

export const serverRouter = router({
  health: healthRouter,
  auth: authRouter,
  form: formRouter,
  response: responseRouter,
  analytics: analyticsRouter,
  admin: adminRouter,
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
