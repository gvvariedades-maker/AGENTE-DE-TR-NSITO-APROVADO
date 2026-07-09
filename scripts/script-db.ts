import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { resolveDatabaseUrl } from "../src/lib/db/resolve-database-url";
import * as schema from "../src/lib/db/schema";

/** Transaction pooler (6543) evita EMAXCONNSESSION ao rodar seed com `npm run dev` ativo. */
function resolveScriptDatabaseUrl(): string {
  const url = resolveDatabaseUrl();
  if (process.env.DATABASE_PORT?.trim()) return url;
  return url.replace(":5432/", ":6543/");
}

let client: ReturnType<typeof postgres> | null = null;
let db: PostgresJsDatabase<typeof schema> | null = null;

function getClient(): ReturnType<typeof postgres> {
  if (!client) {
    client = postgres(resolveScriptDatabaseUrl(), {
      prepare: false,
      max: 1,
      idle_timeout: 20,
    });
  }
  return client;
}

export function getScriptDb(): PostgresJsDatabase<typeof schema> {
  if (!db) {
    db = drizzle(getClient(), { schema });
  }
  return db;
}

/** Proxy lazy — só conecta após dotenv em seed-*.ts */
export const scriptDb = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop) {
    return Reflect.get(getScriptDb(), prop);
  },
});

export async function closeScriptDb(): Promise<void> {
  if (client) {
    await client.end({ timeout: 5 });
    client = null;
    db = null;
  }
}
