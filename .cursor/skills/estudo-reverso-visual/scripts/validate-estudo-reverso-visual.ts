/**
 * Valida estudo_reverso_visual em arquivos JSON de questões.
 *
 * Documentação: .cursor/skills/estudo-reverso-visual/DOCUMENTACAO.md
 *
 * Uso:
 *   npm run validate:estudo-reverso-visual -- content/questoes/legislacao_transito/lote-002.json
 *   npm run validate:estudo-reverso-visual -- .cursor/skills/estudo-reverso-visual/exemplos-ouro/ctb-embriaguez.json
 *
 * Aceita array de questões ou objeto único. Flag --skip-citacoes ignora corpus legal.
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { CorpusLegal, validarTextosLegais } from "../../../../src/lib/validations/citacao-legal";
import {
  estudoReversoVisualCompletoSchema,
  estudoReversoVisualSchema,
  listarErrosCoerenciaV1V2,
} from "../../../../src/lib/validations/estudo-reverso-visual";
import { questoesImportFileSchema } from "../../../../src/lib/validations/questao";
import type { TelaVisual } from "../../../../src/types/estudo-reverso-visual";
import type { GrifoInput } from "../../../../src/lib/grifo-offsets";

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
  if (args.includes("--legacy-grifos")) {
    process.env.GRIFO_LEGACY = "1";
  }
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
  const questoesInput = Array.isArray(json) ? json : [json];
  const result = questoesImportFileSchema.safeParse(questoesInput);

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
    const temV1 = Boolean(q.estudo_reverso_visual);
    const temV2 = Boolean(q.estudo_reverso_visual_completo);

    if (!temV1 && !temV2) {
      if (q.dificuldade >= 3) {
        avisos++;
        console.warn(`  ⚠ ${label} — sem trilha visual (dificuldade ${q.dificuldade})`);
      }
      continue;
    }

    let visualResult: ReturnType<typeof estudoReversoVisualSchema.safeParse> | null = null;

    if (temV1) {
      comVisual++;
      visualResult = estudoReversoVisualSchema.safeParse(q.estudo_reverso_visual);
      if (!visualResult.success) {
        erros++;
        console.error(`  ❌ ${label} — visual inválido:`);
        console.error(visualResult.error.flatten());
      } else {
        console.log(
          `  ✓ ${label} — ${visualResult.data.telas.length} telas express (${visualResult.data.arquetipo})`,
        );
      }
    }

    if (temV2 && q.estudo_reverso_visual_completo) {
      if (!temV1) comVisual++;
      const completoResult = estudoReversoVisualCompletoSchema.safeParse(
        q.estudo_reverso_visual_completo,
      );
      if (!completoResult.success) {
        erros++;
        console.error(`  ❌ ${label} — visual completo inválido:`);
        console.error(completoResult.error.flatten());
      } else {
        console.log(
          `  ✓ ${label} — ${completoResult.data.telas.length} telas completo (v2)`,
        );

        if (process.env.GRIFO_LEGACY === "1") {
          for (const tela of completoResult.data.telas) {
            if (tela.tipo !== "trecho_legal") continue;
            for (const g of (tela.conteudo.trechos_grifados ?? []) as GrifoInput[]) {
              if (!g.texto_grifado?.trim()) {
                avisos++;
                console.warn(
                  `  ⚠ ${label} tela "${tela.id}": texto_grifado ausente (modo --legacy-grifos)`,
                );
              }
            }
          }
        }

        if (visualResult?.success) {
          for (const msg of listarErrosCoerenciaV1V2(
            visualResult.data,
            completoResult.data,
          )) {
            erros++;
            console.error(`  ❌ ${label} — coerência v1↔v2: ${msg}`);
          }
        }

        if (!skipCitacoes && corpus) {
          const textosCompleto = [
            completoResult.data.fundamento_slug,
            ...textosLegaisDasTelas(completoResult.data.telas),
          ];
          const citacoesC = validarTextosLegais(textosCompleto, corpus);
          for (const r of citacoesC) {
            if (!r.valido) {
              erros++;
              console.error(
                `  ❌ ${label} completo citação "${r.citacao.raw}" — ${r.motivo}`,
              );
            }
          }
        }
      }
    }

    if (visualResult?.success && !skipCitacoes && corpus) {
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
