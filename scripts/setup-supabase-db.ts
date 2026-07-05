/**
 * Sincroniza credenciais Supabase no .env.local:
 * - service_role via Supabase CLI
 * - senha do Postgres via Management API (se SUPABASE_ACCESS_TOKEN estiver definido)
 *
 * Uso: npm run setup:supabase-db
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";

const ENV_PATH = join(process.cwd(), ".env.local");
const PROJECT_REF = "ytmppmmazcjkxbpfzewp";
const DEFAULT_DB_PASSWORD = "AgenteTransito2026";
const DEFAULT_DB_HOST = "aws-1-us-east-2.pooler.supabase.com";
const DEFAULT_DB_PORT = "5432";

if (existsSync(ENV_PATH)) {
  config({ path: ENV_PATH });
}

type ApiKeysResponse = {
  keys: Array<{ name: string; api_key: string }>;
};

function readEnvFile(): string {
  return existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf-8") : "";
}

function upsertEnvVar(content: string, key: string, value: string): string {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(content)) {
    return content.replace(pattern, line);
  }
  return `${content.trimEnd()}\n${line}\n`;
}

function fetchServiceRoleKey(): string {
  const raw = execSync(
    `npx --yes supabase@latest projects api-keys --project-ref ${PROJECT_REF}`,
    { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] },
  );
  const jsonStart = raw.indexOf("{");
  const parsed = JSON.parse(raw.slice(jsonStart)) as ApiKeysResponse;
  const serviceRole = parsed.keys.find((k) => k.name === "service_role");
  if (!serviceRole?.api_key) {
    throw new Error("service_role não encontrada. Rode: npx supabase login");
  }
  return serviceRole.api_key;
}

async function resetDatabasePassword(password: string): Promise<void> {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  if (!token) {
    console.log("⚠ SUPABASE_ACCESS_TOKEN ausente — senha do Postgres não alterada.");
    console.log("  Rode: npx supabase login");
    return;
  }

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/password`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Falha ao resetar senha (${res.status}): ${body}`);
  }

  console.log("✓ Senha do Postgres atualizada via Management API");
}

async function fetchPoolerHost(): Promise<string> {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  if (!token) return DEFAULT_DB_HOST;

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/database/pooler`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) return DEFAULT_DB_HOST;

  const data = (await res.json()) as Array<{ db_host?: string }>;
  return data[0]?.db_host ?? DEFAULT_DB_HOST;
}

function buildDatabaseUrl(password: string, host: string, port = DEFAULT_DB_PORT): string {
  const encoded = encodeURIComponent(password);
  return `postgresql://postgres.${PROJECT_REF}:${encoded}@${host}:${port}/postgres`;
}

async function main() {
  const password = process.env.DATABASE_PASSWORD?.trim() || DEFAULT_DB_PASSWORD;

  console.log("Sincronizando credenciais Supabase...\n");

  const serviceRoleKey = fetchServiceRoleKey();
  console.log("✓ service_role obtida via Supabase CLI");

  await resetDatabasePassword(password);

  const poolerHost = await fetchPoolerHost();
  console.log(`✓ Pooler: ${poolerHost}:${DEFAULT_DB_PORT}`);

  let envContent = readEnvFile();
  envContent = upsertEnvVar(envContent, "SUPABASE_PROJECT_REF", PROJECT_REF);
  envContent = upsertEnvVar(envContent, "DATABASE_PASSWORD", password);
  envContent = upsertEnvVar(envContent, "DATABASE_HOST", poolerHost);
  envContent = upsertEnvVar(envContent, "DATABASE_PORT", DEFAULT_DB_PORT);
  envContent = upsertEnvVar(
    envContent,
    "DATABASE_URL",
    buildDatabaseUrl(password, poolerHost),
  );
  envContent = upsertEnvVar(
    envContent,
    "SUPABASE_SERVICE_ROLE_KEY",
    serviceRoleKey,
  );

  writeFileSync(ENV_PATH, envContent, "utf-8");

  console.log("✓ .env.local atualizado");
  console.log(`  DATABASE_PASSWORD definida (session pooler 5432)`);
  console.log(`  SUPABASE_SERVICE_ROLE_KEY definida\n`);
  console.log("Aguarde ~30s e rode: npm run db:seed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
