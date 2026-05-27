/**
 * @file analytics.ts
 * @description Defines the Analytics schema for Parcha95 — a per-form aggregate
 * metrics store keyed on `formId`. It tracks total views, total submissions, and
 * bounce rate. This table is populated and updated at response submission time by
 * the `responseService` and is queried by `analyticsService.getDashboardStats`.
 *
 * Relationship: 1-to-1 with `formsTable` (each form has exactly one analytics row).
 *
 * @dependencies
 * - Drizzle ORM for schema definition
 * - formsTable (FK on formId)
 */
import { pgTable, uuid, integer, numeric, timestamp } from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { formsTable } from "./forms";

export const analyticsTable = pgTable("analytics", {
  formId: uuid("form_id").primaryKey().references(() => formsTable.id),
  views: integer("views").default(0).notNull(),
  submissions: integer("submissions").default(0).notNull(),
  bounceRate: numeric("bounce_rate").default("0").notNull(),
  lastSubmissionAt: timestamp("last_submission_at"),
});

export const analyticsRelations = relations(analyticsTable, ({ one }) => ({
  form: one(formsTable, {
    fields: [analyticsTable.formId],
    references: [formsTable.id],
  }),
}));
