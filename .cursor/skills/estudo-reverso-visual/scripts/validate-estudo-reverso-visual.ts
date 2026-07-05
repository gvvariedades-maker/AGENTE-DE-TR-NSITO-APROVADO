/**
 * Valida estudo_reverso_visual em arquivos JSON de questões.
 *
 * Uso:
 *   npm run validate:estudo-reverso-visual -- content/questoes/legislacao_transito/lote-002.json
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { CorpusLegal, validarTextosLegais } from "../../../../src/lib/validations/citacao-legal";
import { estudoReversoVisualSchema } from "../../../../src/lib/validations/estudo-reverso-visual";
import { questoesFileSchema } from "../../../../src/lib/validations/questao";
import type { TelaVisual } from "../../../../src/types/estudo-reverso-visual";

function textosLegaisDasTelas(telas: TelaVisual[]): string[] {
  const textos: string[] = [];
  for (const tela of telas) {
    if (tela.tipo === "trecho_legal") {
      textos.push(tela.conteudo.fonte, tela.conteudo.texto);
    }
    if (tela.tipo === "fluxograma") {
      for (const no of tela.conteudo.nos) {
        if (no.ref) textos.push(no.ref);
      }
    }
  }
  return textos;
}

async function main() {
  const args = process.argv.slice(2);
  const skipCitacoes = args.includes("--skip-citacoes");
  const filePath = args.find((a) => !a.startsWith("--"));

  if (!filePath) {
    console.error(
      "Uso: npm run validate:estudo-reverso-visual -- <arquivo.json> [--skip-citacoes]",
    );
    process.exit(1);
  }

  const absolute = resolve(process.cwd(), filePath);
  const raw = await readFile(absolute, "utf-8");
  const json = JSON.parse(raw) as unknown;
  const result = questoesFileSchema.safeParse(json);

  if (!result.success) {
    console.error(`❌ Schema questão inválido em ${filePath}`);
    console.error(result.error.flatten());
    process.exit(1);
  }

  const questoes = result.data;
  let erros = 0;
  let avisos = 0;
  let comVisual = 0;

  const corpus = skipCitacoes
    ? null
    : await CorpusLegal.carregar(resolve(process.cwd(), "conteúdo"));

  for (const [i, q] of questoes.entries()) {
    const label = `Q${i + 1} [${q.topico}]`;

    if (!q.estudo_reverso_visual) {
      if (q.dificuldade >= 3) {
        avisos++;
        console.warn(`  ⚠ ${label} — sem estudo_reverso_visual (dificuldade ${q.dificuldade})`);
      }
      continue;
    }

    comVisual++;
    const visualResult = estudoReversoVisualSchema.safeParse(q.estudo_reverso_visual);
    if (!visualResult.success) {
      erros++;
      console.error(`  ❌ ${label} — visual inválido:`);
      console.error(visualResult.error.flatten());
      continue;
    }

    console.log(`  ✓ ${label} — ${visualResult.data.telas.length} telas (${visualResult.data.arquetipo})`);

    if (!skipCitacoes && corpus) {
      const textos = [
        visualResult.data.fundamento_slug,
        q.comentario.fundamento_legal,
        ...textosLegaisDasTelas(visualResult.data.telas),
      ];
      const citacoes = validarTextosLegais(textos, corpus);
      for (const r of citacoes) {
        if (!r.valido) {
          erros++;
          console.error(`  ❌ ${label} citação "${r.citacao.raw}" — ${r.motivo}`);
        } else if (r.nivel === "aviso") {
          avisos++;
          console.warn(`  ⚠ ${label} citação "${r.citacao.raw}" — ${r.motivo}`);
        }
      }
    }
  }

  console.log(
    `\n${filePath}: ${comVisual}/${questoes.length} com visual | erros: ${erros} | avisos: ${avisos}`,
  );

  if (erros > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
