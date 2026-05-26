import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (req, res) => {
  return res.json({ message: "Parcha95 is up and running..." });
});

healthRouter.get("/health", (req, res) => {
  return res.json({ message: "Parcha95 server is healthy", healthy: true });
});
