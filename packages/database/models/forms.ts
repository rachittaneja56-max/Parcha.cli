import { pgTable, uuid, varchar, boolean, timestamp, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./user";
import { responsesTable } from "./responses";
import { analyticsTable } from "./analytics";
import type { FieldSchemaType } from "@repo/validators";

export const statusEnum = pgEnum("form_status", ["draft", "published"]);
export const visibilityEnum = pgEnum("form_visibility", ["public", "unlisted", "unpublished"]);
export const themeEnum = pgEnum("form_theme", ["terminal", "windows95", "windowsxp", "windows_xp", "silicon_valley", "silicon_valley_3d", "standard", "code_editor"]);

export type FormSchemaField = FieldSchemaType;

export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").references(() => usersTable.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  status: statusEnum("status").default("draft").notNull(),
  visibility: visibilityEnum("visibility").default("unlisted").notNull(),
  theme: themeEnum("theme").default("terminal").notNull(),
  schema: jsonb("schema").$type<FormSchemaField[]>().notNull(),
  views: integer("views").default(0).notNull(),
  requireAuth: boolean("require_auth").default(false).notNull(),
  password: varchar("password", { length: 255 }),
  successMessage: varchar("success_message", { length: 500 }).default("Response recorded successfully.").notNull(),
  passwordHash: varchar("password_hash", { length: 255 }),
  expiresAt: timestamp("expires_at"),
  maxResponses: integer("max_responses"),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull().defaultNow(),
});

export const formsRelations = relations(formsTable, ({ one, many }) => ({
  creator: one(usersTable, {
    fields: [formsTable.creatorId],
    references: [usersTable.id],
  }),
  responses: many(responsesTable),
  analytics: one(analyticsTable),
}));
