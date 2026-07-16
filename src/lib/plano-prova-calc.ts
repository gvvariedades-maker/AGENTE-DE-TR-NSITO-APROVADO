import { hrefEstudoRevisoes } from "@/lib/estudo-links";
import { MIN_PONTOS_TOTAL } from "@/lib/edital-constants";
import type { ContagemDominio } from "@/lib/dominio-topico";
import {
  montarIndiceChegada,
  montarProjecaoNota,
  type IndiceChegada,
  type ProjecaoNota,
} from "@/lib/projecao-nota";
import { DISCIPLINA_LABELS, type Disciplina } from "@/types";
import type { ZonaSemaforo } from "@/lib/edital-constants";

export type FaseProva =
  | "exploracao"
  | "consolidacao"
  | "aperto"
  | "semana_final";

export type ZonaChegada = ZonaSemaforo;

export interface PacoteDia {
  revisoes: number;
  novas: number;
  erros: number;
  href: string;
  label: string;
  motivo: string;
}

export interface PlanoProvaResumo {
  diasParaProva: number;
  fase: FaseProva;
  faseLabel: string;
  topicosTotal: number;
  topicosVistos: number;
  topicosRestantes: number;
  /** Microtópicos vistos mas ainda sem domínio consolidado. */
  topicosBacklogDominio: number;
  /** max(não vistos, backlog domínio) — base do débito diário. */
  gapEdital: number;
  coberturaEditalPct: number;
  debitoDiario: number;
  diasAtraso: number;
  chegada: ZonaChegada;
  chegadaLabel: string;
  mensagem: string;
  pacote: PacoteDia;
  revisoesHoje: number;
  espelhoMedia: number | null;
  espelhoQuantidade: number;
  memoriaAindaFrescas: number;
  hasData: boolean;
  projecao: ProjecaoNota;
  indiceChegada: IndiceChegada;
}

const DEBITO_MIN = 3;
const DEBITO_MAX = 15;

const FASE_LABEL: Record<FaseProva, string> = {
  exploracao: "Abrir o edital",
  consolidacao: "Consolidar o que já viu",
  aperto: "Não esquecer o essencial",
  semana_final: "Semana da prova",
};

export function calcularFase(dias: number): FaseProva {
  if (dias <= 7) return "semana_final";
  if (dias <= 30) return "aperto";
  if (dias <= 45) return "consolidacao";
  return "exploracao";
}

export function labelFase(fase: FaseProva): string {
  return FASE_LABEL[fase];
}

const ORIENTACAO_FASE: Record<FaseProva, string> = {
  exploracao:
    "Prioridade: abrir assuntos novos do edital — comece pelo CTB (metade da prova).",
  consolidacao:
    "Equilibre assuntos novos e revisões para não perder o que já estudou.",
  aperto:
    "Foque em revisar e corrigir erros — novos só onde ainda falta cobrir.",
  semana_final:
    "Semana da prova: revisões em dia e simulado antes do dia D.",
};

export function orientacaoFase(fase: FaseProva): string {
  return ORIENTACAO_FASE[fase];
}

export function calcularDebitoDiario(
  topicosRestantes: number,
  dias: number,
): number {
  if (topicosRestantes <= 0 || dias <= 0) return 0;
  const raw = Math.ceil(topicosRestantes / Math.max(1, dias));
  return Math.min(DEBITO_MAX, Math.max(DEBITO_MIN, raw));
}

/**
 * Lacuna efetiva do edital: cobertura (não vistos) e domínio (não consolidados).
 * O débito usa o maior dos dois para não zerar meta com tópicos ainda não abertos.
 */
export function calcularGapEdital(
  topicosNaoVistos: number,
  backlogDominio?: number,
): number {
  const dom =
    backlogDominio !== undefined ? backlogDominio : topicosNaoVistos;
  return Math.max(topicosNaoVistos, dom);
}

/** Dias de atraso vs ritmo necessário para fechar o edital no prazo. */
export function calcularDiasAtraso(
  topicosRestantes: number,
  dias: number,
  debitoDiario: number,
): number {
  if (topicosRestantes <= 0 || dias <= 0) return 0;
  const diasNecessarios = Math.ceil(topicosRestantes / Math.max(1, debitoDiario));
  return Math.max(0, diasNecessarios - dias);
}

export interface SemaforoChegadaInput {
  topicosRestantes: number;
  dias: number;
  debitoDiario: number;
  espelhoMedia: number | null;
  revisoesHoje: number;
}

export function calcularSemaforoChegada(
  input: SemaforoChegadaInput,
): { zona: ZonaChegada; label: string } {
  const atraso = calcularDiasAtraso(
    input.topicosRestantes,
    input.dias,
    input.debitoDiario,
  );

  const espelhoCritico =
    input.espelhoMedia !== null &&
    input.espelhoMedia < MIN_PONTOS_TOTAL &&
    input.dias <= 30;

  if (atraso > 3 || espelhoCritico) {
    return { zona: "vermelho", label: "Atrasado" };
  }
  if (atraso > 0 || input.revisoesHoje > 5) {
    return { zona: "amarelo", label: "Atenção" };
  }
  if (input.topicosRestantes === 0) {
    return { zona: "verde", label: "Edital coberto" };
  }
  return { zona: "verde", label: "No ritmo" };
}

