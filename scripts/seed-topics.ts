/**
 * Popula a tabela topics com os microtópicos do Anexo I retificado.
 *
 * Uso isolado: npm run db:seed:topics
 * Integrado em: npm run db:seed (antes das questões)
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { EDITAL_TOPICS } from "./edital-topics";
import { closeScriptDb } from "./script-db";

if (existsSync(".env.local")) {
  config({ path: ".env.local" });
} else {
  config();
}

export interface SeedTopicsResult {
  created: number;
  updated: number;
  skipped: number;
  total: number;
}

export async function seedTopics(): Promise<SeedTopicsResult> {
  const { scriptDb } = await import("./script-db");
  const { topics } = await import("../src/lib/db/schema");

  const existingRows = await scriptDb
    .select({ id: topics.id, nome: topics.nome, editalRef: topics.editalRef })
    .from(topics);

  const bySlug = new Map(existingRows.map((row) => [row.nome, row]));

  let created = 0;
  let updated = 0;
  let skipped = 0;

  const toInsert: Array<{
    disciplina: (typeof EDITAL_TOPICS)[number]["disciplina"];
    nome: string;
    editalRef: string;
  }> = [];

  for (const { disciplina, slug, editalRef } of EDITAL_TOPICS) {
    const existing = bySlug.get(slug);

    if (!existing) {
      toInsert.push({ disciplina, nome: slug, editalRef });
      continue;
    }

    if (!existing.editalRef && editalRef) {
      await scriptDb
        .update(topics)
        .set({ editalRef })
        .where(eq(topics.id, existing.id));
      updated++;
      continue;
    }

    skipped++;
  }

  if (toInsert.length > 0) {
    await scriptDb.insert(topics).values(toInsert);
    created = toInsert.length;
  }

  return {
    created,
    updated,
    skipped,
    total: EDITAL_TOPICS.length,
  };
}

async function main() {
  try {
    const result = await seedTopics();
    console.log(
      `Tópicos Anexo I: ${result.created} criados | ${result.updated} atualizados (edital_ref) | ${result.skipped} já ok | total ${result.total}`,
    );
  } finally {
    await closeScriptDb();
  }
}

const isDirectRun =
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  main().catch(async (err) => {
    console.error(err);
    await closeScriptDb().catch(() => undefined);
    process.exit(1);
  });
}
