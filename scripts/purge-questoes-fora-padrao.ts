/**
 * Remove do Supabase questões fora do padrão.
 *
 * Uso:
 *   npm run db:purge:fora-padrao                    # dry-run — schema v3
 *   npm run db:purge:fora-padrao -- --execute
 *   npm run db:purge:fora-padrao -- --nivel-lote-007 # dry-run — padrão ouro lote-007
 *   npm run db:purge:fora-padrao -- --nivel-lote-007 --execute
 */
import { existsSync } from "node:fs";
import { config } from "dotenv";
import { eq, inArray } from "drizzle-orm";
import { isNivelLote007Ouro } from "../src/lib/validations/estudo-reverso-visual";
import { questaoSeedImportSchema } from "../src/lib/validations/questao";
import type { Disciplina } from "../src/types";
import { closeScriptDb, scriptDb } from "./script-db";
import { questions, topics } from "../src/lib/db/schema";

if (existsSync(".env.local")) {
  config({ path: ".env.local" });
} else {
  config();
}

const execute = process.argv.includes("--execute");
const nivelLote007 = process.argv.includes("--nivel-lote-007");

function rowToSeedInput(row: {
  disciplina: Disciplina;
  topico: string;
  tipo: string;
  estiloIdecan: string | null;
  dificuldade: number;
  enunciado: string;
  altA: string;
  altB: string;
  altC: string;
  altD: string;
  altE: string | null;
  gabarito: string;
  comentarioJson: unknown;
  estudoReversoVisualJson: unknown;
  estudoReversoVisualCompletoJson: unknown;
  tags: string[] | null;
}) {
  const alternativas: Record<string, string> = {
    A: row.altA,
    B: row.altB,
    C: row.altC,
    D: row.altD,
  };
  if (row.altE) alternativas.E = row.altE;

  return {
    disciplina: row.disciplina,
    topico: row.topico,
    tipo: row.tipo,
    estilo_idecan: row.estiloIdecan ?? undefined,
    dificuldade: row.dificuldade,
    enunciado: row.enunciado,
    alternativas,
    gabarito: row.gabarito,
    comentario: row.comentarioJson,
    estudo_reverso_visual: row.estudoReversoVisualJson ?? undefined,
    estudo_reverso_visual_completo: row.estudoReversoVisualCompletoJson,
    tags: row.tags ?? undefined,
  };
}

function formatErros(error: ReturnType<typeof questaoSeedImportSchema.safeParse>["error"]) {
  if (!error) return [];
  const flat = error.flatten();
  const msgs: string[] = [];
  if (flat.formErrors.length) msgs.push(...flat.formErrors);
  for (const [key, issues] of Object.entries(flat.fieldErrors)) {
    for (const issue of issues ?? []) {
      msgs.push(`${key}: ${issue}`);
    }
  }
  return msgs.slice(0, 3);
}

async function main() {
  const rows = await scriptDb
    .select({
      id: questions.id,
      disciplina: topics.disciplina,
      topico: topics.nome,
      tipo: questions.tipo,
      estiloIdecan: questions.estiloIdecan,
      dificuldade: questions.dificuldade,
      enunciado: questions.enunciado,
      altA: questions.altA,
      altB: questions.altB,
      altC: questions.altC,
      altD: questions.altD,
      altE: questions.altE,
      gabarito: questions.gabarito,
      comentarioJson: questions.comentarioJson,
      estudoReversoVisualJson: questions.estudoReversoVisualJson,
      estudoReversoVisualCompletoJson: questions.estudoReversoVisualCompletoJson,
      tags: questions.tags,
    })
    .from(questions)
    .innerJoin(topics, eq(questions.topicId, topics.id));

  const invalidas: { id: string; topico: string; erros: string[] }[] = [];
  const validas: string[] = [];

  for (const row of rows) {
    const seed = rowToSeedInput(row);

    if (nivelLote007) {
      const ouroCheck = {
        tipo: seed.tipo,
        dificuldade: seed.dificuldade,
        estudo_reverso_visual_completo: seed.estudo_reverso_visual_completo as
          | { versao?: number; telas?: Array<{ id: string }> }
          | null
          | undefined,
      };
      if (isNivelLote007Ouro(ouroCheck)) {
        validas.push(row.id);
      } else {
        invalidas.push({
          id: row.id,
          topico: row.topico,
          erros: ["abaixo do padrão ouro lote-007 (caso_pratico + glossário/fluxo/hierarquia/caso)"],
        });
      }
      continue;
    }

    const parsed = questaoSeedImportSchema.safeParse(seed);
    if (parsed.success) {
      validas.push(row.id);
    } else {
      invalidas.push({
        id: row.id,
        topico: row.topico,
        erros: formatErros(parsed.error),
      });
    }
  }

  const modo = nivelLote007 ? "padrão ouro lote-007" : "padrão v3";
  console.log(`\n🔍 Purge questões fora do ${modo}`);
  console.log(`   Total no banco: ${rows.length}`);
  console.log(`   No padrão: ${validas.length}`);
  console.log(`   Fora do padrão: ${invalidas.length}\n`);

  if (invalidas.length === 0) {
    console.log("✓ Nenhuma questão para remover.");
    await closeScriptDb();
    return;
  }

  for (const item of invalidas) {
    const preview = rows.find((r) => r.id === item.id);
    const enunciado =
      preview?.enunciado.slice(0, 72).replace(/\s+/g, " ") + "…";
    console.log(`✗ [${item.topico}] ${enunciado}`);
    for (const e of item.erros) console.log(`    → ${e}`);
  }

  if (!execute) {
    console.log(
      "\n⚠ Dry-run — nada foi apagado. Rode com --execute para remover.",
    );
    await closeScriptDb();
    return;
  }

  const ids = invalidas.map((i) => i.id);
  await scriptDb.delete(questions).where(inArray(questions.id, ids));

  console.log(`\n🗑 Removidas ${ids.length} questão(ões) (cascade: attempts, srs, estudo_reverso).`);
  console.log(`✓ Restam ${validas.length} questão(ões) no ${modo}.`);
  await closeScriptDb();
}

main().catch(async (err) => {
  console.error(err);
  await closeScriptDb().catch(() => undefined);
  process.exit(1);
});
