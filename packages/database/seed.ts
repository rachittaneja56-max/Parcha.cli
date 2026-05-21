import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { usersTable } from "./models/user";
import { formsTable, FormSchemaField } from "./models/forms";
import { responsesTable } from "./models/responses";
import { analyticsTable } from "./models/analytics";

// Initialize DB Client
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}
const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
  console.log("Starting Database Seed...\n");

  console.log("Checking for demo account...");
  let existingCreator = await db.select().from(usersTable).where(eq(usersTable.email, "alice@creator.com"));
  
  let creatorId: string;

  if (existingCreator.length > 0) {
    console.log("Demo user already exists. Using existing demo account.");
    creatorId = existingCreator[0].id;
  } else {
    console.log("Creating demo user...");
    const [creator] = await db.insert(usersTable).values([
      { fullName: "Alice Creator", email: "alice@creator.com", emailVerified: true },
    ]).returning();
    creatorId = creator.id;
    console.log("Created demo user.\n");
  }

  const mockSchema: FormSchemaField[] = [
    { id: "fld_1a2b", type: "text", label: "What is your name?", required: true, page_number: 1 },
    { id: "fld_3c4d", type: "select", label: "Favorite color?", required: true, options: ["Red", "Blue", "Green"], page_number: 1 },
    { id: "fld_5e6f", type: "textarea", label: "Tell us why you picked this color.", required: false, page_number: 2, conditional_logic: { showIf: { field: "fld_3c4d", equals: "Red" } } },
  ];

  console.log("Creating Demo Forms...");
  const forms = await db.insert(formsTable).values([
    {
      creatorId: creatorId,
      title: "Cyberpunk Feedback",
      slug: `cyberpunk-feedback-${Date.now()}`, // append timestamp to avoid unique slug constraint error
      visibility: "public",
      theme: "neon_cyberpunk",
      schema: mockSchema,
    },
    {
      creatorId: creatorId,
      title: "Retro Guestbook",
      slug: `retro-guestbook-${Date.now()}`,
      visibility: "public",
      theme: "windows_95",
      schema: mockSchema,
    },
    {
      creatorId: creatorId,
      title: "Startup Application",
      slug: `startup-application-${Date.now()}`,
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
}

main().catch((e) => {
  console.error("Seed failed:");
  console.error(e);
  process.exit(1);
});
