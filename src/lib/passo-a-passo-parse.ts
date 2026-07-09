import type { ConteudoMatrizAssertivas } from "@/types/estudo-reverso-visual";

const RE_ALTERNATIVA = /^([A-E])\)\s*(.+)$/i;

/** Converte passo_a_passo do comentário em matriz de assertivas (CLT baixa). */
export function passoAPassoParaMatriz(
  passos: string[],
): ConteudoMatrizAssertivas | null {
  const intro = passos.find((p) => !RE_ALTERNATIVA.test(p.trim()))?.trim();
  const itens = passos
    .filter((p) => RE_ALTERNATIVA.test(p.trim()))
    .map((linha) => {
      const match = linha.trim().match(RE_ALTERNATIVA);
      if (!match) return null;
      const [, letra, resto] = match;
      const correto = /^correta\b/i.test(resto);
      const texto = resto.replace(/^(Correta|Erra):\s*/i, "").trim();
      return {
        id: letra.toUpperCase(),
        texto,
        correto,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (itens.length === 0) return null;

  const gabarito = itens.find((i) => i.correto);
  return {
    intro: intro || undefined,
    itens,
    gabarito_resumo: gabarito
      ? `Gabarito ${gabarito.id}: ${gabarito.texto}`
      : "Analise cada alternativa antes de avançar.",
  };
}

export function extrairRespostaRecall(refs: string[], macete: string): string {
  for (const ref of refs) {
    const art = ref.match(/art\.?\s*(\d+-?[A-Za-z]?)/i);
    if (art) return art[1];
    const res = ref.match(/Res\.?\s*CONTRAN\s*(\d+)/i);
    if (res) return res[1];
    const lei = ref.match(/Lei\s+([\d.]+)/i);
    if (lei) return lei[1];
  }
  const palavras = macete.trim().split(/\s+/);
  return palavras.length <= 6 ? macete.trim() : `${palavras.slice(0, 6).join(" ")}…`;
}

/** Monta pergunta de micro-recall específica a partir das refs legais. */
export function montarPerguntaRecall(
  refs: string[],
  oQueTesta: string,
): string {
  const refPrincipal = refs[0];
  if (refPrincipal) {
    const art = refPrincipal.match(/art\.?\s*(\d+-?[A-Za-z]?)/i);
    if (art) {
      return `Sem olhar: qual artigo do CTB fundamenta esta questão? (art. ${art[1]})`;
    }
    const res = refPrincipal.match(/Res\.?\s*CONTRAN\s*(\d+)/i);
    if (res) {
      return `Sem olhar: qual Resolução CONTRAN fundamenta esta questão? (Res. ${res[1]})`;
    }
    return `Sem olhar: qual dispositivo legal fundamenta esta questão? (${refPrincipal})`;
  }
  const resumo = oQueTesta.trim().split(/[.!?]/)[0]?.trim();
  if (resumo && resumo.length > 10) {
    return `Sem olhar: qual é o ponto central testado? (${resumo.slice(0, 60)}${resumo.length > 60 ? "…" : ""})`;
  }
  return "Sem olhar: qual é o macete desta questão?";
}

/** Variações aceitas para validação do micro-recall no fallback. */
export function montarVariacoesRecall(refs: string[], macete: string): string[] {
  const variacoes = new Set<string>();
  for (const ref of refs) {
    variacoes.add(ref);
    variacoes.add(ref.replace(/CTB\s*art\.?\s*/i, ""));
    variacoes.add(ref.replace(/CTB\s*/i, ""));
    const art = ref.match(/art\.?\s*(\d+-?[A-Za-z]?)/i);
    if (art) {
      variacoes.add(art[1]);
      variacoes.add(`art. ${art[1]}`);
      variacoes.add(`artigo ${art[1]}`);
    }
    const res = ref.match(/Res\.?\s*CONTRAN\s*(\d+)/i);
    if (res) {
      variacoes.add(res[1]);
      variacoes.add(`Res. ${res[1]}`);
      variacoes.add(`Resolução ${res[1]}`);
    }
  }
  const resposta = extrairRespostaRecall(refs, macete);
  if (resposta) variacoes.add(resposta);
  const maceteCurto = macete.trim();
  if (maceteCurto.length <= 40) variacoes.add(maceteCurto);
  return [...variacoes].filter(Boolean);
}
