/**
 * @file schema.ts
 * @description Barrel re-export of all Drizzle ORM table definitions for the
 * Parcha95 database package. Import from `@repo/database/schema` to access any
 * table (usersTable, formsTable, responsesTable, analyticsTable, tokensTable,
 * settingsTable) and their corresponding Drizzle relations in a single import.
 *
 * All table definitions live in `./models/`. Changes to the schema require a
 * Drizzle migration (`pnpm db:generate` → `pnpm db:migrate`).
 */
export * from "./models/user";

export * from "./models/forms";
export * from "./models/responses";
export * from "./models/analytics";
export * from "./models/tokens";
export * from "./models/settings";

