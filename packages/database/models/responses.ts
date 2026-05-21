import { pgTable, uuid, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { formsTable } from "./forms";

export const responsesTable = pgTable("responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id").references(() => formsTable.id).notNull(),
  payload: jsonb("payload").$type<Record<string, any>>().notNull(),
  respondentFingerprint: varchar("respondent_fingerprint", { length: 255 }),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const responsesRelations = relations(responsesTable, ({ one }) => ({
  form: one(formsTable, {
    fields: [responsesTable.formId],
    references: [formsTable.id],
  }),
}));
