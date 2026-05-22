import { z } from "zod";
import { router, adminProcedure, protectedProcedure } from "../../trpc";
import { adminService } from "../../services";
import { ModerateFormSchema, ChangeAdminPasswordSchema, VerifyAdminPasswordSchema } from "@repo/validators";
import { zodUndefinedModel } from "@repo/validators";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Admin"];
const getPath = generatePath("/admin");

export const adminRouter = router({
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
