/**
 * Cruza cobertura.json com Supabase: questões indexadas mas ausentes no banco.
 * Uso: npx tsx scripts/list-seed-gaps.ts --db
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";
import { questoesImportFileSchema } from "../src/lib/validations/questao";
import { isNivelLote007Ouro } from "../src/lib/validations/estudo-reverso-visual";
import { closeScriptDb, scriptDb } from "./script-db";

if (existsSync(".env.local")) config({ path: ".env.local", quiet: true });
else config({ quiet: true });

const COBERTURA = join(process.cwd(), "content/questoes/_index/cobertura.json");
const CONTENT = join(process.cwd(), "content/questoes");

type CoberturaEntry = {
  lote: string;
  indice_lote: number;
  disciplina: string;
  topico: string;
  fundamento_slug: string;
};

async function main() {
  const withDb = process.argv.includes("--db");
  const cobertura = JSON.parse(readFileSync(COBERTURA, "utf-8")) as {
    total: number;
    questoes: CoberturaEntry[];
  };

  const byLote = new Map<string, CoberturaEntry[]>();
  for (const q of cobertura.questoes) {
    const list = byLote.get(q.lote) ?? [];
    list.push(q);
    byLote.set(q.lote, list);
  }

  let enunciadosDb = new Set<string>();
  if (withDb) {
    const { questions } = await import("../src/lib/db/schema");
    const rows = await scriptDb.select({ enunciado: questions.enunciado }).from(questions);
    enunciadosDb = new Set(rows.map((r) => r.enunciado.trim()));
  }

  type FailReason = "missing_file" | "schema" | "ouro" | "not_in_db";
  const failures: Array<{
    lote: string;
    indice_lote?: number;
    reason: FailReason;
    detail: string;
  }> = [];

  let ok = 0;

  for (const [lote, entries] of byLote) {
    const path = join(CONTENT, lote);
    if (!existsSync(path)) {
      for (const e of entries) {
        failures.push({
          lote,
          indice_lote: e.indice_lote,
          reason: "missing_file",
          detail: "arquivo ausente",
        });
      }
      continue;
    }

    const raw = JSON.parse(readFileSync(path, "utf-8")) as unknown;
    const arr = Array.isArray(raw) ? raw : [raw];
    const parsed = questoesImportFileSchema.safeParse(arr);

    if (!parsed.success) {
      const errs = parsed.error.flatten().fieldErrors;
      const firstKey = Object.keys(errs)[0];
      const firstErr = firstKey
        ? (errs as Record<string, string[]>)[firstKey]?.[0]
        : "schema inválido";
      for (const e of entries) {
        failures.push({
          lote,
          indice_lote: e.indice_lote,
          reason: "schema",
          detail: firstErr ?? "schema inválido",
        });
      }
      continue;
    }

    for (const e of entries) {
      const q = parsed.data[e.indice_lote];
      if (!q) {
        failures.push({
          lote,
          indice_lote: e.indice_lote,
          reason: "schema",
          detail: "índice fora do array",
        });
        continue;
      }

      if (!isNivelLote007Ouro(q)) {
        failures.push({
          lote,
          indice_lote: e.indice_lote,
          reason: "ouro",
          detail: "fora do gate lote-007 ouro",
        });
        continue;
      }

      if (withDb && !enunciadosDb.has(q.enunciado.trim())) {
        failures.push({
          lote,
          indice_lote: e.indice_lote,
          reason: "not_in_db",
          detail: "passa validação mas ausente no Supabase",
        });
        continue;
      }

      ok++;
    }
  }

  const notInDb = failures.filter((f) => f.reason === "not_in_db");
  const schemaFail = failures.filter((f) => f.reason === "schema");
  const ouroFail = failures.filter((f) => f.reason === "ouro");

  console.log(
    JSON.stringify(
      {
        cobertura_total: cobertura.total,
        ok,
        fail_total: failures.length,
        not_in_db: notInDb.length,
        schema_fail: schemaFail.length,
        ouro_fail: ouroFail.length,
        not_in_db_list: notInDb,
        schema_fail_lotes: [...new Set(schemaFail.map((f) => f.lote))].length,
        failures_sample_schema: schemaFail.slice(0, 5),
      },
      null,
      2,
    ),
  );

  if (withDb) await closeScriptDb();
}

main().catch(async (e) => {
  console.error(e);
  await closeScriptDb().catch(() => undefined);
  process.exit(1);
});
