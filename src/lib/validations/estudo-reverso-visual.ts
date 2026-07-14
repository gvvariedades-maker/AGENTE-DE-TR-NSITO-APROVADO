import { z } from "zod";
import { ARQUETIPOS_VISUAIS, SECOES_VISUAIS, type ConteudoFluxograma } from "@/types/estudo-reverso-visual";
import { isFluxogramaLinear } from "@/lib/estudo-reverso/fluxograma-caminho";
import { validarGrifosTrechoLegal, type GrifoInput } from "@/lib/grifo-offsets";
import {
  metaQuestaoSchema,
  type MetaTransferenciaCampos,
} from "@/lib/validations/transferencia-pedagogica";
import {
  MECANISMOS_DISTRATOR,
  type MecanismoDistrator,
} from "@/lib/mecanismo-distrator-labels";

export { MECANISMOS_DISTRATOR, type MecanismoDistrator };

/**
 * Validação Zod do estudo reverso visual (v1 expressa + v2 completa).
 * @see .cursor/skills/estudo-reverso-visual/DOCUMENTACAO.md
 */

const MAX_PALAVRAS_TELA = 120;
const MAX_PALAVRAS_TELA_COMPLETO = 150;
const MAX_NOS_FLUXO = 7;
const MAX_LINHAS_COMPARACAO = 5;
const MAX_FAIXAS_GRADACAO = 5;
const MAX_EVENTOS_LINHA_TEMPO = 6;
const MAX_ASSERTIVAS = 5;
const MAX_NOS_COMPETENCIA = 8;
const MAX_PALAVRAS_TRECHO_LEGAL = 80;
const MAX_GRIFOS_TRECHO_LEGAL = 3;
const MAX_PERGUNTAS_FLUXO = 2;
const MAX_NOS_FLUXO_METODO = 4;
const MAX_RESULTADOS_FLUXO_METODO = 1;
const MAX_MACETE_CHARS = 80;

const linksFonteSchema = z
  .array(
    z.object({
      rotulo: z.string().min(1),
      path: z.string().min(1),
    }),
  )
  .min(1);

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
      if (c.intro) textos.push(c.intro as string);
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
  }

  return textos;
}

function validarPalavrasPorTela(
  telas: z.infer<typeof telaVisualSchema>[],
  maxPalavras: number,
  ctx: z.RefinementCtx,
) {
  for (let i = 0; i < telas.length; i++) {
    const textos = extrairTextosTela(telas[i]);
    const totalPalavras = textos.reduce((acc, t) => acc + contarPalavras(t), 0);
    if (totalPalavras > maxPalavras) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Tela "${telas[i].id}" excede ${maxPalavras} palavras (${totalPalavras})`,
        path: ["telas", i],
      });
    }
  }
}

/** Gate item 2 — nenhuma sequência de 2 telas só texto_destaque (com exceções pedagógicas). */
export function validarSemTextoConsecutivo(
  telas: z.infer<typeof telaVisualSchema>[],
  ctx: z.RefinementCtx,
) {
  for (let i = 1; i < telas.length; i++) {
    if (telas[i].tipo !== "texto_destaque" || telas[i - 1].tipo !== "texto_destaque") {
      continue;
    }
    const atual = telas[i];
    const idAtual = atual.id.toLowerCase();
    const tituloAtual = atual.titulo.toLowerCase();
    const parPermitido =
      idAtual === "glossario" ||
      tituloAtual.includes("glossário") ||
      tituloAtual.includes("pré-treino") ||
      idAtual === "macete" ||
      tituloAtual.includes("macete");
    if (parPermitido) continue;

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Telas "${telas[i - 1].id}" e "${telas[i].id}" são só texto_destaque consecutivas (dual coding)`,
      path: ["telas", i],
    });
  }
}

function linhaContemMecanismo(linha: string): boolean {
  return MECANISMOS_DISTRATOR.some((slug) => linha.includes(slug));
}

function isTelaDistratores(tela: z.infer<typeof telaVisualSchema>): boolean {
  if (tela.tipo !== "comparacao") return false;
  const id = tela.id.toLowerCase();
  const titulo = tela.titulo.toLowerCase();
  return id.includes("distrat") || titulo.includes("errada") || titulo.includes("distrator");
}

