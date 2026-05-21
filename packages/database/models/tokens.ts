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
