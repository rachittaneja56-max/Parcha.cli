import { z } from "zod";

export const CreateFormSchema = z.object({
  title: z.string(),
  theme: z.enum(["terminal", "windowsxp", "standard", "code_editor"]).default("terminal"),
  schema: z.lazy(() => z.array(FieldSchema)).optional(),
});
export type CreateFormInput = z.infer<typeof CreateFormSchema>;

export const FieldSchema = z.object({
  id: z.string().startsWith("fld_"),
  type: z.string(),
  name: z.string(),
  prompt: z.string(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  conditional_logic: z.record(z.string(), z.any()).optional(),
  page_number: z.number().optional(),
  description: z.string().optional(),
});
export type FieldSchemaType = z.infer<typeof FieldSchema>;

export const UpdateSchemaSchema = z.object({
  formId: z.string().uuid(),
  schema: z.array(FieldSchema),
});
export type UpdateSchemaInput = z.infer<typeof UpdateSchemaSchema>;

export const UpdateSettingsSchema = z.object({
  formId: z.string().uuid(),
  updates: z.object({
    title: z.string().optional(),
    status: z.enum(["draft", "published"]).optional(),
    visibility: z.enum(["public", "unlisted", "unpublished"]).optional(),
    theme: z.enum(["terminal", "windowsxp", "standard", "code_editor"]).optional(),
    requireAuth: z.boolean().optional(),
    password: z.string().nullable().optional(),
    successMessage: z.string().optional(),
  }),
});
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;

export const GetFormByIdSchema = z.object({
  formId: z.string().uuid(),
});
export type GetFormByIdInput = z.infer<typeof GetFormByIdSchema>;

export const GetPublicFormSchema = z.object({
  formIdOrSlug: z.string(),
  password: z.string().optional(),
});
export type GetPublicFormInput = z.infer<typeof GetPublicFormSchema>;
