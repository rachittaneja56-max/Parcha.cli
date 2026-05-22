import { z } from "zod";

export const SubmitResponseSchema = z.object({
  slug: z.string(),
  payload: z.record(z.string(), z.any()),
  honeypotField: z.string().optional(),
  fingerprint: z.string().optional(),
});

export const TrackViewSchema = z.object({
  slug: z.string(),
});
