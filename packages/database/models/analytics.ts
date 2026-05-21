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