/** Gate item 4 — tela de distratores com slug por alternativa errada (v2). */
export function validarTelaDistratores(
  telas: z.infer<typeof telaVisualSchema>[],
  ctx: z.RefinementCtx,
) {
  const tela = telas.find(isTelaDistratores);
  if (!tela || tela.tipo !== "comparacao") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Aula v2 exige tela comparacao de distratores (id "distratores" ou título com "errada")',
      path: ["telas"],
    });
    return;
  }

  const linhasSemSlug = tela.conteudo.linhas.filter(
    ([col1]) => !linhaContemMecanismo(col1),
  );
  if (linhasSemSlug.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Tela "${tela.id}": cada linha deve incluir slug de mecanismo (${MECANISMOS_DISTRATOR.join(", ")}) na 1ª coluna`,
      path: ["telas", telas.indexOf(tela)],
    });
  }
}

const ORGAOS_CONTRASTE = [
  "prf",
  "pf",
  "pff",
  "pm",
  "pc",
  "cbm",
  "contran",
  "cetran",
  "detran",
  "senatran",
  "jari",
  "guarda",
  "sttp",
] as const;

function normalizarTextoContraste(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extrairOrgaosContraste(texto: string): string[] {
  const n = normalizarTextoContraste(texto);
  return ORGAOS_CONTRASTE.filter((o) => new RegExp(`\\b${o}\\b`).test(n));
}

function isTelaContraste(tela: z.infer<typeof telaVisualSchema>): boolean {
  if (tela.tipo !== "comparacao") return false;
  if (isTelaDistratores(tela)) return false;
  const id = tela.id.toLowerCase();
  const secao = (tela.secao ?? "").toLowerCase();
  const titulo = tela.titulo.toLowerCase();
  return (
    id === "contraste" ||
    secao === "contraste" ||
    titulo.includes("contraste") ||
    titulo.includes("crença") ||
    titulo.includes("crenca")
  );
}

/**
 * Gate contraste pedagógico: coluna esquerda = crença FALSA; direita = lei.
 * Reprova fato verdadeiro na coluna ✗ (ex.: "PRF patrulha rodovia" | "PRF — §2º").
 */
export function linhaContrasteAfirmaMesmoOrgao(
  esquerda: string,
  direita: string,
): boolean {
  const e = normalizarTextoContraste(esquerda);
  if (/\bnao\b/.test(e) || /\bnunca\b/.test(e)) return false;

  const orgE = extrairOrgaosContraste(esquerda);
  const orgD = extrairOrgaosContraste(direita);
  if (orgE.length === 0 || orgD.length === 0) return false;

  // Mesmo órgão nos dois lados sem negação = esquerda afirma o que a direita confirma
  return orgE.some((o) => orgD.includes(o));
}

/** Gate: contraste só com crenças falsas; títulos sem jargão de fabricação. */
export function validarContrastePedagogico(
  telas: z.infer<typeof telaVisualSchema>[],
  ctx: z.RefinementCtx,
) {
  for (let i = 0; i < telas.length; i++) {
    const tela = telas[i]!;

    if (/\bstem\b/i.test(tela.titulo)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Tela "${tela.id}": título não pode usar jargão "stem" — use "enunciado"`,
        path: ["telas", i, "titulo"],
      });
    }

    if (!isTelaContraste(tela) || tela.tipo !== "comparacao") continue;

    for (let j = 0; j < tela.conteudo.linhas.length; j++) {
      const [esquerda, direita] = tela.conteudo.linhas[j]!;
      if (linhaContrasteAfirmaMesmoOrgao(esquerda, direita)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Tela "${tela.id}" linha ${j + 1}: coluna esquerda afirma fato verdadeiro sobre o mesmo órgão da direita ("${esquerda}" | "${direita}"). Contraste exige crença FALSA × lei — tire verdades da coluna ✗.`,
          path: ["telas", i, "conteudo", "linhas", j],
        });
      }
    }
  }
}

/** Gate item 6 — limites por componente. */
export function validarLimitesComponente(
  telas: z.infer<typeof telaVisualSchema>[],
  ctx: z.RefinementCtx,
) {
  for (let i = 0; i < telas.length; i++) {
    const tela = telas[i];
    const c = tela.conteudo as Record<string, unknown>;

    switch (tela.tipo) {
      case "fluxograma": {
        const nos = c.nos as { id: string; tipo: string; label?: string }[];
        const arestas = (c.arestas as { de: string; para: string }[]) ?? [];
        const isMetodo = tela.secao === "metodo";

        if (isMetodo) {
          if (nos.length > MAX_NOS_FLUXO_METODO) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Tela "${tela.id}" (MÉTODO): fluxograma excede ${MAX_NOS_FLUXO_METODO} nós (${nos.length}) — use só o caminho do caso`,
              path: ["telas", i, "conteudo", "nos"],
            });
          }
          const resultados = nos.filter((n) => n.tipo === "resultado").length;
          if (resultados > MAX_RESULTADOS_FLUXO_METODO) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Tela "${tela.id}" (MÉTODO): fluxograma tem ${resultados} resultados — máximo ${MAX_RESULTADOS_FLUXO_METODO} (caminho do gabarito)`,
              path: ["telas", i, "conteudo", "nos"],
            });
          }
          if (
            nos.length > 0 &&
            !isFluxogramaLinear({ nos, arestas } as ConteudoFluxograma)
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Tela "${tela.id}" (MÉTODO): fluxograma deve ser cadeia linear (sem ramos)`,
              path: ["telas", i, "conteudo", "arestas"],
            });
          }
          for (const no of nos) {
            if (no.label && /\bart\.?\s*\d/i.test(no.label)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Tela "${tela.id}" (MÉTODO): nó "${no.id}" cita artigo no label — mover para mapa/lei`,
                path: ["telas", i, "conteudo", "nos"],
              });
            }
          }
        } else if (nos.length > MAX_NOS_FLUXO) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Tela "${tela.id}": fluxograma excede ${MAX_NOS_FLUXO} nós (${nos.length})`,
            path: ["telas", i, "conteudo", "nos"],
          });
        }

        const perguntas = nos.filter((n) => n.tipo === "pergunta").length;
        if (perguntas > MAX_PERGUNTAS_FLUXO) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Tela "${tela.id}": fluxograma excede ${MAX_PERGUNTAS_FLUXO} nós de ramificação`,
            path: ["telas", i, "conteudo", "nos"],
          });
        }
        break;
      }
      case "comparacao": {
        const linhas = c.linhas as unknown[];
        if (linhas.length > MAX_LINHAS_COMPARACAO) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Tela "${tela.id}": comparação excede ${MAX_LINHAS_COMPARACAO} linhas`,
            path: ["telas", i, "conteudo", "linhas"],
          });
        }
        break;
      }
      case "tabela_gradacao": {
        const linhas = c.linhas as unknown[];
        if (linhas.length > MAX_FAIXAS_GRADACAO) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Tela "${tela.id}": tabela excede ${MAX_FAIXAS_GRADACAO} faixas`,
            path: ["telas", i, "conteudo", "linhas"],
          });
        }
        break;
      }
      case "linha_tempo": {
        const eventos = c.eventos as unknown[];
        if (eventos.length > MAX_EVENTOS_LINHA_TEMPO) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Tela "${tela.id}": linha do tempo excede ${MAX_EVENTOS_LINHA_TEMPO} marcos`,
            path: ["telas", i, "conteudo", "eventos"],
          });
        }
        break;
      }
      case "matriz_assertivas": {
        const itens = c.itens as unknown[];
        if (itens.length > MAX_ASSERTIVAS) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Tela "${tela.id}": matriz excede ${MAX_ASSERTIVAS} assertivas`,
            path: ["telas", i, "conteudo", "itens"],
          });
        }
        break;
      }
      case "diagrama_competencia": {
        const nos = c.nos as unknown[];
        if (nos.length > MAX_NOS_COMPETENCIA) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Tela "${tela.id}": diagrama excede ${MAX_NOS_COMPETENCIA} nós`,
            path: ["telas", i, "conteudo", "nos"],
          });
        }
        break;
      }
      case "trecho_legal": {
        const texto = c.texto as string;
        const grifos = (c.trechos_grifados as unknown[] | undefined) ?? [];
        if (contarPalavras(texto) > MAX_PALAVRAS_TRECHO_LEGAL) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Tela "${tela.id}": trecho legal excede ${MAX_PALAVRAS_TRECHO_LEGAL} palavras`,
            path: ["telas", i, "conteudo", "texto"],
          });
        }
        if (grifos.length > MAX_GRIFOS_TRECHO_LEGAL) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Tela "${tela.id}": trecho legal excede ${MAX_GRIFOS_TRECHO_LEGAL} grifos`,
            path: ["telas", i, "conteudo", "trechos_grifados"],
          });
        }
        break;
      }
    }
  }
}

