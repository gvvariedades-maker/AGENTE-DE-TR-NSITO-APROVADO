/**
 * Importa questões de content/questoes/{disciplina}/*.json para o Supabase.
 *
 * Uso: npm run db:seed
 * Requer: DATABASE_URL no .env.local
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { questions, topics } from "../src/lib/db/schema";
import { questoesFileSchema } from "../src/lib/validations/questao";
import type { Disciplina } from "../src/types";

config({ path: ".env.local" });

const CONTENT_DIR = join(process.cwd(), "content", "questoes");

async function getOrCreateTopic(disciplina: Disciplina, topico: string) {
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

async function main() {
  let total = 0;
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
        const topicId = await getOrCreateTopic(q.disciplina, q.topico);
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
          tags: q.tags ?? [],
        });

        total++;
      }

      console.log(`✓ ${dir.name}/${file}`);
    }
  }

  console.log(`\nImportadas: ${total} | Erros: ${errors}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
