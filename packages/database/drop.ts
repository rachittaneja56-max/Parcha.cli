import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres"

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}
const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
  console.log("Dropping existing tables and types to reset schema...");
  await client`DROP SCHEMA public CASCADE;`;
  await client`CREATE SCHEMA public;`;
  console.log("Database reset complete.");
  process.exit(0);
}

main().catch(console.error);
