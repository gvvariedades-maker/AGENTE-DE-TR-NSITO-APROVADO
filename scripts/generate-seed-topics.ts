/**
 * Gera scripts/seed-topics.sql a partir de scripts/edital-topics.ts
 * Uso: npm run generate:seed-topics
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { EDITAL_TOPICS } from "./edital-topics";

function sqlEscape(value: string): string {
  return value.replace(/'/g, "''");
}

const lines = [
  "-- Gerado por scripts/generate-seed-topics.ts — Anexo I retificado Edital 04/2026",
  `-- Total: ${EDITAL_TOPICS.length} microtópicos`,
  "-- Preferir: npm run db:seed:topics (Drizzle). Este SQL é fallback/manual.",
  "",
];

for (const { disciplina, slug, editalRef } of EDITAL_TOPICS) {
  lines.push(
    `INSERT INTO topics (disciplina, nome, edital_ref) SELECT '${sqlEscape(disciplina)}', '${sqlEscape(slug)}', '${sqlEscape(editalRef)}' WHERE NOT EXISTS (SELECT 1 FROM topics WHERE nome = '${sqlEscape(slug)}');`,
  );
}

const outPath = join(process.cwd(), "scripts", "seed-topics.sql");
writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8");
console.log(`OK ${EDITAL_TOPICS.length} tópicos → ${outPath}`);
