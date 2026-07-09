/**
 * Aplica aulas completas v2 curadas manualmente (scripts/data/manual/)
 * sobre os lotes em content/questoes/.
 *
 * Uso: npx tsx scripts/apply-aulas-completo-manual.ts
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { aulasCompletoManual, AULAS_MANUAL_COUNT } from "./data/manual/index";
import { estudoReversoVisualCompletoSchema } from "../src/lib/validations/estudo-reverso-visual";

const CONTENT_DIR = join(process.cwd(), "content/questoes");

const LOTES = [
  "informatica/lote-001.json",
  "portugues/lote-001.json",
  "direito_constitucional/lote-001.json",
  "legislacao_transito/lote-001.json",
  "legislacao_transito/lote-003.json",
  "legislacao_transito/lote-004.json",
  "legislacao_transito/lote-001-exemplo.json",
];

async function main() {
  let aplicadas = 0;
  let ignoradas = 0;
  const erros: string[] = [];

  for (const relPath of LOTES) {
    const fullPath = join(CONTENT_DIR, relPath);
    const raw = await readFile(fullPath, "utf-8");
    const questoes = JSON.parse(raw) as Record<string, unknown>[];

    for (let i = 0; i < questoes.length; i++) {
      const key = `${relPath}:${i}`;
      const aula = aulasCompletoManual[key as keyof typeof aulasCompletoManual];

      if (!aula) {
        ignoradas++;
        console.log(`  ⊘ ${key} — sem aula manual (mantido)`);
        continue;
      }

      const parsed = estudoReversoVisualCompletoSchema.safeParse(aula);
      if (!parsed.success) {
        erros.push(`${key}: ${parsed.error.message}`);
        continue;
      }

      questoes[i].estudo_reverso_visual_completo = parsed.data;
      aplicadas++;
      console.log(`  ✓ ${key}`);
    }

    await writeFile(fullPath, JSON.stringify(questoes, null, 2) + "\n", "utf-8");
    console.log(`\n→ ${relPath} salvo\n`);
  }

  console.log(`\nAulas no mapa: ${AULAS_MANUAL_COUNT}`);
  console.log(`Aplicadas: ${aplicadas} | Ignoradas: ${ignoradas} | Erros: ${erros.length}`);

  if (erros.length > 0) {
    console.error("\nErros de validação:");
    for (const e of erros) console.error(`  ${e}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
