import { db, eq, and, desc } from "@repo/database";
import { formsTable, analyticsTable, responsesTable } from "@repo/database/schema";

class AnalyticsService {
  public async getDashboardStats(formId: string, creatorId: string) {
    const form = await db.query.formsTable.findFirst({
      where: and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)),
    });

    if (!form) {
      throw new Error("UNAUTHORIZED");
    }
    const stats = await db.query.analyticsTable.findFirst({
      where: eq(analyticsTable.formId, formId),
    });

    const views = stats?.views || 0;
    const submissions = stats?.submissions || 0;
    let conversionRate = 0;
    if (views > 0) {
      conversionRate = (submissions / views) * 100;
    }

    const recentResponses = await db.query.responsesTable.findMany({
      where: eq(responsesTable.formId, formId),
      orderBy: [desc(responsesTable.submittedAt)],
      limit: 20,
    });

    return {
      stats: {
        views,
        submissions,
        conversionRate,
      },
      liveFeed: recentResponses,
    };
  }

  public async getAllResponses(formId: string, creatorId: string, limit: number, offset: number) {
    const form = await db.query.formsTable.findFirst({
      where: and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)),
    });

    if (!form) {
      throw new Error("UNAUTHORIZED");
    }

    const responses = await db.query.responsesTable.findMany({
      where: eq(responsesTable.formId, formId),
      orderBy: [desc(responsesTable.submittedAt)],
      limit,
      offset,
    });

    return responses;
  }
}

export const analyticsService = new AnalyticsService();
export default AnalyticsService;
