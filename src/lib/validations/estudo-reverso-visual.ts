import { z } from "zod";
import { ARQUETIPOS_VISUAIS } from "@/types/estudo-reverso-visual";

const MAX_PALAVRAS_TELA = 120;
const MAX_NOS_FLUXO = 8;
const MAX_MACETE_CHARS = 80;

function contarPalavras(texto: string): number {
  return texto.trim().split(/\s+/).filter(Boolean).length;
}

function extrairTextosTela(tela: z.infer<typeof telaVisualSchema>): string[] {
  const textos: string[] = [tela.titulo];
  const c = tela.conteudo as Record<string, unknown>;

  switch (tela.tipo) {
    case "texto_destaque":
      textos.push(c.texto as string);
      break;
    case "fluxograma":
      for (const n of c.nos as { label: string }[]) textos.push(n.label);
      break;
    case "comparacao":
      for (const linha of c.linhas as [string, string][]) {
        textos.push(linha[0], linha[1]);
      }
      break;
    case "matriz_assertivas":
      for (const item of c.itens as { texto: string }[]) textos.push(item.texto);
      textos.push(c.gabarito_resumo as string);
      break;
    case "tabela_gradacao":
      for (const linha of c.linhas as { faixa: string; classificacao: string }[]) {
        textos.push(linha.faixa, linha.classificacao);
      }
      break;
    case "trecho_legal":
      textos.push(c.texto as string);
      break;
    case "linha_tempo":
      for (const ev of c.eventos as { rotulo: string; descricao: string }[]) {
        textos.push(ev.rotulo, ev.descricao);
      }
      break;
    case "diagrama_competencia":
      for (const n of c.nos as { label: string }[]) textos.push(n.label);
      break;
    case "micro_recall":
      textos.push(c.pergunta as string, c.resposta_esperada as string);
      break;
  }

  return textos;
}

const conteudoTextoDestaqueSchema = z.object({
  texto: z.string().min(1),
  destaques: z.array(z.string()).optional(),
});

const conteudoFluxogramaSchema = z.object({
  nos: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        tipo: z.enum(["pergunta", "acao", "lei", "resultado"]),
        ref: z.string().optional(),
      }),
    )
    .min(2)
    .max(MAX_NOS_FLUXO),
  arestas: z.array(
    z.object({
      de: z.string().min(1),
      para: z.string().min(1),
      rotulo: z.string().optional(),
    }),
  ),
});

const conteudoComparacaoSchema = z.object({
  colunas: z.tuple([z.string().min(1), z.string().min(1)]),
  linhas: z.array(z.tuple([z.string().min(1), z.string().min(1)])).min(1),
});

const conteudoMatrizAssertivasSchema = z.object({
  itens: z
    .array(
      z.object({
        id: z.string().min(1),
        texto: z.string().min(1),
        correto: z.boolean(),
      }),
    )
    .min(1),
  gabarito_resumo: z.string().min(1),
});

const conteudoTabelaGradacaoSchema = z.object({
  titulo_colunas: z.tuple([z.string().min(1), z.string().min(1)]),
  linhas: z
    .array(
      z.object({
        faixa: z.string().min(1),
        classificacao: z.string().min(1),
        destaque: z.boolean().optional(),
      }),
    )
    .min(1),
});

const conteudoTrechoLegalSchema = z.object({
  fonte: z.string().min(1),
  texto: z.string().min(1),
  trechos_grifados: z
    .array(
      z.object({
        inicio: z.number().int().min(0),
        fim: z.number().int().min(1),
        motivo: z.string().min(1),
      }),
    )
    .optional(),
});

const conteudoLinhaTempoSchema = z.object({
  eventos: z
    .array(
      z.object({
        ordem: z.number().int().min(1),
        rotulo: z.string().min(1),
        descricao: z.string().min(1),
      }),
    )
    .min(2),
});

const conteudoDiagramaCompetenciaSchema = z.object({
  nos: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        nivel: z.number().int().min(0).max(3),
      }),
    )
    .min(2),
  arestas: z.array(
    z.object({
      de: z.string().min(1),
      para: z.string().min(1),
      rotulo: z.string().optional(),
    }),
  ),
});

const conteudoMicroRecallSchema = z.object({
  pergunta: z.string().min(1),
  resposta_esperada: z.string().min(1),
  dica: z.string().optional(),
  aceitar_variacoes: z.array(z.string()).optional(),
});

export const telaVisualSchema = z.discriminatedUnion("tipo", [
  z.object({
    id: z.string().min(1),
    titulo: z.string().min(1),
    tipo: z.literal("texto_destaque"),
    conteudo: conteudoTextoDestaqueSchema,
  }),
  z.object({
    id: z.string().min(1),
    titulo: z.string().min(1),
    tipo: z.literal("fluxograma"),
    conteudo: conteudoFluxogramaSchema,
  }),
  z.object({
    id: z.string().min(1),
    titulo: z.string().min(1),
    tipo: z.literal("comparacao"),
    conteudo: conteudoComparacaoSchema,
  }),
  z.object({
    id: z.string().min(1),
    titulo: z.string().min(1),
    tipo: z.literal("matriz_assertivas"),
    conteudo: conteudoMatrizAssertivasSchema,
  }),
  z.object({
    id: z.string().min(1),
    titulo: z.string().min(1),
    tipo: z.literal("tabela_gradacao"),
    conteudo: conteudoTabelaGradacaoSchema,
  }),
  z.object({
    id: z.string().min(1),
    titulo: z.string().min(1),
    tipo: z.literal("trecho_legal"),
    conteudo: conteudoTrechoLegalSchema,
  }),
  z.object({
    id: z.string().min(1),
    titulo: z.string().min(1),
    tipo: z.literal("linha_tempo"),
    conteudo: conteudoLinhaTempoSchema,
  }),
  z.object({
    id: z.string().min(1),
    titulo: z.string().min(1),
    tipo: z.literal("diagrama_competencia"),
    conteudo: conteudoDiagramaCompetenciaSchema,
  }),
  z.object({
    id: z.string().min(1),
    titulo: z.string().min(1),
    tipo: z.literal("micro_recall"),
    conteudo: conteudoMicroRecallSchema,
  }),
]);

export const estudoReversoVisualSchema = z
  .object({
    versao: z.literal(1),
    arquetipo: z.enum(ARQUETIPOS_VISUAIS),
    arquetipo_secundario: z.enum(ARQUETIPOS_VISUAIS).optional(),
    duracao_estimada_seg: z.number().int().min(30).max(600),
    fundamento_slug: z.string().min(1),
    macete_visual: z.string().min(1).max(MAX_MACETE_CHARS),
    telas: z.array(telaVisualSchema).min(4).max(6),
    links_fonte: z
      .array(
        z.object({
          rotulo: z.string().min(1),
          path: z.string().min(1),
        }),
      )
      .min(1),
    ref_visual_id: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const ultima = data.telas[data.telas.length - 1];
    if (ultima.tipo !== "micro_recall") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Última tela deve ser micro_recall",
        path: ["telas"],
      });
    }

    for (let i = 0; i < data.telas.length; i++) {
      const textos = extrairTextosTela(data.telas[i]);
      const totalPalavras = textos.reduce((acc, t) => acc + contarPalavras(t), 0);
      if (totalPalavras > MAX_PALAVRAS_TELA) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Tela "${data.telas[i].id}" excede ${MAX_PALAVRAS_TELA} palavras (${totalPalavras})`,
          path: ["telas", i],
        });
      }
    }
  });

export type EstudoReversoVisualInput = z.infer<typeof estudoReversoVisualSchema>;
