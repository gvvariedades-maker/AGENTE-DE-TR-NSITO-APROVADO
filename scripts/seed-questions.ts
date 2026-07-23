/**
 * Importa questões de content/questoes/ e content/questoes-reais/ para o Supabase.
 *
 * Uso:
 *   npm run db:seed
 *   npm run db:seed -- --only-reais
 *   npm run db:seed -- --only-ineditas
 *
 * Requer: DATABASE_PASSWORD + SUPABASE_PROJECT_REF (ou DATABASE_URL válida)
 *
 * Upsert por (topico + enunciado): insere se nova; atualiza todos os campos se já existir.
 *
 * - Inéditas (`content/questoes/`): exigem gate lote-007 ouro.
 * - Reais (`content/questoes-reais/`, meta.origem=real_idecan): seed com aula v2;
 *   NÃO entram no índice de cobertura / npm run proxima.
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

const CONTENT_INEDITAS = join(process.cwd(), "content", "questoes");
const CONTENT_REAIS = join(process.cwd(), "content", "questoes-reais");

type SeedRoot = {
  label: "ineditas" | "reais";
  dir: string;
};

function parseArgs(argv: string[]) {
  const onlyReais = argv.includes("--only-reais");
  const onlyIneditas = argv.includes("--only-ineditas");
  return { onlyReais, onlyIneditas };
}

function isRealIdecan(q: QuestaoSeedImportInput): boolean {
  return q.meta?.origem === "real_idecan";
}

function shouldSeedQuestion(q: QuestaoSeedImportInput, root: SeedRoot): boolean {
  if (root.label === "reais" || isRealIdecan(q)) {
    return Boolean(q.estudo_reverso_visual_completo);
  }
  return isNivelLote007Ouro(q);
}

function shouldScanJson(fileName: string): boolean {
  if (!fileName.endsWith(".json")) return false;
  if (fileName.startsWith("_")) return false;
  return fileName.includes("lote");
}

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
  const tags = [...(q.tags ?? [])];
  if (isRealIdecan(q) && !tags.includes("real_idecan")) {
    tags.push("real_idecan");
  }
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
    pedagogyJson: q.pedagogy ?? null,
    tags,
  };
}

async function seedRoot(
  root: SeedRoot,
  questions: typeof import("../src/lib/db/schema").questions,
  topics: typeof import("../src/lib/db/schema").topics,
  counters: { inserted: number; updated: number; skipped: number; errors: number },
) {
  if (!existsSync(root.dir)) {
    console.log(`(pasta ausente) ${root.dir}`);
    return;
  }

  console.log(`\n── ${root.label}: ${root.dir} ──`);
  const disciplinas = await readdir(root.dir, { withFileTypes: true });

  for (const dir of disciplinas) {
    if (!dir.isDirectory()) continue;
    if (dir.name.startsWith("_")) continue;

    const disciplinaPath = join(root.dir, dir.name);
    const files = await readdir(disciplinaPath);

    for (const file of files) {
      if (!shouldScanJson(file)) continue;

      const raw = await readFile(join(disciplinaPath, file), "utf-8");
      const json = JSON.parse(raw) as unknown;
      const questoesInput = Array.isArray(json) ? json : [json];
      const parsed = questoesImportFileSchema.safeParse(questoesInput);

      if (!parsed.success) {
        console.error(`❌ ${dir.name}/${file}:`, parsed.error.flatten());
        console.error(
          "  → Rode npm run validate:lote -- <arquivo.json> antes do seed",
        );
        counters.errors++;
        continue;
      }

      let fileInserted = 0;
      let fileUpdated = 0;
      let fileSkipped = 0;

      for (const q of parsed.data) {
        if (!shouldSeedQuestion(q, root)) {
          fileSkipped++;
          counters.skipped++;
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
          fileUpdated++;
          counters.updated++;
          continue;
        }

        await scriptDb.insert(questions).values(values);
        fileInserted++;
        counters.inserted++;
      }

      console.log(
        `✓ ${root.label}/${dir.name}/${file} (+${fileInserted} ~${fileUpdated} skip ${fileSkipped})`,
      );
    }
  }
}

async function main() {
  const { onlyReais, onlyIneditas } = parseArgs(process.argv.slice(2));

  const topicResult = await seedTopics();
  console.log(
    `Tópicos Anexo I: ${topicResult.created} criados | ${topicResult.updated} atualizados | ${topicResult.skipped} já ok`,
  );

  const { questions, topics } = await import("../src/lib/db/schema");
  const counters = { inserted: 0, updated: 0, skipped: 0, errors: 0 };

  const roots: SeedRoot[] = [];
  if (!onlyReais) {
    roots.push({ label: "ineditas", dir: CONTENT_INEDITAS });
  }
  if (!onlyIneditas) {
    roots.push({ label: "reais", dir: CONTENT_REAIS });
  }

  for (const root of roots) {
    await seedRoot(root, questions, topics, counters);
  }

  console.log(
    `\nInseridas: ${counters.inserted} | Atualizadas (upsert): ${counters.updated} | Ignoradas: ${counters.skipped} | Erros: ${counters.errors}`,
  );
  await closeScriptDb();
}

main().catch(async (err) => {
  console.error(err);
  await closeScriptDb().catch(() => undefined);
  process.exit(1);
});