export interface MontarPacoteInput {
  fase: FaseProva;
  revisoesHoje: number;
  debito: number;
  disciplinaPrioritaria?: Disciplina;
  diasAtraso: number;
}

function mixRevisoesNovas(
  fase: FaseProva,
  revisoesHoje: number,
  debito: number,
): { revisoes: number; novas: number } {
  const totalSlots = Math.max(debito + revisoesHoje, revisoesHoje, 10);
  let pctRevisoes: number;
  switch (fase) {
    case "exploracao":
      pctRevisoes = 0.3;
      break;
    case "consolidacao":
      pctRevisoes = 0.5;
      break;
    case "aperto":
      pctRevisoes = 0.7;
      break;
    case "semana_final":
      pctRevisoes = 0.85;
      break;
  }
  const revisoes = Math.min(
    revisoesHoje,
    Math.max(1, Math.round(totalSlots * pctRevisoes)),
  );
  const novas =
    fase === "semana_final"
      ? Math.min(debito, Math.max(0, Math.round(totalSlots * 0.15)))
      : Math.max(debito, Math.round(totalSlots * (1 - pctRevisoes)));
  return { revisoes, novas };
}

export function montarPacoteDia(input: MontarPacoteInput): PacoteDia {
  const { fase, revisoesHoje, debito, disciplinaPrioritaria, diasAtraso } =
    input;
  const disciplina = disciplinaPrioritaria ?? "legislacao_transito";
  const { revisoes, novas } = mixRevisoesNovas(fase, revisoesHoje, debito);

  if (fase === "semana_final" && revisoesHoje > 0) {
    return {
      revisoes,
      novas,
      erros: 2,
      href: hrefEstudoRevisoes(),
      label: `Revisar · ${revisoesHoje}`,
      motivo: "Semana da prova — priorize o que já estudou",
    };
  }

  if (revisoesHoje > 0 && revisoes >= novas) {
    return {
      revisoes,
      novas,
      erros: 0,
      href: hrefEstudoRevisoes(),
      label: `Revisar · ${revisoesHoje}`,
      motivo: "Questões agendadas para hoje — não deixe acumular",
    };
  }

  if (diasAtraso > 0) {
    return {
      revisoes,
      novas,
      erros: 0,
      href: `/estudo?disciplina=${disciplina}&modo=auto`,
      label: `Cobrir edital · ${DISCIPLINA_LABELS[disciplina]}`,
      motivo: `Ritmo atrasado ${diasAtraso} dia(s) — foco em novos assuntos`,
    };
  }

  return {
    revisoes,
    novas,
    erros: 0,
    href: `/estudo?disciplina=${disciplina}&modo=auto`,
    label: `Estudar · ${novas} assuntos hoje`,
    motivo: `Meta do dia: ${debito} assunto(s) para chegar na prova`,
  };
}

function montarMensagem(
  dias: number,
  topicosNaoVistos: number,
  backlogDominio: number,
  gapEdital: number,
  debito: number,
  atraso: number,
  fase: FaseProva,
): string {
  if (gapEdital === 0) {
    return "Edital estudável coberto — mantenha revisões e simulados até a prova.";
  }
  if (atraso > 0) {
    return `Com o ritmo atual, o edital atrasa cerca de ${atraso} dia(s). Hoje: ${debito} assunto(s).`;
  }
  if (fase === "semana_final") {
    return `Faltam ${dias} dias — priorize revisões e simulado.`;
  }
  if (backlogDominio > topicosNaoVistos) {
    return `${topicosNaoVistos} não vistos · ${backlogDominio} sem domínio — meta ${debito}/dia em ${dias} dias.`;
  }
  return `Faltam ${topicosNaoVistos} assuntos e ${dias} dias — meta ${debito}/dia.`;
}

