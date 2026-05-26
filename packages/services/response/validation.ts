import { z } from "zod";

type ResponseField = {
  id?: unknown;
  required?: unknown;
};

export const createResponsePayloadSchema = (schema: unknown) => {
  const schemaShape: Record<string, z.ZodTypeAny> = {};
  const fields = Array.isArray(schema) ? (schema as ResponseField[]) : [];

  for (const field of fields) {
    if (typeof field.id !== "string") continue;

    schemaShape[field.id] = field.required
      ? z.any().refine((value) => value !== undefined && value !== null && value !== "", {
          message: `Field ${field.id} is required`,
        })
      : z.any().optional();
  }

  return z.object(schemaShape);
};