function tokensMacete(texto: string): Set<string> {
  return new Set(
    texto
      .toLowerCase()
      .split(/[^a-z0-9áàâãéêíóôõúç-]+/i)
      .filter((t) => t.length >= 4),
  );
}

function macetesCompativeis(a: string, b: string): boolean {
  const ta = tokensMacete(a);
  const tb = tokensMacete(b);
  for (const t of ta) {
    if (tb.has(t)) return true;
  }
  return false;
}

function coletarMensagensCoerenciaV1V2(
  v1: z.infer<typeof estudoReversoVisualSchema>,
  v2: z.infer<typeof estudoReversoVisualCompletoSchema>,
): string[] {
  const mensagens: string[] = [];

  if (v1.fundamento_slug !== v2.fundamento_slug) {
    mensagens.push(
      `fundamento_slug diverge entre v1 ("${v1.fundamento_slug}") e v2 ("${v2.fundamento_slug}")`,
    );
  }

  if (v1.arquetipo !== v2.arquetipo) {
    mensagens.push(
      `arquetipo diverge entre v1 ("${v1.arquetipo}") e v2 ("${v2.arquetipo}")`,
    );
  }

  if (!macetesCompativeis(v1.macete_visual, v2.macete_visual)) {
    mensagens.push("macete_visual v1 e v2 sem tokens em comum — revisar coerência");
  }

  return mensagens;
}

