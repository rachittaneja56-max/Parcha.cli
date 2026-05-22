import { z } from "zod";
import { zodUndefinedModel } from "@repo/validators";
import { router, protectedProcedure } from "../../trpc";
import { formService } from "../../services";
import { CreateFormSchema, UpdateSchemaSchema, UpdateSettingsSchema, GetFormByIdSchema } from "@repo/validators";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

export const formRouter = router({
  create: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/"),
        protect: true,
        tags: TAGS,
        summary: "Create a form",
        successDescription: "The created form",
        errorResponses: { 401: "Not authenticated" },
      },
    })
    .input(CreateFormSchema)
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      return await formService.createForm(ctx.user.id, input.title, input.theme);
    }),

  updateSchema: protectedProcedure
    .meta({
      openapi: {
        method: "PUT",
        path: getPath("/schema"),
        protect: true,
        tags: TAGS,
        summary: "Update a form schema",
        successDescription: "The updated form",
        errorResponses: { 401: "Not authenticated", 404: "Form not found or unauthorized" },
      },
    })
    .input(UpdateSchemaSchema)
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      return await formService.updateSchema(input.formId, ctx.user.id, input.schema);
    }),

  updateSettings: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/settings"),
        protect: true,
        tags: TAGS,
        summary: "Update form settings",
        successDescription: "The updated form",
        errorResponses: { 401: "Not authenticated", 404: "Form not found or unauthorized" },
      },
    })
    .input(UpdateSettingsSchema)
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      return await formService.updateSettings(input.formId, ctx.user.id, input.updates);
    }),

  getMyForms: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/my"),
        protect: true,
        tags: TAGS,
        summary: "List my forms",
        successDescription: "Forms owned by the authenticated user",
        errorResponses: { 401: "Not authenticated" },
      },
    })
    .input(zodUndefinedModel)
    .output(z.any())
    .query(async ({ ctx }) => {
      return await formService.getMyForms(ctx.user.id);
    }),

  getFormById: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/{formId}"),
        protect: true,
        tags: TAGS,
        summary: "Get a form by ID",
        successDescription: "The requested form",
        errorResponses: { 401: "Not authenticated", 404: "Form not found" },
      },
    })
    .input(GetFormByIdSchema)
    .output(z.any())
    .query(async ({ ctx, input }) => {
      const form = await formService.getFormById(input.formId);
      if (!form) {
        throw new Error("Form not found");
      }
      return form;
    }),
});
