import { getEditalTopic } from "../../scripts/edital-topics";
import type { Disciplina } from "@/types";

export interface TopicoCatalogo {
  id: string;
  slug: string;
  label: string;
  editalRef: string | null;
  grupo: string;
  questoesCount: number;
  questoesReaisCount: number;
  tentativas: number;
  acertos: number;
  taxaAcerto: number;
  estudavel: boolean;
}

export interface TopicosDisciplinaResumo {
  disciplina: Disciplina;
  topicos: TopicoCatalogo[];
  totalMapeados: number;
  totalEstudaveis: number;
  totalReais: number;
  totalVistos: number;
  coberturaPct: number;
}

const ORDEM_GRUPOS_TRANSITO = ["CTB", "CONTRAN", "SENATRAN", "Outros"];

export function grupoTopico(slug: string, disciplina: Disciplina): string {
  if (disciplina === "legislacao_transito") {
    if (slug.startsWith("CTB_")) return "CTB";
    if (slug.startsWith("CONTRAN_")) return "CONTRAN";
    if (slug.startsWith("SENATRAN_")) return "SENATRAN";
    return "Outros";
  }

  const edital = getEditalTopic(slug);
  if (edital?.editalRef) {
    const ref = edital.editalRef.replace(/^Anexo I — /, "");
    const capMatch = ref.match(
      /(?:Português|Informática|Ética SP|Dir\. Administrativo|Dir\. Constitucional|História CG\/PB)\s+(\d+)\./,
    );
    if (capMatch) return `Bloco ${capMatch[1]}`;
  }

  const slugCap = slug.match(/_(\d+)_\d+$/);
  if (slugCap) return `Bloco ${slugCap[1]}`;

  return "Geral";
}

function ordenarGrupos(
  disciplina: Disciplina,
  grupos: Map<string, TopicoCatalogo[]>,
): Array<{ grupo: string; topicos: TopicoCatalogo[] }> {
  const entries = [...grupos.entries()];

  if (disciplina === "legislacao_transito") {
    entries.sort(
      (a, b) =>
        ORDEM_GRUPOS_TRANSITO.indexOf(a[0]) -
        ORDEM_GRUPOS_TRANSITO.indexOf(b[0]),
    );
  } else {
    entries.sort((a, b) => {
      const numA = parseInt(a[0].replace(/\D/g, ""), 10) || 999;
      const numB = parseInt(b[0].replace(/\D/g, ""), 10) || 999;
      if (numA !== numB) return numA - numB;
      return a[0].localeCompare(b[0], "pt-BR");
    });
  }

  return entries.map(([grupo, topicos]) => ({ grupo, topicos }));
}

export function agruparTopicos(
  topicos: TopicoCatalogo[],
  disciplina: Disciplina,
): Array<{ grupo: string; topicos: TopicoCatalogo[] }> {
  const map = new Map<string, TopicoCatalogo[]>();

  for (const topico of topicos) {
    const lista = map.get(topico.grupo) ?? [];
    lista.push(topico);
    map.set(topico.grupo, lista);
  }

  return ordenarGrupos(disciplina, map);
}

const LIMITE_SUGERIDOS_PAINEL = 6;

/** Ordena microtópicos estudáveis para o painel: não vistos → pior acerto → nome. */
export function priorizarTopicosEstudo(
  topicos: TopicoCatalogo[],
  limit = LIMITE_SUGERIDOS_PAINEL,
): TopicoCatalogo[] {
  const estudaveis = topicos.filter((t) => t.estudavel);
  const ordenados = [...estudaveis].sort((a, b) => {
    if (a.tentativas === 0 && b.tentativas > 0) return -1;
    if (b.tentativas === 0 && a.tentativas > 0) return 1;
    if (a.tentativas > 0 && b.tentativas > 0) {
      if (a.taxaAcerto !== b.taxaAcerto) return a.taxaAcerto - b.taxaAcerto;
      return b.tentativas - a.tentativas;
    }
    return a.label.localeCompare(b.label, "pt-BR");
  });
  return ordenados.slice(0, limit);
}

export { LIMITE_SUGERIDOS_PAINEL };
