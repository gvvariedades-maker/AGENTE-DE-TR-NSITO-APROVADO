import { config } from "dotenv";
import { existsSync } from "node:fs";
import postgres from "postgres";
import { resolveDatabaseUrl } from "../src/lib/db/resolve-database-url";

if (existsSync(".env.local")) {
  config({ path: ".env.local" });
}

async function main() {
  const baseUrl = resolveDatabaseUrl();
  const url = new URL(baseUrl);
  if (url.hostname.includes("pooler.supabase.com")) {
    url.port = "5432";
  }

  const sql = postgres(url.toString(), {
    prepare: false,
    connect_timeout: 60,
    idle_timeout: 10,
  });

  try {
    await sql.unsafe("SET statement_timeout = 0");
    await sql.unsafe("SET lock_timeout = '120s'");
    await sql.unsafe(
      "ALTER TABLE simulados ADD COLUMN IF NOT EXISTS question_ids uuid[] NOT NULL DEFAULT '{}'::uuid[]",
    );
    const rows = await sql<{ column_name: string }[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'simulados'
        AND column_name = 'question_ids'
    `;
    if (rows.length === 0) {
      throw new Error("Coluna question_ids não encontrada após migration");
    }
    console.log("✓ Migration simulados.question_ids aplicada");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
