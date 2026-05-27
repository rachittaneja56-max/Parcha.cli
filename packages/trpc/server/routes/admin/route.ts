/**
 * @file route.ts (Admin Router)
 * @description Defines all administrative tRPC procedures for the platform.
 * These endpoints are strictly protected by `adminProcedure` and allow global
 * dashboard operations like telemetry, form moderation, and password management.
 * 
 * @dependencies
 * - adminService (contains the business logic for admin actions)
 */
import { z } from "zod";
import { router, adminProcedure, protectedProcedure } from "../../trpc";
import { adminService } from "../../services";
import { ModerateFormSchema, ChangeAdminPasswordSchema, VerifyAdminPasswordSchema } from "@repo/validators";
import { zodUndefinedModel } from "@repo/validators";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Admin"];
const getPath = generatePath("/admin");

export const adminRouter = router({
  /**
   * @procedure getTelemetry
   * @description Fetches global platform statistics (user count, form count, response count).
   * @requires adminProcedure
   */
  getTelemetry: adminProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/telemetry"),
        protect: true,
        tags: TAGS,
        summary: "Get platform telemetry",
        successDescription: "Platform telemetry for admins",
        errorResponses: { 401: "Not authenticated", 403: "Not authorized as admin" },
      },
    })
    .input(zodUndefinedModel)
    .output(z.any())
    .query(async () => {
      return await adminService.getPlatformTelemetry();
    }),

  /**
   * @procedure getRecentForms
   * @description Returns the 10 most recently created forms across all users.
   * Used on the admin dashboard's moderation queue.
   * @requires adminProcedure
   * @output Array of form records with creator info
   */
  getRecentForms: adminProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/recent-forms"),
        protect: true,
        tags: TAGS,
        summary: "Get recent forms",
        successDescription: "Recent forms for admins",
        errorResponses: { 401: "Not authenticated", 403: "Not authorized as admin" },
      },
    })
    .input(zodUndefinedModel)
    .output(z.any())
    .query(async () => {
      return await adminService.getRecentForms();
    }),

  /**
   * @procedure moderateForm
   * @description Takes an admin moderation action on a form.
   * Supported actions: `archive` (soft-delete), `publish`, `unpublish`.
   * @requires adminProcedure
   * @output The updated form record after moderation action
   */
  moderateForm: adminProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/moderate-form"),
        protect: true,
        tags: TAGS,
        summary: "Moderate a form",
        successDescription: "The moderation result",
        errorResponses: { 401: "Not authenticated", 403: "Not authorized as admin", 404: "Form not found" },
      },
    })
    .input(ModerateFormSchema)
    .output(z.any())
    .mutation(async ({ input }) => {
      return await adminService.moderateForm(input.formId, input.action);
    }),

  /**
   * @procedure changePassword
   * @description Updates the global admin password stored as a bcrypt hash
   * in `settingsTable` under the key `ADMIN_PASSWORD_HASH`.
   * @requires adminProcedure
   * @output `{ success: true }`
   */
  changePassword: adminProcedure
    .meta({
      openapi: {
        method: "PUT",
        path: getPath("/password"),
        protect: true,
        tags: TAGS,
        summary: "Change the admin password",
        successDescription: "The password was changed",
        errorResponses: { 401: "Not authenticated", 403: "Not authorized as admin" },
      },
    })
    .input(ChangeAdminPasswordSchema)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input }) => {
      await adminService.changeAdminPassword(input.newPassword);
      return { success: true };
    }),

  /**
   * @procedure verifyPassword
   * @description Verifies an admin password against the bcrypt hash in `settingsTable`.
   * Used as a secondary verification gate on sensitive admin UI overlays.
   * Note: Uses `protectedProcedure`, not `adminProcedure` — any logged-in user can
   * attempt verification, but the hash comparison prevents unauthorized access.
   * @requires protectedProcedure
   * @output `{ success: true }` on match; throws FORBIDDEN on mismatch
   */
  verifyPassword: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/verify-password"),
        protect: true,
        tags: TAGS,
        summary: "Verify the admin password",
        successDescription: "The password was verified",
        errorResponses: { 401: "Not authenticated", 403: "Invalid admin password" },
      },
    })
    .input(VerifyAdminPasswordSchema)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await adminService.verifyAdminPassword(ctx.user.id, input.password);
      return { success: true };
    }),
});