/** Gate item 8 — coerência entre v1 e v2 da mesma questão. */
export function validarCoerenciaV1V2(
  v1: z.infer<typeof estudoReversoVisualSchema>,
  v2: z.infer<typeof estudoReversoVisualCompletoSchema>,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
) {
  for (const mensagem of coletarMensagensCoerenciaV1V2(v1, v2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: mensagem,
      path: [...pathPrefix, "estudo_reverso_visual_completo"],
    });
  }
}

export function listarErrosCoerenciaV1V2(
  v1: z.infer<typeof estudoReversoVisualSchema>,
  v2: z.infer<typeof estudoReversoVisualCompletoSchema>,
): string[] {
  return coletarMensagensCoerenciaV1V2(v1, v2);
}

function isTelaCondicionalPreArquetipo(tela: z.infer<typeof telaVisualSchema>): boolean {
  const id = tela.id.toLowerCase();
  const titulo = tela.titulo.toLowerCase();
  return (
    id === "glossario" ||
    titulo.includes("glossário") ||
    titulo.includes("pré-treino") ||
    tela.tipo === "linha_tempo"
  );
}

/** Núcleo v3 — ordem pedagógica obrigatória na aula completa. */
export function validarNucleoV2(
  telas: z.infer<typeof telaVisualSchema>[],
  ctx: z.RefinementCtx,
) {
  if (telas.length < 7) return;

  if (telas[0].tipo !== "texto_destaque") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Núcleo v2: primeira tela deve ser texto_destaque (contexto)",
      path: ["telas", 0],
    });
  }

  const lastIdx = telas.length - 1;
  if (telas[lastIdx].tipo !== "texto_destaque") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Núcleo v2: última tela deve ser texto_destaque (macete)",
      path: ["telas", lastIdx],
    });
  }

  const idxLei = telas.findLastIndex(
    (t, i) => t.tipo === "trecho_legal" && i < lastIdx,
  );
  if (idxLei === -1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Núcleo v2: deve haver trecho_legal antes do macete",
      path: ["telas"],
    });
    return;
  }

  const idxDistrat = telas.findIndex(isTelaDistratores);
  if (idxDistrat === -1) return;

  if (idxDistrat >= idxLei) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Núcleo v2: tela de distratores deve vir antes de trecho_legal",
      path: ["telas", idxDistrat],
    });
  }

  if (idxDistrat > 0 && telas[idxDistrat - 1].tipo !== "comparacao") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Núcleo v2: tela antes de distratores deve ser comparacao (contraste)",
      path: ["telas", idxDistrat - 1],
    });
  }

  if (idxDistrat + 1 < idxLei) {
    const caso = telas[idxDistrat + 1];
    if (caso.tipo !== "comparacao" && caso.tipo !== "fluxograma") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Núcleo v2: tela após distratores deve ser comparacao ou fluxograma (caso)",
        path: ["telas", idxDistrat + 1],
      });
    }
  }

  let i = 1;
  while (i < idxDistrat && isTelaCondicionalPreArquetipo(telas[i])) {
    i++;
  }
  if (i < idxDistrat && telas[i].tipo === "texto_destaque") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Núcleo v2: arquétipo principal não pode ser texto_destaque",
      path: ["telas", i],
    });
  }
}

