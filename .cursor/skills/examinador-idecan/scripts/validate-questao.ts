/**
 * Valida arquivos JSON de questões contra o schema Zod do projeto.
 *
 * Uso:
 *   npx tsx .cursor/skills/examinador-idecan/scripts/validate-questao.ts content/questoes/legislacao_transito/lote-001.json
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { questoesFileSchema } from "../../../../src/lib/validations/questao";

async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error("Uso: npx tsx validate-questao.ts <arquivo.json>");
    process.exit(1);
  }

  const absolute = resolve(process.cwd(), filePath);
  const raw = await readFile(absolute, "utf-8");
  const json = JSON.parse(raw) as unknown;
  const result = questoesFileSchema.safeParse(json);

  if (!result.success) {
    console.error(`❌ ${filePath}\n`);
    console.error(result.error.flatten());
    process.exit(1);
  }

  const questoes = result.data;
  const gabaritos: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };

  for (const q of questoes) {
    gabaritos[q.gabarito] = (gabaritos[q.gabarito] ?? 0) + 1;
  }

  console.log(`✓ ${filePath} — ${questoes.length} questão(ões) válidas`);
  console.log(`  Gabaritos: ${JSON.stringify(gabaritos)}`);

  const semFundamento = questoes.filter(
    (q) => !q.comentario.fundamento_legal?.trim(),
  );
  if (semFundamento.length > 0) {
    console.warn(`  ⚠ ${semFundamento.length} sem fundamento_legal`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
