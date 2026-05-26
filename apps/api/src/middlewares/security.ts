import cors from "cors";
import helmet from "helmet";
import { Request, Response, NextFunction, Router } from "express";
import { env } from "../env";

export const securityRouter = Router();

securityRouter.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
      },
    },
  })
);

if (env.NODE_ENV !== "prod") {
  securityRouter.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
}

securityRouter.use((req: Request, res: Response, next: NextFunction) => {
  if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    if (!req.headers["x-csrf-token"]) {
      return res.status(403).json({ error: "Missing CSRF token header" });
    }
  }
  next();
});
