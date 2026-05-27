/**
 * @file settings.ts
 * @description Defines the platform-wide Settings table — a simple key-value store
 * for global configuration values that can be changed at runtime without a code deploy.
 *
 * Currently used to store the hashed admin password (`ADMIN_PASSWORD_HASH`), which is
 * checked by `adminService.verifyAdminPassword` before granting access to the admin
 * command-center dashboard overlay.
 *
 * @dependencies
 * - Drizzle ORM for schema definition
 */
import { pgTable, varchar, timestamp, text } from "drizzle-orm/pg-core";


export const settingsTable = pgTable("settings", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull().defaultNow(),
});
