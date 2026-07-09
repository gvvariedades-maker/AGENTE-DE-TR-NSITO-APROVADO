/**
 * Importa questões de content/questoes/{disciplina}/*.json para o Supabase.
 *
 * Uso: npm run db:seed
 * Requer: DATABASE_PASSWORD + SUPABASE_PROJECT_REF (ou DATABASE_URL válida)
 *
 * Upsert por (topico + enunciado): insere se nova; atualiza todos os campos se já existir.
 */
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { config } from "dotenv";
import { and, eq } from "drizzle-orm";
import { isNivelLote007Ouro } from "../src/lib/validations/estudo-reverso-visual";
import {
  questoesImportFileSchema,
  type QuestaoSeedImportInput,
} from "../src/lib/validations/questao";
import type { Disciplina } from "../src/types";
import { getEditalTopic } from "./edital-topics";
import { seedTopics } from "./seed-topics";
import { closeScriptDb, scriptDb } from "./script-db";

if (existsSync(".env.local")) {
  config({ path: ".env.local" });
} else {
  config();
}

const CONTENT_DIR = join(process.cwd(), "content", "questoes");

async function getOrCreateTopic(
  topics: typeof import("../src/lib/db/schema").topics,
  disciplina: Disciplina,
  topico: string,
) {
  const [existing] = await scriptDb
    .select()
    .from(topics)
    .where(eq(topics.nome, topico))
    .limit(1);

  if (existing) return existing.id;

  const editalTopic = getEditalTopic(topico);

  const [created] = await scriptDb
    .insert(topics)
    .values({
      disciplina,
      nome: topico,
      editalRef: editalTopic?.editalRef ?? null,
    })
    .returning({ id: topics.id });

  return created.id;
}

async function questionExists(
  questions: typeof import("../src/lib/db/schema").questions,
  topicId: string,
  enunciado: string,
) {
  const [existing] = await scriptDb
    .select({ id: questions.id })
    .from(questions)
    .where(and(eq(questions.topicId, topicId), eq(questions.enunciado, enunciado)))
    .limit(1);

  return existing ?? null;
}

function questionValuesFromSeed(topicId: string, q: QuestaoSeedImportInput) {
  const alts = q.alternativas;
  return {
    topicId,
    enunciado: q.enunciado,
    altA: alts.A,
    altB: alts.B,
    altC: alts.C,
    altD: alts.D,
    altE: alts.E ?? null,
    gabarito: q.gabarito,
    tipo: q.tipo,
    estiloIdecan: q.estilo_idecan ?? null,
    dificuldade: q.dificuldade,
    comentarioJson: q.comentario,
    estudoReversoVisualJson: q.estudo_reverso_visual ?? null,
    estudoReversoVisualCompletoJson: q.estudo_reverso_visual_completo,
    tags: q.tags ?? [],
  };
}

async function main() {
  const topicResult = await seedTopics();
  console.log(
    `Tópicos Anexo I: ${topicResult.created} criados | ${topicResult.updated} atualizados | ${topicResult.skipped} já ok`,
  );
  console.log("");

  const { questions, topics } = await import("../src/lib/db/schema");

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  const disciplinas = await readdir(CONTENT_DIR, { withFileTypes: true });

  for (const dir of disciplinas) {
    if (!dir.isDirectory()) continue;

    const disciplinaPath = join(CONTENT_DIR, dir.name);
    const files = await readdir(disciplinaPath);

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const raw = await readFile(join(disciplinaPath, file), "utf-8");
      const json = JSON.parse(raw) as unknown;
      const questoesInput = Array.isArray(json) ? json : [json];
      const parsed = questoesImportFileSchema.safeParse(questoesInput);

      if (!parsed.success) {
        console.error(`❌ ${dir.name}/${file}:`, parsed.error.flatten());
        console.error(
          "  → Rode npm run validate:lote -- content/questoes/.../arquivo.json antes do seed",
        );
        errors++;
        continue;
      }

      for (const q of parsed.data) {
        if (!isNivelLote007Ouro(q)) {
          skipped++;
          continue;
        }

        const topicId = await getOrCreateTopic(topics, q.disciplina, q.topico);

        const existente = await questionExists(questions, topicId, q.enunciado);

        const values = questionValuesFromSeed(topicId, q);

        if (existente) {
          await scriptDb
            .update(questions)
            .set(values)
            .where(eq(questions.id, existente.id));
          updated++;
          continue;
        }

        await scriptDb.insert(questions).values(values);
        inserted++;
      }

      console.log(`✓ ${dir.name}/${file}`);
    }
  }

  console.log(
    `\nInseridas: ${inserted} | Atualizadas (upsert): ${updated} | Ignoradas (abaixo lote-007): ${skipped} | Erros: ${errors}`,
  );
  await closeScriptDb();
}

main().catch(async (err) => {
  console.error(err);
  await closeScriptDb().catch(() => undefined);
  process.exit(1);
});