function isLegacyGrifosMode(): boolean {
  return process.env.GRIFO_LEGACY === "1";
}

function validarGrifosNasTelas(
  telas: z.infer<typeof telaVisualSchema>[],
  ctx: z.RefinementCtx,
) {
  const legacy = isLegacyGrifosMode();
  for (let i = 0; i < telas.length; i++) {
    const tela = telas[i]!;
    if (tela.tipo !== "trecho_legal") continue;
    const texto = tela.conteudo.texto;
    const grifos = (tela.conteudo.trechos_grifados ?? []) as GrifoInput[];
    for (const erro of validarGrifosTrechoLegal(texto, grifos, {
      legacyGrifos: legacy,
      telaId: tela.id,
    })) {
      const isMissingOnly =
        erro.codigo === "G3_missing" && legacy;
      if (isMissingOnly) continue;
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: erro.mensagem,
        path: ["telas", i, "conteudo", "trechos_grifados"],
      });
    }
  }
}

function validarContextoLeve(
  telas: z.infer<typeof telaVisualSchema>[],
  meta: MetaTransferenciaCampos | undefined,
  ctx: z.RefinementCtx,
) {
  const contextoIdx = telas.findIndex((t) => t.id === "contexto");
  if (contextoIdx < 0) return;
  const contexto = telas[contextoIdx]!;
  if (contexto.tipo !== "texto_destaque") return;

  const texto = contexto.conteudo.texto;
  const textoLower = texto.toLowerCase();

  for (const slug of MECANISMOS_DISTRATOR) {
    if (textoLower.includes(slug)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Tela "contexto": não deve citar slug de mecanismo "${slug}" (reservado à tela distratores)`,
        path: ["telas", contextoIdx, "conteudo", "texto"],
      });
    }
  }

  if (/\berra\s+por\b/i.test(texto)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Tela "contexto": análise por mecanismo ("erra por") pertence à tela distratores',
      path: ["telas", contextoIdx, "conteudo", "texto"],
    });
  }

  if (/\bart\.\s*\d/i.test(texto) || /§/.test(texto)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Tela "contexto": citação normativa (art./§) pertence a distratores ou trecho_legal',
      path: ["telas", contextoIdx, "conteudo", "texto"],
    });
  }

  const iscas = meta?.isca_por_alternativa;
  if (iscas) {
    for (const letra of ["A", "B", "D"] as const) {
      if (iscas[letra] && !new RegExp(`\\b${letra}\\b`).test(texto)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Tela "contexto": deve mencionar alternativa ${letra} (meta.isca_por_alternativa)`,
          path: ["telas", contextoIdx, "conteudo", "texto"],
        });
      }
    }
  }
}

