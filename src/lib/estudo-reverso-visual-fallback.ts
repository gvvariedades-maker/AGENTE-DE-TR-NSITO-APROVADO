import type { ComentarioQuestao } from "@/types";
import type { EstudoReversoVisual, TelaVisual } from "@/types/estudo-reverso-visual";

const MAX_PALAVRAS_TELA = 120;
const MAX_MACETE_CHARS = 80;
const PATH_FONTE_CTB = "conteúdo/legislação federal/";

function contarPalavras(texto: string): number {
  return texto.trim().split(/\s+/).filter(Boolean).length;
}

function truncarPalavras(texto: string, max = MAX_PALAVRAS_TELA): string {
  const palavras = texto.trim().split(/\s+/).filter(Boolean);
  if (palavras.length <= max) return texto.trim();
  return `${palavras.slice(0, max).join(" ")}…`;
}

function refParaSlug(ref: string): string {
  return ref
    .replace(/,\s*/g, "_")
    .replace(/\s+/g, "_")
    .replace(/\./g, "")
    .replace(/_+/g, "_");
}

function extrairFonteLegal(fundamento: string): { fonte: string; texto: string } {
  const idx = fundamento.indexOf(":");
  if (idx === -1) {
    return { fonte: "Fundamento legal", texto: fundamento };
  }
  return {
    fonte: fundamento.slice(0, idx).replace(/,\s*/g, " ").trim(),
    texto: fundamento.slice(idx + 1).trim(),
  };
}

function maceteVisual(macete: string): string {
  const limpo = macete.trim();
  return limpo.length <= MAX_MACETE_CHARS
    ? limpo
    : `${limpo.slice(0, MAX_MACETE_CHARS - 1)}…`;
}

function isEstudoReversoVisual(value: unknown): value is EstudoReversoVisual {
  if (!value || typeof value !== "object") return false;
  const v = value as EstudoReversoVisual;
  return (
    v.versao === 1 &&
    Array.isArray(v.telas) &&
    v.telas.length >= 4 &&
    v.telas[v.telas.length - 1]?.tipo === "micro_recall"
  );
}

/** Monta visual mínimo a partir do comentário Professor Elite quando não há JSON dedicado. */
export function buildEstudoReversoVisualFromComentario(
  comentario: ComentarioQuestao,
): EstudoReversoVisual {
  const refs = comentario.estudo_reverso;
  const fundamentoSlug = refParaSlug(refs[0] ?? "fundamento");
  const { fonte, texto: textoLei } = extrairFonteLegal(comentario.fundamento_legal);
  const passos = comentario.passo_a_passo.join("\n");

  const telas: TelaVisual[] = [
    {
      id: "contexto",
      titulo: "O que a IDECAN testou",
      tipo: "texto_destaque",
      conteudo: {
        texto: truncarPalavras(comentario.o_que_testa),
        destaques: refs.slice(0, 2).map((r) => r.replace("CTB art. ", "art. ")),
      },
    },
    {
      id: "passos",
      titulo: "Raciocínio passo a passo",
      tipo: "texto_destaque",
      conteudo: {
        texto: truncarPalavras(passos),
      },
    },
    {
      id: "lei",
      titulo: "Lei seca",
      tipo: "trecho_legal",
      conteudo: {
        fonte,
        texto: truncarPalavras(textoLei),
      },
    },
    {
      id: "pegadinha",
      titulo: "Armadilha IDECAN",
      tipo: "texto_destaque",
      conteudo: {
        texto: truncarPalavras(comentario.pegadinha),
        destaques: ["IDECAN"],
      },
    },
    {
      id: "recall",
      titulo: "Micro-recall",
      tipo: "micro_recall",
      conteudo: {
        pergunta: "Sem olhar: qual é o macete desta questão?",
        resposta_esperada: maceteVisual(comentario.macete),
        dica: refs[0] ? `Pense em ${refs[0]}` : undefined,
        aceitar_variacoes: [
          ...refs,
          ...refs.map((r) => r.replace("CTB art. ", "")),
        ],
      },
    },
  ];

  return {
    versao: 1,
    arquetipo: "texto_destaque",
    arquetipo_secundario: "trecho_legal",
    duracao_estimada_seg: 75,
    fundamento_slug: fundamentoSlug,
    macete_visual: maceteVisual(comentario.macete),
    telas,
    links_fonte: refs.map((rotulo) => ({
      rotulo,
      path: PATH_FONTE_CTB,
    })),
    ref_visual_id: `fallback_${fundamentoSlug}`,
  };
}

/** Usa JSON persistido ou gera fallback a partir do comentário. */
export function resolveEstudoReversoVisual(
  json: unknown,
  comentario: ComentarioQuestao | null,
): EstudoReversoVisual | null {
  if (isEstudoReversoVisual(json)) {
    return json;
  }
  if (!comentario?.o_que_testa || !comentario.fundamento_legal) {
    return null;
  }
  const visual = buildEstudoReversoVisualFromComentario(comentario);
  // Garantia leve de densidade textual nas telas geradas
  for (const tela of visual.telas) {
    if (tela.tipo === "texto_destaque" && contarPalavras(tela.conteudo.texto) < 3) {
      return null;
    }
  }
  return visual;
}
