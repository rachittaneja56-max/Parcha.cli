import { z } from "zod";

export const CreateFormSchema = z.object({
  title: z.string(),
  theme: z.enum(["standard_dark", "git_commit", "mongo_shell"]).default("standard_dark"),
});
export type CreateFormInput = z.infer<typeof CreateFormSchema>;

export const UpdateSchemaSchema = z.object({
  formId: z.string().uuid(),
  schema: z.array(z.object({
    id: z.string().startsWith("fld_"),
    type: z.string(),
    label: z.string(),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(),
    conditional_logic: z.record(z.string(), z.any()).optional(),
    page_number: z.number().optional(),
  })),
});
export type UpdateSchemaInput = z.infer<typeof UpdateSchemaSchema>;

export const UpdateSettingsSchema = z.object({
  formId: z.string().uuid(),
  updates: z.object({
    visibility: z.enum(["public", "unlisted", "unpublished"]).optional(),
    theme: z.enum(["standard_dark", "git_commit", "mongo_shell"]).optional(),
  }),
});
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;

export const GetFormByIdSchema = z.object({
  formId: z.string().uuid(),
});
export type GetFormByIdInput = z.infer<typeof GetFormByIdSchema>;
