import { eq, and, desc } from "@repo/database";
import type { db } from "@repo/database";
import { TRPCError } from "@trpc/server";
import { formsTable, responsesTable } from "@repo/database/schema";

class AnalyticsService {
  constructor(private readonly dbInstance: typeof db) {}

  public async getDashboardStats(formId: string, creatorId: string, isAdmin: boolean = false) {
    const form = await this.dbInstance.query.formsTable.findFirst({
      where: isAdmin
        ? eq(formsTable.id, formId)
        : and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)),
      with: {
        analytics: true,
        responses: {
          orderBy: [desc(responsesTable.submittedAt)],
          limit: 20,
        },
      },
    });

    if (!form) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Form not found or unauthorized" });
    }

    const stats = form.analytics;
    const views = stats?.views || 0;
    const submissions = stats?.submissions || 0;
    const conversionRate = views > 0 ? (submissions / views) * 100 : 0;

    return {
      stats: {
        views,
        submissions,
        conversionRate,
      },
      liveFeed: form.responses,
    };
  }

  public async getAllResponses(formId: string, creatorId: string, limit: number, offset: number, isAdmin: boolean = false) {
    const form = await this.dbInstance.query.formsTable.findFirst({
      where: isAdmin
        ? eq(formsTable.id, formId)
        : and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)),
      columns: {
        id: true,
      },
    });

    if (!form) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Form not found or unauthorized" });
    }

    return await this.dbInstance.query.responsesTable.findMany({
      where: eq(responsesTable.formId, formId),
      orderBy: [desc(responsesTable.submittedAt)],
      limit,
      offset,
    });
  }
}

export default AnalyticsService;
