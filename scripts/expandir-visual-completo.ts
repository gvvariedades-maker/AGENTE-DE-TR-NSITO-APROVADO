/**
 * Gera estudo_reverso_visual_completo (v2) para todas as questões de lote
 * que ainda não possuem aula completa.
 *
 * Uso: npx tsx scripts/expandir-visual-completo.ts
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  estudoReversoVisualCompletoSchema,
  type EstudoReversoVisualCompletoInput,
} from "../src/lib/validations/estudo-reverso-visual";
import {
  questoesFileSchema,
  type QuestaoSeedInput,
} from "../src/lib/validations/questao";

type Tela = EstudoReversoVisualCompletoInput["telas"][number];

function extrairErrosPasso(passo: string[]): [string, string][] {
  return passo
    .filter((p) => /Erra|Incorreta/i.test(p))
    .slice(0, 3)
    .map((p) => {
      const idx = p.indexOf(":");
      if (idx === -1) return [p.slice(0, 40), p];
      return [p.slice(0, idx).trim(), p.slice(idx + 1).trim()];
    });
}

function montarCompleto(q: QuestaoSeedInput): EstudoReversoVisualCompletoInput {
  const v1 = q.estudo_reverso_visual;
  const com = q.comentario;
  const telas: Tela[] = [];

  telas.push({
    id: "contexto",
    titulo: "O que a IDECAN testou",
    tipo: "texto_destaque",
    conteudo: {
      texto: com.o_que_testa,
      destaques: q.tags?.slice(0, 3),
    },
  });

  telas.push({
    id: "glossario",
    titulo: "Antes de memorizar",
    tipo: "texto_destaque",
    conteudo: {
      texto: `Foco: ${com.o_que_testa}. Pegadinha típica: ${com.pegadinha.slice(0, 120)}.`,
      destaques: q.tags?.slice(0, 2),
    },
  });

  telas.push({
    id: "porque",
    titulo: "Por que a pegadinha existe",
    tipo: "texto_destaque",
    conteudo: {
      texto: com.pegadinha,
      destaques: ["pegadinha"],
    },
  });

  const v1Nucleo =
    v1?.telas.filter(
      (t) =>
        !["contexto", "macete", "recall", "fixacao"].includes(t.id),
    ) ?? [];

  for (const t of v1Nucleo.slice(0, 2)) {
    telas.push({ ...t, id: `nucleo_${t.id}` } as Tela);
  }

  const erros = extrairErrosPasso(com.passo_a_passo);
  if (erros.length > 0) {
    telas.push({
      id: "distratores",
      titulo: "Por que cada alternativa erra",
      tipo: "comparacao",
      conteudo: {
        colunas: ["Alternativa", "Erro"],
        linhas: erros,
      },
    });
  }

  const pegadinhaV1 = v1?.telas.find((t) => t.id === "pegadinha");
  if (pegadinhaV1?.tipo === "comparacao") {
    telas.push({
      ...pegadinhaV1,
      id: "caso",
      titulo: "O caso desta questão",
    } as Tela);
  } else {
    telas.push({
      id: "caso",
      titulo: "Pegadinha vs correto",
      tipo: "comparacao",
      conteudo: {
        colunas: ["Pegadinha", "Correto"],
        linhas: [
          [com.pegadinha.slice(0, 70), `Gabarito ${q.gabarito}`],
        ],
      },
    });
  }

  const leiV1 = v1?.telas.find((t) => t.tipo === "trecho_legal");
  if (leiV1) {
    telas.push({ ...leiV1, id: "lei" } as Tela);
  } else {
    const fonte = com.fundamento_legal.split(".")[0] ?? com.fundamento_legal;
    telas.push({
      id: "lei",
      titulo: "Fundamento",
      tipo: "trecho_legal",
      conteudo: {
        fonte: fonte.slice(0, 80),
        texto: com.fundamento_legal.slice(0, 220),
      },
    });
  }

  if (com.estudo_reverso.length > 0) {
    telas.push({
      id: "revisar",
      titulo: "Estudo reverso",
      tipo: "texto_destaque",
      conteudo: {
        texto: `Revisar: ${com.estudo_reverso.join(" · ")}`,
        destaques: com.estudo_reverso.slice(0, 2),
      },
    });
  }

  telas.push({
    id: "macete",
    titulo: "Macete",
    tipo: "texto_destaque",
    conteudo: {
      texto: com.macete,
      destaques: [q.gabarito],
    },
  });

  const trimmed = telas.slice(0, 11);
  while (trimmed.length < 7 && com.passo_a_passo.length > trimmed.length) {
    const passo = com.passo_a_passo[trimmed.length - 6];
    if (!passo) break;
    trimmed.splice(trimmed.length - 1, 0, {
      id: `passo_${trimmed.length}`,
      titulo: "Raciocínio",
      tipo: "texto_destaque",
      conteudo: { texto: passo.slice(0, 200) },
    });
  }

  const fundamento =
    v1?.fundamento_slug ??
    q.topico.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 40);

  return {
    versao: 2,
    arquetipo: v1?.arquetipo ?? "comparacao",
    arquetipo_secundario: v1?.arquetipo_secundario,
    publico_alvo: "iniciante",
    duracao_estimada_seg: Math.min(300, Math.max(120, trimmed.length * 22)),
    fundamento_slug: fundamento,
    macete_visual: (v1?.macete_visual ?? com.macete).slice(0, 80),
    telas: trimmed,
    links_fonte:
      v1?.links_fonte ?? [
        {
          rotulo: com.fundamento_legal.split(",")[0] ?? "Anexo I",
          path: "conteúdo/",
        },
      ],
  };
}

const CONTENT = join(process.cwd(), "content", "questoes");

async function main() {
  let gerados = 0;
  let ignorados = 0;
  let erros = 0;

  const disciplinas = await readdir(CONTENT, { withFileTypes: true });

  for (const dir of disciplinas) {
    if (!dir.isDirectory() || dir.name.startsWith("_")) continue;

    const pasta = join(CONTENT, dir.name);
    const files = await readdir(pasta);

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const path = join(pasta, file);
      const raw = await readFile(path, "utf-8");
      const questoes = questoesFileSchema.parse(JSON.parse(raw));
      let alterado = false;

      for (const q of questoes) {
        if (q.estudo_reverso_visual_completo) {
          ignorados++;
          continue;
        }

        const completo = montarCompleto(q);
        const parsed = estudoReversoVisualCompletoSchema.safeParse(completo);
        if (!parsed.success) {
          console.error(
            `❌ [${q.topico}] ${file}:`,
            parsed.error.flatten().fieldErrors,
          );
          erros++;
          continue;
        }

        (
          q as QuestaoSeedInput & {
            estudo_reverso_visual_completo?: EstudoReversoVisualCompletoInput;
          }
        ).estudo_reverso_visual_completo = parsed.data;
        gerados++;
        alterado = true;
      }

      if (alterado) {
        await writeFile(path, `${JSON.stringify(questoes, null, 2)}\n`, "utf-8");
        console.log(`✓ ${dir.name}/${file}`);
      }
    }
  }

  console.log(`\nGerados: ${gerados} | Já tinham v2: ${ignorados} | Erros: ${erros}`);
  if (erros > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