function validarRegrasVisuais(
  telas: z.infer<typeof telaVisualSchema>[],
  maxPalavras: number,
  ctx: z.RefinementCtx,
  opts: { exigirDistratores: boolean; meta?: MetaTransferenciaCampos },
) {
  validarPalavrasPorTela(telas, maxPalavras, ctx);
  validarSemTextoConsecutivo(telas, ctx);
  validarLimitesComponente(telas, ctx);
  validarGrifosNasTelas(telas, ctx);
  if (opts.exigirDistratores) {
    validarTelaDistratores(telas, ctx);
    validarNucleoV2(telas, ctx);
    validarContextoLeve(telas, opts.meta, ctx);
    validarContrastePedagogico(telas, ctx);
  }
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
  linhas: z.array(z.tuple([z.string().min(1), z.string().min(1)])).min(1).max(MAX_LINHAS_COMPARACAO),
});

const conteudoMatrizAssertivasSchema = z.object({
  itens: z
    .array(
      z.object({
        id: z.string().min(1),
        texto: z.string().min(1),
        correto: z.boolean(),
        porque: z.string().min(1).optional(),
      }),
    )
    .min(1)
    .max(MAX_ASSERTIVAS),
  gabarito_resumo: z.string().min(1),
  intro: z.string().min(1).optional(),
});

const secaoSchema = z.enum(SECOES_VISUAIS).optional();

const telaCamposBase = {
  id: z.string().min(1),
  titulo: z.string().min(1),
  secao: secaoSchema,
};

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
    .min(1)
    .max(MAX_FAIXAS_GRADACAO),
});

const destaqueTextoSchema = z.object({
  inicio: z.number().int().min(0),
  fim: z.number().int().min(1),
  motivo: z.string().min(1),
  texto_grifado: z.string().min(1).optional(),
});

const conteudoTrechoLegalSchema = z.object({
  fonte: z.string().min(1),
  texto: z.string().min(1),
  trechos_grifados: z
    .array(destaqueTextoSchema)
    .max(MAX_GRIFOS_TRECHO_LEGAL)
    .optional(),
});

const metaAulaCompletaSchema = metaQuestaoSchema;

export { metaQuestaoSchema, type MetaTransferenciaCampos } from "@/lib/validations/transferencia-pedagogica";

const conteudoLinhaTempoSchema = z.object({
  eventos: z
    .array(
      z.object({
        ordem: z.number().int().min(1),
        rotulo: z.string().min(1),
        descricao: z.string().min(1),
      }),
    )
    .min(2)
    .max(MAX_EVENTOS_LINHA_TEMPO),
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
    .min(2)
    .max(MAX_NOS_COMPETENCIA),
  arestas: z.array(
    z.object({
      de: z.string().min(1),
      para: z.string().min(1),
      rotulo: z.string().optional(),
    }),
  ),
});

export const telaVisualSchema = z.discriminatedUnion("tipo", [
  z.object({
    ...telaCamposBase,
    tipo: z.literal("texto_destaque"),
    conteudo: conteudoTextoDestaqueSchema,
  }),
  z.object({
    ...telaCamposBase,
    tipo: z.literal("fluxograma"),
    conteudo: conteudoFluxogramaSchema,
  }),
  z.object({
    ...telaCamposBase,
    tipo: z.literal("comparacao"),
    conteudo: conteudoComparacaoSchema,
  }),
  z.object({
    ...telaCamposBase,
    tipo: z.literal("matriz_assertivas"),
    conteudo: conteudoMatrizAssertivasSchema,
  }),
  z.object({
    ...telaCamposBase,
    tipo: z.literal("tabela_gradacao"),
    conteudo: conteudoTabelaGradacaoSchema,
  }),
  z.object({
    ...telaCamposBase,
    tipo: z.literal("trecho_legal"),
    conteudo: conteudoTrechoLegalSchema,
  }),
  z.object({
    ...telaCamposBase,
    tipo: z.literal("linha_tempo"),
    conteudo: conteudoLinhaTempoSchema,
  }),
  z.object({
    ...telaCamposBase,
    tipo: z.literal("diagrama_competencia"),
    conteudo: conteudoDiagramaCompetenciaSchema,
  }),
]);

