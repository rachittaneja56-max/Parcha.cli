/**
 * @file route.ts (Form Router)
 * @description Handles all CRUD operations for Forms.
 * Ensures proper ownership checks (a user can only modify their own forms, unless they are an admin).
 * Also exposes public endpoints for respondents to fetch form schemas safely.
 *
 * @dependencies
 * - formService (business logic for creating, updating, and sanitizing forms)
 */
import { z } from "zod";
import { zodUndefinedModel } from "@repo/validators";
import { router, protectedProcedure, publicProcedure, verifiedProcedure } from "../../trpc";
import { formService } from "../../services";
import {
  CreateFormSchema,
  UpdateSchemaSchema,
  UpdateSettingsSchema,
  GetFormByIdSchema,
  GetPublicFormSchema,
  DeleteFormSchema,
} from "@repo/validators";
import { generatePath } from "../../utils/path-generator";
import { rateLimitMiddleware } from "../../middlewares/rateLimit";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

export const formRouter = router({
  /**
   * @procedure create
   * @description Creates a new draft form for the authenticated user.
   * @requires verifiedProcedure (User must have verified email)
   */
  create: verifiedProcedure
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
      return await formService.createForm(ctx.user.id, input.title, input.theme, input.schema);
    }),

  /**
   * @procedure updateSchema
   * @description Persists changes to a form's field `schema` (the JSONB array of FieldSchemaType).
   * Validates the caller owns the form (or is admin). Used by the builder's drag-and-drop
   * canvas on every field add/remove/reorder action.
   * @requires verifiedProcedure
   * @output The updated form record
   */
  updateSchema: verifiedProcedure
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
      return await formService.updateSchema(input.formId, ctx.user.id, input.schema, ctx.user.role === "admin");
    }),

  /**
   * @procedure updateSettings
   * @description Persists changes to form settings (title, slug, theme, status, visibility,
   * password, webhookUrl, successMessage, maxResponses, expiresAt, requireAuth).
   * Validates ownership. Used by the builder's GlobalSettingsPanel.
   * @requires verifiedProcedure
   * @output The updated form record
   */
  updateSettings: verifiedProcedure
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
      return await formService.updateSettings(input.formId, ctx.user.id, input.updates, ctx.user.role === "admin");
    }),

  /**
   * @procedure delete
   * @description Permanently deletes a form and all associated responses and analytics
   * via cascading FK constraints. Validates ownership or admin role.
   * @requires verifiedProcedure
   * @output `{ success: true }`
   */
  delete: verifiedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/{formId}"),
        protect: true,
        tags: TAGS,
        summary: "Delete a form",
        successDescription: "Form deleted successfully",
        errorResponses: { 401: "Not authenticated", 404: "Form not found or unauthorized" },
      },
    })
    .input(DeleteFormSchema)
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      return await formService.deleteForm(input.formId, ctx.user.id, ctx.user.role === "admin");
    }),

  /**
   * @procedure getMyForms
   * @description Returns all forms created by the authenticated user, ordered by
   * `updatedAt` descending. Includes computed `responseCount` from a joined
   * aggregate so the dashboard can display submission counts without a second query.
   * @requires protectedProcedure
   * @output Array of form records with responseCount
   */
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

  /**
   * @procedure getFormById
   * @description Fetches a single form by UUID for the builder/analytics view.
   * Enforces ownership (non-admins can only retrieve their own forms).
   * Returns the full form including the raw `schema` and all settings.
   * @requires protectedProcedure
   * @output Full form record including schema, settings, and status
   */
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
      const form = await formService.getFormById(input.formId, ctx.user.id, ctx.user.role === "admin");
      if (!form) {
        throw new Error("Form not found");
      }
      return form;
    }),

  /**
   * @procedure getPublicForm
   * @description Fetches sanitized form data for public respondents.
   * Strips sensitive properties and internal metadata before returning the schema.
   * @requires publicProcedure
   */
  getPublicForm: publicProcedure
    .use(rateLimitMiddleware)
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/public/{formIdOrSlug}"),
        protect: false,
        tags: TAGS,
        summary: "Get public form details by ID or Slug",
        successDescription: "The public form data",
        errorResponses: { 404: "Form not found" },
      },
    })
    .input(GetPublicFormSchema)
    .output(z.any())
    .query(async ({ input }) => {
      const form = await formService.getPublicFormById(input.formIdOrSlug, input.password);
      if (!form) {
        throw new Error("Form not found");
      }
      return form;
    }),

  /**
   * @procedure getPublicForms
   * @description Returns a curated list of publicly published forms for the
   * `/explore` gallery page. Only returns forms with `visibility: 'public'`
   * and `status: 'published'`.
   * @requires publicProcedure + rateLimitMiddleware
   * @output Array of sanitized public form records
   */
  getPublicForms: publicProcedure
    .use(rateLimitMiddleware)
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/public"),
        protect: false,
        tags: TAGS,
        summary: "Get public published forms",
        successDescription: "List of public published forms for the explore gallery",
      },
    })
    .input(zodUndefinedModel)
    .output(z.any())
    .query(async () => {
      return await formService.getPublicForms();
    }),
});
