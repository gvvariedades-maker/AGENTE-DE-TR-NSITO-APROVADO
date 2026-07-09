/**
 * Gate de cobertura — evita repetir eixo legal / enunciado entre lotes.
 *
 * Uso: npm run validate:cobertura -- content/questoes/legislacao_transito/lote-009.json
 */
import { readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import {
  buildEnunciadosMap,
  scanCoberturaCorpus,
  validarCoberturaLoteCompleto,
} from "../../../../src/lib/questoes-cobertura";
import { questoesImportFileSchema } from "../../../../src/lib/validations/questao";

async function main() {
  const args = process.argv.slice(2);
  const filePath = args.find((a) => !a.startsWith("--"));

  if (!filePath) {
    console.error("Uso: npm run validate:cobertura -- <arquivo.json>");
    process.exit(1);
  }

  const root = process.cwd();
  const absolute = resolve(root, filePath);
  const contentDir = join(root, "content", "questoes");
  const loteRel = relative(contentDir, absolute).replace(/\\/g, "/");

  const raw = await readFile(absolute, "utf-8");
  const json = JSON.parse(raw) as unknown;
  const questoesInput = Array.isArray(json) ? json : [json];
  const parsed = questoesImportFileSchema.safeParse(questoesInput);

  if (!parsed.success) {
    console.error("❌ Schema inválido — rode validate:questoes primeiro.\n");
    console.error(parsed.error.flatten());
    process.exit(1);
  }

  const [corpus, enunciadosMap] = await Promise.all([
    scanCoberturaCorpus(contentDir),
    buildEnunciadosMap(contentDir),
  ]);

  const issues = validarCoberturaLoteCompleto(
    parsed.data,
    loteRel,
    corpus,
    enunciadosMap,
  );

  const erros = issues.filter((i) => i.nivel === "erro");
  const avisos = issues.filter((i) => i.nivel === "aviso");

  console.log(`\n🗂️  validate:cobertura — ${filePath} (${parsed.data.length} questão(ões))\n`);

  for (const issue of issues) {
    const prefix = issue.nivel === "erro" ? "❌" : "⚠";
    const q = `Q${issue.questao_indice + 1}`;
    const conflito = issue.conflito_com ? ` ↔ ${issue.conflito_com}` : "";
    console.log(`${prefix} [${issue.codigo}] ${q}: ${issue.mensagem}${conflito}`);
  }

  console.log(`\nResumo: ${erros.length} erro(s), ${avisos.length} aviso(s)`);

  if (erros.length > 0) {
    console.error("\nConsulte content/questoes/_index/cobertura.json (npm run index:questoes)\n");
    process.exit(1);
  }

  console.log("\n✓ validate:cobertura OK\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