const estudoReversoVisualBaseSchema = z.object({
  arquetipo: z.enum(ARQUETIPOS_VISUAIS),
  arquetipo_secundario: z.enum(ARQUETIPOS_VISUAIS).optional(),
  fundamento_slug: z.string().min(1),
  macete_visual: z.string().min(1).max(MAX_MACETE_CHARS),
  telas: z.array(telaVisualSchema),
  links_fonte: linksFonteSchema,
  ref_visual_id: z.string().optional(),
});

/** Trilha expressa — 3 a 5 telas. */
export const estudoReversoVisualSchema = estudoReversoVisualBaseSchema
  .extend({
    versao: z.literal(1),
    duracao_estimada_seg: z.number().int().min(30).max(180),
    telas: z.array(telaVisualSchema).min(3).max(5),
  })
  .superRefine((data, ctx) => {
    validarRegrasVisuais(data.telas, MAX_PALAVRAS_TELA, ctx, {
      exigirDistratores: false,
    });
  });

/** Aula completa (Modelo B) — 7 a 11 telas, foco iniciante/dúvida. */
export const estudoReversoVisualCompletoSchema = estudoReversoVisualBaseSchema
  .extend({
    versao: z.literal(2),
    publico_alvo: z.enum(["iniciante", "todos"]).optional(),
    duracao_estimada_seg: z.number().int().min(120).max(600),
    telas: z.array(telaVisualSchema).min(7).max(11),
    meta: metaAulaCompletaSchema,
  })
  .superRefine((data, ctx) => {
    validarRegrasVisuais(data.telas, MAX_PALAVRAS_TELA_COMPLETO, ctx, {
      exigirDistratores: true,
      meta: data.meta,
    });
  });

export const estudoReversoVisualAnySchema = z.union([
  estudoReversoVisualSchema,
  estudoReversoVisualCompletoSchema,
]);

export type EstudoReversoVisualInput = z.infer<typeof estudoReversoVisualSchema>;
export type EstudoReversoVisualCompletoInput = z.infer<
  typeof estudoReversoVisualCompletoSchema
>;

function passo2TemCompetenciaSnt(passo_a_passo?: string[]): boolean {
  const passo2 = passo_a_passo?.find((p) => /^2\./.test(p.trim())) ?? passo_a_passo?.[1] ?? "";
  return passo2.includes("competencia_snt");
}

function gabaritoCruzaDoisDispositivos(input: {
  estudo_reverso_visual_completo?: {
    telas?: Array<{ id: string; tipo?: string }>;
    meta?: { eixos_legais?: string[] };
  } | null;
}): boolean {
  const v2 = input.estudo_reverso_visual_completo;
  if (!v2?.telas) return false;
  const telasLei = v2.telas.filter(
    (t) => t.id.startsWith("lei") || t.tipo === "trecho_legal",
  );
  if (telasLei.length >= 2) return true;
  return (v2.meta?.eixos_legais?.length ?? 0) >= 2;
}

/** Padrão ouro v2 — referência lote-007 (PADRAO-AULA-COMPLETA-v3 Família A). */
export function isNivelLote007Ouro(input: {
  tipo: string;
  dificuldade: number;
  comentario?: { passo_a_passo?: string[] };
  estudo_reverso_visual_completo?: {
    versao?: number;
    telas?: Array<{ id: string; tipo?: string }>;
    meta?: { eixos_legais?: string[] };
  } | null;
}): boolean {
  const v2 = input.estudo_reverso_visual_completo;
  if (!v2 || v2.versao !== 2) return false;
  if (input.tipo !== "caso_pratico" || input.dificuldade < 3) return false;

  const ids = new Set((v2.telas ?? []).map((t) => t.id));
  const base = ["glossario", "fluxo", "caso"] as const;
  if (!base.every((id) => ids.has(id))) return false;

  const doisDispositivos = gabaritoCruzaDoisDispositivos(input);
  if (doisDispositivos) {
    if (!ids.has("eixo2") && !ids.has("hierarquia")) return false;
  }

  if (passo2TemCompetenciaSnt(input.comentario?.passo_a_passo)) {
    if (!ids.has("hierarquia") && !ids.has("diagrama")) return false;
  }

  return true;
}
