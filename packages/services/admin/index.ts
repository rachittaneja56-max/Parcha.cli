import { eq, sql, desc, ilike, or } from "@repo/database";
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

  public async getAllForms(search?: string, limit: number = 20, offset: number = 0) {
    let baseQuery = this.dbInstance
      .select({
        id: formsTable.id,
        title: formsTable.title,
        status: formsTable.status,
        visibility: formsTable.visibility,
        createdAt: formsTable.createdAt,
        creatorEmail: usersTable.email,
        submissionCount: sql<number>`COALESCE(SUM(${analyticsTable.submissions}), 0)::int`,
      })
      .from(formsTable)
      .innerJoin(usersTable, eq(formsTable.creatorId, usersTable.id))
      .leftJoin(analyticsTable, eq(formsTable.id, analyticsTable.formId));

    if (search) {
      baseQuery = baseQuery.where(
        or(
          ilike(formsTable.title, `%${search}%`),
          ilike(usersTable.email, `%${search}%`)
        )
      ) as any;
    }

    return await baseQuery
      .groupBy(formsTable.id, usersTable.email)
      .orderBy(desc(formsTable.createdAt))
      .limit(limit)
      .offset(offset);
  }

  public async moderateForm(formId: string, action: "unpublish" | "publish" | "delete") {
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
    
    if (action === "publish") {
      const [updatedForm] = await this.dbInstance
        .update(formsTable)
        .set({ visibility: "public", status: "published" })
        .where(eq(formsTable.id, formId))
        .returning();

      if (!updatedForm) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      await invalidatePublicFormsCache();
      return updatedForm;
    }

    if (action === "delete") {
      const form = await this.dbInstance.query.formsTable.findFirst({
        where: eq(formsTable.id, formId),
      });

      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }

      const { responsesTable } = await import("@repo/database/schema");
      const { delCache } = await import("@repo/redis");

      await this.dbInstance.delete(responsesTable).where(eq(responsesTable.formId, formId));
      await this.dbInstance.delete(analyticsTable).where(eq(analyticsTable.formId, formId));
      await this.dbInstance.delete(formsTable).where(eq(formsTable.id, formId));
      
      await invalidatePublicFormsCache();
      await delCache(`form:${formId}`);
      
      return { success: true, deletedId: formId };
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
