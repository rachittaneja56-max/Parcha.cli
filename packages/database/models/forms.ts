import { pgTable, uuid, varchar, boolean, timestamp, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./user";
import { responsesTable } from "./responses";
import { analyticsTable } from "./analytics";

export const visibilityEnum = pgEnum("form_visibility", ["public", "unlisted", "unpublished"]);
export const themeEnum = pgEnum("form_theme", ["standard_dark", "git_commit", "mongo_shell"]);

export type FormSchemaField = {
  id: string;
  type: string;
  name: string;
  prompt: string;
  required: boolean;
  options?: string[];
  conditional_logic?: Record<string, any>;
  page_number?: number;
};

export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").references(() => usersTable.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  visibility: visibilityEnum("visibility").default("unpublished").notNull(),
  theme: themeEnum("theme").default("standard_dark").notNull(),
  schema: jsonb("schema").$type<FormSchemaField[]>().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }),
  expiresAt: timestamp("expires_at"),
  maxResponses: integer("max_responses"),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
});

export const formsRelations = relations(formsTable, ({ one, many }) => ({
  creator: one(usersTable, {
    fields: [formsTable.creatorId],
    references: [usersTable.id],
  }),
  responses: many(responsesTable),
  analytics: one(analyticsTable),
}));
