import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres"
import { usersTable } from "./models/user";
import { formsTable, FormSchemaField } from "./models/forms";
import { responsesTable } from "./models/responses";
import { analyticsTable } from "./models/analytics";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}
const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
  console.log("Starting Database Seed...\n");

  console.log("Clearing existing data...");
  await db.delete(analyticsTable);
  await db.delete(responsesTable);
  await db.delete(formsTable);
  await db.delete(usersTable);
  console.log("Cleared existing data.\n");

  console.log(" Creating Users...");
  const [admin, creator] = await db.insert(usersTable).values([
    { fullName: "System Admin", email: "admin@saas.com", emailVerified: true },
    { fullName: "Alice Creator", email: "alice@creator.com", emailVerified: true },
  ]).returning();
  console.log("Created 2 Users.\n");

  const mockSchema: FormSchemaField[] = [
    { id: "fld_1a2b", type: "text", label: "What is your name?", required: true, page_number: 1 },
    { id: "fld_3c4d", type: "select", label: "Favorite color?", required: true, options: ["Red", "Blue", "Green"], page_number: 1 },
    { id: "fld_5e6f", type: "textarea", label: "Tell us why you picked this color.", required: false, page_number: 2, conditional_logic: { showIf: { field: "fld_3c4d", equals: "Red" } } },
  ];

  console.log("Creating Forms...");
  const forms = await db.insert(formsTable).values([
    {
      creatorId: creator.id,
      title: "Cyberpunk Feedback",
      slug: "cyberpunk-feedback",
      visibility: "public",
      theme: "neon_cyberpunk",
      schema: mockSchema,
    },
    {
      creatorId: creator.id,
      title: "Retro Guestbook",
      slug: "retro-guestbook",
      visibility: "public",
      theme: "windows_95",
      schema: mockSchema,
    },
    {
      creatorId: creator.id,
      title: "Startup Application",
      slug: "startup-application",
      visibility: "public",
      theme: "silicon_valley",
      schema: mockSchema,
    },
  ]).returning();
  console.log("Created 3 Forms.\n");
  console.log("Generating Responses...");
  for (const form of forms) {
    const responsesData = Array.from({ length: 5 }).map((_, i) => ({
      formId: form.id,
      payload: {
        fld_1a2b: `Respondent ${i + 1} for ${form.title}`,
        fld_3c4d: ["Red", "Blue", "Green"][i % 3],
        fld_5e6f: (i % 3) === 0 ? "Because it matches my car." : undefined,
      },
      respondentFingerprint: `fingerprint_abc123_${i}`,
    }));

    await db.insert(responsesTable).values(responsesData);
  }
  console.log("Injected 15 Total Responses.\n");

  console.log("Injecting Analytics...");
  const analyticsData = forms.map((form) => ({
    formId: form.id,
    views: Math.floor(Math.random() * 100) + 50,
    submissions: 5,
    bounceRate: "12.5",
    lastSubmissionAt: new Date(),
  }));
  await db.insert(analyticsTable).values(analyticsData);
  console.log("Injected Analytics.\n");

  console.log("Seed Completed Successfully!");
  process.exit(0);
} ``

main().catch((e) => {
  console.error("Seed failed:");
  console.error(e);
  process.exit(1);
});
