import { EDITAL_TOPICS } from "../../../scripts/edital-topics";
import { enriquecerTopico } from "../../../scripts/edital-topics-prioridades";
import { DISCIPLINAS_CRITICAS_INICIO } from "@/lib/edital-topicos";
import {
  DISCIPLINAS,
  SIMULADO_ESPELHO_DISTRIBUICAO,
  type Disciplina,
} from "@/types";

/** Prioridade da banca IDECAN para ROI (1 = baixa, 5 = máxima). */
export type PrioridadeBanca = 1 | 2 | 3 | 4 | 5;

export interface MapaTopicoBanca {
  slug: string;
  disciplina: Disciplina;
  editalRef: string;
  pesoProva: number;
  prioridadeBanca: PrioridadeBanca;
  roiBase: number;
}

export interface MapaDisciplinaBanca {
  disciplina: Disciplina;
  pesoProva: number;
  prioridadeBanca: PrioridadeBanca;
  roiBase: number;
  topicos: MapaTopicoBanca[];
}

/** Base por disciplina — CTB e gerais de risco de zerar no topo. */
const PRIORIDADE_DISCIPLINA_BASE: Record<Disciplina, PrioridadeBanca> = {
  legislacao_transito: 5,
  informatica: 5,
  historia_cg_pb: 5,
  legislacao_etica_sp: 4,
  portugues: 3,
  direito_administrativo: 3,
  direito_constitucional: 3,
};

const SLUGS_PRIORIDADE_ALTA = new Set([
  "CTB_engenharia_fiscalizacao",
  "CTB_infracoes",
  "CTB_processo_administrativo",
  "CONTRAN_985_mbft",
  "CONTRAN_432_alcoolemia",
  "SENATRAN_966_curso_agente",
  "informatica_8_1",
  "historia_cg_pb_formacao",
  "dir_const_7_3",
]);

function clampPrioridade(n: number): PrioridadeBanca {
  return Math.min(5, Math.max(1, Math.round(n))) as PrioridadeBanca;
}

/** Deriva prioridade 1–5 do peso editorial (1–3) e sinais de banca. */
export function prioridadeBancaTopico(
  disciplina: Disciplina,
  pesoEditorial: 1 | 2 | 3,
  slug: string,
  recente: boolean,
): PrioridadeBanca {
  const base = PRIORIDADE_DISCIPLINA_BASE[disciplina];
  const ajustePeso = pesoEditorial - 2;
  let score = base + ajustePeso;
  if (recente) score += 1;
  if (SLUGS_PRIORIDADE_ALTA.has(slug)) score += 1;
  if (DISCIPLINAS_CRITICAS_INICIO.includes(disciplina) && pesoEditorial >= 2) {
    score += 1;
  }
  return clampPrioridade(score);
}

export function prioridadeBancaDisciplina(
  disciplina: Disciplina,
): PrioridadeBanca {
  return PRIORIDADE_DISCIPLINA_BASE[disciplina];
}

export function calcularRoiBase(
  pesoProva: number,
  prioridadeBanca: PrioridadeBanca,
): number {
  return pesoProva * prioridadeBanca;
}

function montarTopicoMapa(
  slug: string,
  disciplina: Disciplina,
  editalRef: string,
  pesoEditorial: 1 | 2 | 3,
  recente: boolean,
): MapaTopicoBanca {
  const pesoProva = SIMULADO_ESPELHO_DISTRIBUICAO[disciplina];
  const prioridadeBanca = prioridadeBancaTopico(
    disciplina,
    pesoEditorial,
    slug,
    recente,
  );
  return {
    slug,
    disciplina,
    editalRef,
    pesoProva,
    prioridadeBanca,
    roiBase: calcularRoiBase(pesoProva, prioridadeBanca),
  };
}

/** Mapa compilado edital × banca — lido em runtime pelo tutor (Camada 0). */
export const MAPA_EDITAL_BANCA: MapaTopicoBanca[] = EDITAL_TOPICS.map((raw) => {
  const t = enriquecerTopico(raw);
  return montarTopicoMapa(
    t.slug,
    t.disciplina,
    t.editalRef,
    t.peso,
    t.recente,
  );
});

export const MAPA_EDITAL_BANCA_POR_SLUG = new Map(
  MAPA_EDITAL_BANCA.map((entry) => [entry.slug, entry]),
);

export function getMapaTopicoBanca(slug: string): MapaTopicoBanca | undefined {
  return MAPA_EDITAL_BANCA_POR_SLUG.get(slug);
}

/** Agregação por disciplina (peso da prova + ROI médio dos microtópicos). */
export function getMapaPorDisciplina(): MapaDisciplinaBanca[] {
  return DISCIPLINAS.map((disciplina) => {
    const topicos = MAPA_EDITAL_BANCA.filter((t) => t.disciplina === disciplina);
    const pesoProva = SIMULADO_ESPELHO_DISTRIBUICAO[disciplina];
    const prioridadeBanca = prioridadeBancaDisciplina(disciplina);
    const roiMedio =
      topicos.length > 0
        ? Math.round(
            topicos.reduce((s, t) => s + t.roiBase, 0) / topicos.length,
          )
        : calcularRoiBase(pesoProva, prioridadeBanca);
    return {
      disciplina,
      pesoProva,
      prioridadeBanca,
      roiBase: roiMedio,
      topicos,
    };
  });
}

/** Disciplinas ordenadas por ROI base (peso × prioridade banca). */
export function disciplinasPorRoi(): MapaDisciplinaBanca[] {
  return [...getMapaPorDisciplina()].sort((a, b) => b.roiBase - a.roiBase);
}
