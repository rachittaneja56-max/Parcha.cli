/**
 * @file tokens.ts
 * @description Defines the short-lived Tokens table used for out-of-band email flows.
 * A token is a cryptographically random string scoped to a `type` (`verification` or
 * `password_reset`) and an `email` address. Tokens are consumed once and must be
 * used before `expiresAt`.
 *
 * Created by: `authService.forgotPassword` and `authService.registerNative`.
 * Consumed by: `authService.verifyEmail` and `authService.resetPassword`.
 *
 * @dependencies
 * - Drizzle ORM for schema definition
 * - usersTable (FK by email, not UUID, for lookup without a full user join)
 */
import { pgTable, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { usersTable } from "./user";

export const tokenTypeEnum = pgEnum("token_type", ["verification", "password_reset"]);

export const tokensTable = pgTable("tokens", {
  token: varchar("token", { length: 255 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  type: tokenTypeEnum("type").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const tokensRelations = relations(tokensTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [tokensTable.email],
    references: [usersTable.email],
  }),
}));
