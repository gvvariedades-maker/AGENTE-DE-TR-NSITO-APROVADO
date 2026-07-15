/**
 * Sincroniza variáveis críticas do .env.local para a Vercel (production).
 * Uso: npx tsx scripts/sync-vercel-env.ts
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { config } from "dotenv";

if (existsSync(".env.local")) {
  config({ path: ".env.local" });
}

const KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_PROJECT_REF",
  "DATABASE_PASSWORD",
  "DATABASE_HOST",
  "DATABASE_PORT",
  "DATABASE_URL",
] as const;

function upsertEnv(name: string, value: string) {
  console.log(`→ ${name}`);
  execFileSync(
    "vercel",
    ["env", "rm", name, "production", "--yes"],
    { stdio: ["ignore", "pipe", "pipe"], shell: true },
  );
  // stdin via echo is unreliable on Windows; use --value
  execFileSync(
    "vercel",
    ["env", "add", name, "production", "--value", value, "--yes"],
    { stdio: ["ignore", "pipe", "pipe"], shell: true },
  );
}

function main() {
  const password = process.env.DATABASE_PASSWORD?.trim();
  const ref = process.env.SUPABASE_PROJECT_REF?.trim();
  const host =
    process.env.DATABASE_HOST?.trim() ||
    "aws-1-us-east-2.pooler.supabase.com";

  if (!password || !ref) {
    throw new Error("DATABASE_PASSWORD e SUPABASE_PROJECT_REF são obrigatórios");
  }

  // Garante URL de transaction pooler (6543)
  const encoded = encodeURIComponent(password);
  process.env.DATABASE_PORT = "6543";
  process.env.DATABASE_HOST = host;
  process.env.DATABASE_URL = `postgresql://postgres.${ref}:${encoded}@${host}:6543/postgres`;

  for (const key of KEYS) {
    const value = process.env[key]?.trim();
    if (!value) {
      console.warn(`⚠ ${key} ausente — pulando`);
      continue;
    }
    try {
      upsertEnv(key, value);
      console.log(`  ✓ ${key}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${key}: ${message}`);
      // tenta só add se rm falhou (variável inexistente)
      try {
        execFileSync(
          "vercel",
          ["env", "add", key, "production", "--value", value, "--yes"],
          { stdio: ["ignore", "pipe", "pipe"], shell: true },
        );
        console.log(`  ✓ ${key} (add)`);
      } catch (err2) {
        console.error(`  ✗ ${key} add falhou`, err2);
      }
    }
  }

  console.log("\nPronto. Faça um redeploy: vercel deploy --prod --yes");
}

main();
