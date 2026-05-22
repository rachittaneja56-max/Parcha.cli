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
