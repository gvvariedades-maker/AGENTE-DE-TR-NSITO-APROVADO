/**
 * Lista questões do índice de cobertura ausentes no Supabase (por enunciado).
 * Uso: npx tsx scripts/find-missing-in-db.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";
import { closeScriptDb, scriptDb } from "./script-db";

if (existsSync(".env.local")) config({ path: ".env.local", quiet: true });
else config({ quiet: true });

const COBERTURA = join(process.cwd(), "content/questoes/_index/cobertura.json");
const CONTENT = join(process.cwd(), "content/questoes");

async function main() {
  const cobertura = JSON.parse(readFileSync(COBERTURA, "utf-8")) as {
    questoes: Array<{
      lote: string;
      indice_lote: number;
      disciplina: string;
      topico: string;
      fundamento_slug: string;
    }>;
  };

  const { questions } = await import("../src/lib/db/schema");
  const rows = await scriptDb.select({ enunciado: questions.enunciado }).from(questions);
  const inDb = new Set(rows.map((r) => r.enunciado.trim()));

  const missing: Array<{
    lote: string;
    indice_lote: number;
    disciplina: string;
    topico: string;
    fundamento_slug: string;
  }> = [];

  for (const e of cobertura.questoes) {
    const path = join(CONTENT, e.lote);
    const arr = JSON.parse(readFileSync(path, "utf-8")) as unknown[];
    const list = Array.isArray(arr) ? arr : [arr];
    const q = list[e.indice_lote] as { enunciado?: string } | undefined;
    const en = q?.enunciado?.trim();
    if (!en || inDb.has(en)) continue;
    missing.push(e);
  }

  console.log(
    JSON.stringify(
      {
        db_total: rows.length,
        cobertura_total: cobertura.questoes.length,
        missing_count: missing.length,
        by_disciplina: missing.reduce(
          (acc, m) => {
            acc[m.disciplina] = (acc[m.disciplina] ?? 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
        missing,
      },
      null,
      2,
    ),
  );

  await closeScriptDb();
}

main().catch(async (e) => {
  console.error(e);
  await closeScriptDb().catch(() => undefined);
  process.exit(1);
});
