import { z } from "zod";
import { FieldSchema, type FieldSchemaType } from "@repo/validators";

export const fieldSchemaArray = z.array(FieldSchema);

export const normalizeBuilderSchema = (schema: unknown): FieldSchemaType[] => {
  const parseResult = fieldSchemaArray.safeParse(Array.isArray(schema) ? schema : []);
  const fields = parseResult.success ? parseResult.data : [];

  return fields.map((field) => {
    const needsDefaultOptions =
      (field.type === "multiple_choice" || field.type === "single_select") &&
      (!field.options || field.options.length < 2);

    return {
      ...field,
      name: field.name || field.prompt || "untitled",
      options: needsDefaultOptions ? ["Option 1", "Option 2"] : field.options,
    };
  });
};