export function montarPlanoProvaResumo(input: {
  dias: number;
  topicosTotal: number;
  topicosVistos: number;
  coberturaEditalPct: number;
  revisoesHoje: number;
  memoriaAindaFrescas: number;
  espelhoMedia: number | null;
  espelhoQuantidade: number;
  disciplinaPrioritaria?: Disciplina;
  hasData: boolean;
  /** Backlog por domínio (não dominados). Se omitido, usa tópicos não vistos. */
  topicosBacklog?: number;
  disciplinas?: {
    disciplina: Disciplina;
    acertos: number;
    tentativas: number;
  }[];
  disciplinasEmRisco?: { disciplina: Disciplina }[];
  dominioGlobal?: ContagemDominio;
}): PlanoProvaResumo {
  const topicosRestantes = Math.max(0, input.topicosTotal - input.topicosVistos);
  const topicosBacklogDominio =
    input.topicosBacklog !== undefined ? input.topicosBacklog : topicosRestantes;
  const gapEdital = calcularGapEdital(
    topicosRestantes,
    topicosBacklogDominio,
  );
  const fase = calcularFase(input.dias);
  const debitoDiario = calcularDebitoDiario(gapEdital, input.dias);
  const diasAtraso = calcularDiasAtraso(
    gapEdital,
    input.dias,
    debitoDiario,
  );
  const { zona, label } = calcularSemaforoChegada({
    topicosRestantes: gapEdital,
    dias: input.dias,
    debitoDiario,
    espelhoMedia: input.espelhoMedia,
    revisoesHoje: input.revisoesHoje,
  });
  const pacote = montarPacoteDia({
    fase,
    revisoesHoje: input.revisoesHoje,
    debito: debitoDiario,
    disciplinaPrioritaria: input.disciplinaPrioritaria,
    diasAtraso,
  });

  const projecao = montarProjecaoNota({
    disciplinas: input.disciplinas ?? [],
    disciplinasEmRisco: input.disciplinasEmRisco ?? [],
    espelhoMedia: input.espelhoMedia,
    espelhoQuantidade: input.espelhoQuantidade,
  });

  const indiceChegada = montarIndiceChegada({
    plano: {
      diasParaProva: input.dias,
      fase,
      faseLabel: labelFase(fase),
      topicosTotal: input.topicosTotal,
      topicosVistos: input.topicosVistos,
      topicosRestantes,
      topicosBacklogDominio,
      gapEdital,
      coberturaEditalPct: input.coberturaEditalPct,
      debitoDiario,
      diasAtraso,
      chegada: zona,
      chegadaLabel: label,
      mensagem: "",
      pacote,
      revisoesHoje: input.revisoesHoje,
      espelhoMedia: input.espelhoMedia,
      espelhoQuantidade: input.espelhoQuantidade,
      memoriaAindaFrescas: input.memoriaAindaFrescas,
      hasData: input.hasData,
      projecao,
      indiceChegada: { sinais: [], resumo: "" },
    },
    projecao,
    dominioGlobal: input.dominioGlobal ?? {
      total: 0,
      nao_visto: 0,
      aprendendo: 0,
      formando: 0,
      dominado: 0,
    },
    disciplinasEmRisco: input.disciplinasEmRisco?.length ?? 0,
  });

  return {
    diasParaProva: input.dias,
    fase,
    faseLabel: labelFase(fase),
    topicosTotal: input.topicosTotal,
    topicosVistos: input.topicosVistos,
    topicosRestantes,
    topicosBacklogDominio,
    gapEdital,
    coberturaEditalPct: input.coberturaEditalPct,
    debitoDiario,
    diasAtraso,
    chegada: zona,
    chegadaLabel: label,
    mensagem: montarMensagem(
      input.dias,
      topicosRestantes,
      topicosBacklogDominio,
      gapEdital,
      debitoDiario,
      diasAtraso,
      fase,
    ),
    pacote,
    revisoesHoje: input.revisoesHoje,
    espelhoMedia: input.espelhoMedia,
    espelhoQuantidade: input.espelhoQuantidade,
    memoriaAindaFrescas: input.memoriaAindaFrescas,
    hasData: input.hasData,
    projecao,
    indiceChegada,
  };
}

/** Proporção de slots SRS na sessão auto (0–1). */
export function proporcaoRevisoesSessao(fase: FaseProva): number {
  switch (fase) {
    case "exploracao":
      return 0.3;
    case "consolidacao":
      return 0.5;
    case "aperto":
      return 0.7;
    case "semana_final":
      return 0.85;
  }
}

export interface SlotsSessaoAuto {
  revisoes: number;
  erros: number;
  pratica: number;
}

/** Aloca slots da sessão auto conforme a fase (revisões > erros > prática). */
export function alocarSlotsSessaoAuto(
  fase: FaseProva,
  limit: number,
): SlotsSessaoAuto {
  if (limit <= 0) return { revisoes: 0, erros: 0, pratica: 0 };
  const revisoes = Math.min(
    limit,
    Math.max(1, Math.round(limit * proporcaoRevisoesSessao(fase))),
  );
  const resto = limit - revisoes;
  const erros =
    fase === "semana_final"
      ? Math.min(2, resto)
      : fase === "aperto"
        ? Math.min(1, resto)
        : 0;
  return {
    revisoes,
    erros,
    pratica: Math.max(0, limit - revisoes - erros),
  };
}

/**
 * Semana final: novas aleatórias só com buraco crítico (disciplina em risco).
 * Demais fases: completa a fila com questões novas se necessário.
 */
export function permitirNovasAleatorias(
  fase: FaseProva,
  temBuracoCritico: boolean,
): boolean {
  if (fase === "semana_final") return temBuracoCritico;
  return true;
}
