import { config } from "dotenv";
import { existsSync } from "node:fs";
import postgres from "postgres";
import { resolveDatabaseUrl } from "../src/lib/db/resolve-database-url";

if (existsSync(".env.local")) {
  config({ path: ".env.local" });
} else {
  config();
}

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length > 0) {
  console.error("\n❌ Variáveis faltando em .env.local:\n");
  missing.forEach((key) => console.error(`   - ${key}`));
  console.error("\nSiga o guia em: https://supabase.com/dashboard\n");
  process.exit(1);
}

const hasDb =
  process.env.DATABASE_PASSWORD?.trim() && process.env.SUPABASE_PROJECT_REF?.trim()
    ? true
    : Boolean(process.env.DATABASE_URL?.trim());

if (!hasDb) {
  console.error("\n❌ Banco: defina DATABASE_PASSWORD + SUPABASE_PROJECT_REF ou DATABASE_URL\n");
  console.error("   Rode: npm run setup:supabase-db\n");
  process.exit(1);
}

let databaseUrl: string;
try {
  databaseUrl = resolveDatabaseUrl();
} catch (err) {
  console.error(`\n❌ DATABASE_URL inválida: ${err instanceof Error ? err.message : err}\n`);
  process.exit(1);
}

console.log("✓ Variáveis de ambiente OK\n");
console.log(`  URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
console.log(`  DB:  ${databaseUrl.replace(/:[^:@]+@/, ":****@")}`);

const sql = postgres(databaseUrl, { max: 1, connect_timeout: 10 });

async function testConnection() {
  try {
    await sql`select 1 as ok`;
    console.log("  Conexão Postgres: OK\n");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ Conexão Postgres falhou: ${message}\n`);
    console.error("   Aguarde 1–2 min após setup:supabase-db e tente de novo.\n");
    console.error("   Ou rode: npm run setup:supabase-db\n");
    process.exit(1);
  } finally {
    await sql.end({ timeout: 2 });
  }
}

void testConnection();
