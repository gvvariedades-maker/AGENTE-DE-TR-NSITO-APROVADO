/**
 * Valida arquivos JSON de questões contra o schema Zod do projeto.
 *
 * Uso:
 *   npx tsx .cursor/skills/examinador-idecan/scripts/validate-questao.ts content/questoes/legislacao_transito/lote-001.json
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { CorpusLegal, validarQuestaoLegislacao } from "../../../../src/lib/validations/citacao-legal";
import { questoesImportFileSchema } from "../../../../src/lib/validations/questao";

async function main() {
  const args = process.argv.slice(2);
  const skipCitacoes = args.includes("--skip-citacoes");
  if (args.includes("--legacy-grifos")) {
    process.env.GRIFO_LEGACY = "1";
  }
  if (args.includes("--legacy-transferencia")) {
    process.env.TRANSFERENCIA_LEGACY = "1";
  }
  const filePath = args.find((a) => !a.startsWith("--"));

  if (!filePath) {
    console.error(
      "Uso: npx tsx validate-questao.ts <arquivo.json> [--skip-citacoes] [--legacy-grifos] [--legacy-transferencia]",
    );
    process.exit(1);
  }

  const absolute = resolve(process.cwd(), filePath);
  const raw = await readFile(absolute, "utf-8");
  const json = JSON.parse(raw) as unknown;
  const questoesInput = Array.isArray(json) ? json : [json];
  const result = questoesImportFileSchema.safeParse(questoesInput);

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

  console.log(`✓ ${filePath} — ${questoes.length} questão(ões) válidas (schema import + v2 obrigatório)`);
  console.log(`  Gabaritos: ${JSON.stringify(gabaritos)}`);

  const semFundamento = questoes.filter(
    (q) => !q.comentario.fundamento_legal?.trim(),
  );
  if (semFundamento.length > 0) {
    console.warn(`  ⚠ ${semFundamento.length} sem fundamento_legal`);
  }

  if (skipCitacoes) {
    return;
  }

  const corpus = await CorpusLegal.carregar(resolve(process.cwd(), "conteúdo"));
  let errosCitacao = 0;
  let avisosCitacao = 0;

  for (const [i, q] of questoes.entries()) {
    const resultados = validarQuestaoLegislacao(
      q.comentario.fundamento_legal,
      q.comentario.estudo_reverso,
      corpus,
    );

    for (const r of resultados) {
      if (!r.valido) {
        errosCitacao++;
        console.error(
          `  ❌ Q${i + 1} [${q.topico}] "${r.citacao.raw}" — ${r.motivo}`,
        );
      } else if (r.nivel === "aviso") {
        avisosCitacao++;
        console.warn(
          `  ⚠ Q${i + 1} [${q.topico}] "${r.citacao.raw}" — ${r.motivo}`,
        );
      }
    }
  }

  if (errosCitacao === 0) {
    console.log(`✓ Citações legais verificadas (${avisosCitacao} aviso(s))`);
  } else {
    console.error(`❌ ${errosCitacao} citação(ões) com erro`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
