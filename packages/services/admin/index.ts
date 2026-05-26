import { eq, sql } from "@repo/database";
import type { db } from "@repo/database";
import { TRPCError } from "@trpc/server";
import { formsTable, analyticsTable, usersTable, settingsTable } from "@repo/database/schema";
import bcrypt from "bcrypt";
import { invalidatePublicFormsCache } from "../form/cache";

class AdminService {
  constructor(private readonly dbInstance: typeof db) {}

  public async getPlatformTelemetry() {
    const [userCountResult] = await this.dbInstance
      .select({ count: sql<number>`count(*)::int` })
      .from(usersTable);
    const [formCountResult] = await this.dbInstance
      .select({ count: sql<number>`count(*)::int` })
      .from(formsTable);
    const [submissionCountResult] = await this.dbInstance
      .select({ total: sql<number>`sum(${analyticsTable.submissions})::int` })
      .from(analyticsTable);

    return {
      totalUsers: userCountResult?.count || 0,
      totalForms: formCountResult?.count || 0,
      totalSubmissions: submissionCountResult?.total || 0,
    };
  }

  public async moderateForm(formId: string, action: "unpublish") {
    if (action === "unpublish") {
      const [updatedForm] = await this.dbInstance
        .update(formsTable)
        .set({ visibility: "unpublished" })
        .where(eq(formsTable.id, formId))
        .returning();

      if (!updatedForm) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      await invalidatePublicFormsCache();
      return updatedForm;
    }
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid moderation action" });
  }

  public async verifyAdminPassword(userId: string, password: string) {
    const [setting] = await this.dbInstance
      .select()
      .from(settingsTable)
      .where(eq(settingsTable.key, "ADMIN_PASSWORD"));

    if (!setting) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Admin password not configured",
      });
    }

    const isValid = await bcrypt.compare(password, setting.value);
    if (!isValid) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin password" });
    }

    const [updatedUser] = await this.dbInstance
      .update(usersTable)
      .set({ role: "admin" })
      .where(eq(usersTable.id, userId))
      .returning();

    return updatedUser;
  }

  public async changeAdminPassword(newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [setting] = await this.dbInstance
      .insert(settingsTable)
      .values({
        key: "ADMIN_PASSWORD",
        value: hashedPassword,
      })
      .onConflictDoUpdate({
        target: settingsTable.key,
        set: { value: hashedPassword },
      })
      .returning();

    return setting;
  }
}

export default AdminService;
