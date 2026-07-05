/**
 * Importa questões de content/questoes/{disciplina}/*.json para o Supabase.
 *
 * Uso: npm run db:seed
 * Requer: DATABASE_PASSWORD + SUPABASE_PROJECT_REF (ou DATABASE_URL válida)
 */
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { config } from "dotenv";
import { and, eq } from "drizzle-orm";
import { questoesFileSchema } from "../src/lib/validations/questao";
import type { Disciplina } from "../src/types";

if (existsSync(".env.local")) {
  config({ path: ".env.local" });
} else {
  config();
}

const CONTENT_DIR = join(process.cwd(), "content", "questoes");

async function getOrCreateTopic(
  db: Awaited<typeof import("../src/lib/db")>["db"],
  topics: typeof import("../src/lib/db/schema").topics,
  disciplina: Disciplina,
  topico: string,
) {
  const [existing] = await db
    .select()
    .from(topics)
    .where(eq(topics.nome, topico))
    .limit(1);

  if (existing) return existing.id;

  const [created] = await db
    .insert(topics)
    .values({ disciplina, nome: topico })
    .returning({ id: topics.id });

  return created.id;
}

async function questionExists(
  db: Awaited<typeof import("../src/lib/db")>["db"],
  questions: typeof import("../src/lib/db/schema").questions,
  topicId: string,
  enunciado: string,
) {
  const [existing] = await db
    .select({ id: questions.id })
    .from(questions)
    .where(and(eq(questions.topicId, topicId), eq(questions.enunciado, enunciado)))
    .limit(1);

  return existing ?? null;
}

async function main() {
  const { db } = await import("../src/lib/db");
  const { questions, topics } = await import("../src/lib/db/schema");

  let total = 0;
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
      const parsed = questoesFileSchema.safeParse(JSON.parse(raw));

      if (!parsed.success) {
        console.error(`❌ ${dir.name}/${file}:`, parsed.error.flatten());
        errors++;
        continue;
      }

      for (const q of parsed.data) {
        const topicId = await getOrCreateTopic(db, topics, q.disciplina, q.topico);

        const existente = await questionExists(db, questions, topicId, q.enunciado);

        if (existente) {
          if (q.estudo_reverso_visual) {
            await db
              .update(questions)
              .set({ estudoReversoVisualJson: q.estudo_reverso_visual })
              .where(eq(questions.id, existente.id));
          }
          skipped++;
          continue;
        }

        const alts = q.alternativas;

        await db.insert(questions).values({
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
          tags: q.tags ?? [],
        });

        total++;
      }

      console.log(`✓ ${dir.name}/${file}`);
    }
  }

  console.log(`\nImportadas: ${total} | Ignoradas (já existem): ${skipped} | Erros: ${errors}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
