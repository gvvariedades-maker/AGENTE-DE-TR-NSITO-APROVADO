/** Gera SQL de seed a partir de content/questoes — uso interno / MCP */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { questoesFileSchema } from "../src/lib/validations/questao";
import type { QuestaoSeedInput } from "../src/lib/validations/questao";

function esc(s: string): string {
  return s.replace(/'/g, "''");
}

const CONTENT_DIR = join(process.cwd(), "content", "questoes");

async function loadAll(): Promise<QuestaoSeedInput[]> {
  const all: QuestaoSeedInput[] = [];
  const disciplinas = await readdir(CONTENT_DIR, { withFileTypes: true });

  for (const dir of disciplinas) {
    if (!dir.isDirectory()) continue;
    const files = await readdir(join(CONTENT_DIR, dir.name));
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const raw = await readFile(join(CONTENT_DIR, dir.name, file), "utf-8");
      all.push(...questoesFileSchema.parse(JSON.parse(raw)));
    }
  }
  return all;
}

async function main() {
  const questoes = await loadAll();
  const topicos = [...new Set(questoes.map((q) => `${q.disciplina}\0${q.topico}`))];
  const lines: string[] = ["BEGIN;"];

  for (const key of topicos) {
    const [disciplina, topico] = key.split("\0");
    lines.push(
      `INSERT INTO topics (disciplina, nome) SELECT '${disciplina}', '${esc(topico)}' WHERE NOT EXISTS (SELECT 1 FROM topics WHERE nome = '${esc(topico)}');`,
    );
  }

  for (const q of questoes) {
    const tags = `{${(q.tags ?? []).map((t) => `"${esc(t)}"`).join(",")}}`;
    const topicSub = `(SELECT id FROM topics WHERE nome = '${esc(q.topico)}' LIMIT 1)`;
    lines.push(
      `INSERT INTO questions (topic_id, enunciado, alt_a, alt_b, alt_c, alt_d, alt_e, gabarito, tipo, estilo_idecan, dificuldade, comentario_json, tags) VALUES (` +
        `${topicSub}, ` +
        `'${esc(q.enunciado)}', ` +
        `'${esc(q.alternativas.A)}', ` +
        `'${esc(q.alternativas.B)}', ` +
        `'${esc(q.alternativas.C)}', ` +
        `'${esc(q.alternativas.D)}', ` +
        `${q.alternativas.E ? `'${esc(q.alternativas.E)}'` : "NULL"}, ` +
        `'${q.gabarito}', ` +
        `'${esc(q.tipo)}', ` +
        `${q.estilo_idecan ? `'${esc(q.estilo_idecan)}'` : "NULL"}, ` +
        `${q.dificuldade}, ` +
        `'${esc(JSON.stringify(q.comentario))}'::jsonb, ` +
        `'${tags}'::text[]);`,
    );
  }

  lines.push("COMMIT;");
  const sql = lines.join("\n");
  const outPath = join(process.cwd(), "scripts", "seed-output.sql");
  const { writeFile } = await import("node:fs/promises");
  await writeFile(outPath, sql, "utf8");
  console.log(`SQL gerado: ${outPath} (${questoes.length} questões)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
