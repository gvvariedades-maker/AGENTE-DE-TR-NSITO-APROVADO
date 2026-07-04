import { config } from "dotenv";
import { existsSync } from "node:fs";

if (existsSync(".env.local")) {
  config({ path: ".env.local" });
} else {
  config();
}

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "DATABASE_URL",
] as const;

const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length > 0) {
  console.error("\n❌ Variáveis faltando em .env.local:\n");
  missing.forEach((key) => console.error(`   - ${key}`));
  console.error("\nSiga o guia em: https://supabase.com/dashboard\n");
  process.exit(1);
}

console.log("✓ Variáveis de ambiente OK\n");
console.log(`  URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
console.log(`  DB:  ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@")}\n`);
