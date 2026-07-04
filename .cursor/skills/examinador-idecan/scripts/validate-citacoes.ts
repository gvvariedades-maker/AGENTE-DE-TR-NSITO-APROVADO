/**
 * Valida citações legais em arquivos JSON de questões contra conteúdo/ local.
 *
 * Uso:
 *   npx tsx .cursor/skills/examinador-idecan/scripts/validate-citacoes.ts content/questoes/.../lote.json
 *   npx tsx .cursor/skills/examinador-idecan/scripts/validate-citacoes.ts --texto "CTB, art. 165-A"
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  CorpusLegal,
  extrairCitacoes,
  validarQuestaoLegislacao,
  validarTextosLegais,
} from "../../../../src/lib/validations/citacao-legal";
import { questoesFileSchema } from "../../../../src/lib/validations/questao";

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      "Uso:\n" +
        "  validate-citacoes.ts <arquivo.json>\n" +
        '  validate-citacoes.ts --texto "CTB, art. 165-A"',
    );
    process.exit(1);
  }

  const conteudoDir = resolve(process.cwd(), "conteúdo");
  const corpus = await CorpusLegal.carregar(conteudoDir);

  if (args[0] === "--texto") {
    const texto = args.slice(1).join(" ");
    if (!texto) {
      console.error("Informe o texto após --texto");
      process.exit(1);
    }

    const citacoes = extrairCitacoes(texto);
    const resultados = validarTextosLegais([texto], corpus);
    imprimirResultados("texto", resultados, citacoes.length);
    process.exit(resultados.some((r) => !r.valido) ? 1 : 0);
  }

  const filePath = args[0];
  const absolute = resolve(process.cwd(), filePath);
  const raw = await readFile(absolute, "utf-8");
  const json = JSON.parse(raw) as unknown;
  const parsed = questoesFileSchema.safeParse(json);

  if (!parsed.success) {
    console.error(`❌ JSON inválido: ${filePath}`);
    console.error(parsed.error.flatten());
    process.exit(1);
  }

  let erros = 0;
  let avisos = 0;

  for (const [i, q] of parsed.data.entries()) {
    const resultados = validarQuestaoLegislacao(
      q.comentario.fundamento_legal,
      q.comentario.estudo_reverso,
      corpus,
    );

    const falhas = resultados.filter((r) => !r.valido);
    const warns = resultados.filter((r) => r.valido && r.nivel === "aviso");

    if (falhas.length === 0 && warns.length === 0) continue;

    console.log(`\nQuestão ${i + 1} [${q.topico}]:`);

    for (const r of falhas) {
      erros++;
      console.error(`  ❌ "${r.citacao.raw}" — ${r.motivo}`);
    }
    for (const r of warns) {
      avisos++;
      console.warn(`  ⚠ "${r.citacao.raw}" — ${r.motivo}`);
    }
  }

  if (erros === 0 && avisos === 0) {
    console.log(`✓ ${filePath} — citações legais verificadas`);
    process.exit(0);
  }

  console.log(`\nResumo: ${erros} erro(s), ${avisos} aviso(s)`);
  process.exit(erros > 0 ? 1 : 0);
}

function imprimirResultados(
  label: string,
  resultados: ReturnType<typeof validarTextosLegais>,
  totalExtraido: number,
) {
  console.log(`Citações extraídas: ${totalExtraido}`);
  for (const r of resultados) {
    const icon = r.valido ? (r.nivel === "aviso" ? "⚠" : "✓") : "❌";
    const line = `${icon} "${r.citacao.raw}" — ${r.motivo}`;
    if (!r.valido) console.error(line);
    else if (r.nivel === "aviso") console.warn(line);
    else console.log(line);
  }
  if (resultados.length === 0) {
    console.warn(`Nenhuma citação estruturada detectada em: ${label}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
