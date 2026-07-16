import { MIN_PONTOS_TOTAL } from "@/lib/edital-constants";
import { pesoAcerto } from "@/lib/edital-constants";
import {
  alocarSlotsSessaoAuto,
  proporcaoRevisoesSessao,
  type FaseProva,
  type SlotsSessaoAuto,
} from "@/lib/plano-prova-calc";
import type { EspelhoResumo } from "@/lib/semaforo";
import {
  disciplinasPorRoi,
  getMapaPorDisciplina,
  type MapaDisciplinaBanca,
} from "@/lib/tutor/mapa-edital-banca";
import type { TutorContexto } from "@/lib/tutor/contexto";
import type { TutorCalibracao } from "@/lib/tutor/calibracao";
import {
  SIMULADO_ESPELHO_DISTRIBUICAO,
  DISCIPLINA_LABELS,
  type Disciplina,
} from "@/types";
import type { MixDia, TipoMissao } from "@/lib/semana-chegada";

const META_PISO = 12;
const META_TETO = 30;
const QUESTOES_POR_TOPICO = 3;
const LIMIAR_REVISAO_DOMINANTE = 0.7;
const DIAS_ENTRE_ESPELHOS = 7;
const LIMIAR_REVISAO_ALTA = 8;

export interface DisciplinaPriorizada {
  disciplina: Disciplina;
  score: number;
  roiBase: number;
  lacuna: number;
  emRisco: boolean;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function capacidadeFaseCentro(fase: FaseProva): number {
  switch (fase) {
    case "exploracao":
      return 20;
    case "consolidacao":
      return 22;
    case "aperto":
      return 25;
    case "semana_final":
      return 18;
  }
}

/** Passo PRIORIZAR — ROI de ponto (peso × lacuna × retenção × risco). */
export function priorizarDisciplinas(
  ctx: TutorContexto,
  mapa: MapaDisciplinaBanca[] = getMapaPorDisciplina(),
): DisciplinaPriorizada[] {
  const emRisco = new Set(ctx.disciplinasEmRisco.map((r) => r.disciplina));
  const pior = ctx.pioresTopicos[0]?.disciplina;

  return mapa
    .map((entry) => {
      const cobertura =
        ctx.disciplinas.find((d) => d.disciplina === entry.disciplina)
          ?.coberturaPct ?? 0;
      const lacuna = Math.max(0, 100 - cobertura) / 100;
      const boostCalib = ctx.calibracao.boostDisciplinas[entry.disciplina] ?? 1;
      const fatorRisco = emRisco.has(entry.disciplina) ? 3 : 1;
      const fatorPior = pior === entry.disciplina ? 1.25 : 1;
      const fatorCtb =
        entry.disciplina === "legislacao_transito" &&
        ctx.plano.coberturaEditalPct < 50
          ? 2
          : 1;
      const score =
        entry.roiBase * lacuna * fatorRisco * fatorPior * fatorCtb * boostCalib;
      return {
        disciplina: entry.disciplina,
        score,
        roiBase: entry.roiBase,
        lacuna,
        emRisco: emRisco.has(entry.disciplina),
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function escolherDisciplinaFoco(ctx: TutorContexto): Disciplina {
  // Risco de mínimo (não zerar disciplina) vence cobertura CTB.
  if (ctx.disciplinasEmRisco.length > 0) {
    const emRisco = new Set(
      ctx.disciplinasEmRisco.map((r) => r.disciplina),
    );
    const priorizadas = priorizarDisciplinas(ctx);
    const melhorRisco = priorizadas.find((p) => emRisco.has(p.disciplina));
    return (
      melhorRisco?.disciplina ?? ctx.disciplinasEmRisco[0].disciplina
    );
  }

  // Sem risco de mínimo: edital ainda aberto → peso CTB.
  if (ctx.plano.coberturaEditalPct < 50) {
    return "legislacao_transito";
  }

  const priorizadas = priorizarDisciplinas(ctx);
  return priorizadas[0]?.disciplina ?? "legislacao_transito";
}

export interface DecidirEspelhoInput {
  espelho: EspelhoResumo;
  diasParaProva: number;
  hoje: Date;
}

/** Regra 5: espelho &lt; 50 ou ausente com D≤30 → encaixar espelho. */
export function precisaEspelho(ctx: TutorContexto, hoje = new Date()): boolean {
  if (ctx.espelho.quantidade === 0) return true;
  if (
    ctx.espelho.media !== null &&
    ctx.espelho.media < MIN_PONTOS_TOTAL
  ) {
    return true;
  }
  if (ctx.diasParaProva <= 30 && ctx.espelho.quantidade === 0) return true;
  if (ctx.espelho.media !== null && ctx.espelho.media < 70) return true;
  if (ctx.espelho.ultimo) {
    const dias =
      (hoje.getTime() - ctx.espelho.ultimo.createdAt.getTime()) /
      (24 * 60 * 60 * 1000);
    if (dias >= DIAS_ENTRE_ESPELHOS) return true;
  }
  return false;
}

export function escolherDiaEspelho(diasParaProva: number): number {
  if (diasParaProva <= 7) return 1;
  return 3;
}

/** Passo DECIDIR — tipo de missão do dia. */
export function decidirTipoMissao(
  ctx: TutorContexto,
  mix: MixDia,
  meta: number,
  forcarEspelho = false,
): TipoMissao {
  if (forcarEspelho) return "espelho";
  if (meta <= 0) return "folga";
  if (meta > 0 && mix.revisoes / meta >= LIMIAR_REVISAO_DOMINANTE) {
    return "revisoes";
  }
  if (
    ctx.fase === "semana_final" &&
    mix.revisoes >= mix.novas &&
    mix.revisoes > 0
  ) {
    return "revisoes";
  }
  return "estudo";
}

/** Passo DECIDIR — N questões do dia (regra 6: capacidade calibrada). */
export function decidirMetaQuestoes(
  ctx: TutorContexto,
  calib: TutorCalibracao = ctx.calibracao,
): number {
  const centro = calib.capacidadeQuestoes || capacidadeFaseCentro(ctx.fase);
  const fromDebito = ctx.plano.debitoDiario * QUESTOES_POR_TOPICO;
  return clamp(Math.max(fromDebito, centro), META_PISO, META_TETO);
}

function revisoesEstimadasDia(fase: FaseProva, meta: number): number {
  if (meta <= 0) return 0;
  return Math.min(meta, Math.max(1, Math.round(meta * proporcaoRevisoesSessao(fase))));
}

/** Passo DECIDIR — mix revisões/novas/erros (regra 1: SRS alto → não abrir edital). */
export function decidirMix(
  ctx: TutorContexto,
  meta: number,
  offset = 0,
): MixDia {
  if (meta <= 0) return { revisoes: 0, novas: 0, erros: 0 };

  const bias = ctx.calibracao.biasRevisao;
  const slots = alocarSlotsSessaoAuto(ctx.fase, meta);
  let revisoes = Math.round(slots.revisoes * (1 + bias));
  let erros = slots.erros;
  let novas = slots.pratica;

  // Regra 1: SRS due alto → não abrir edital demais
  if (ctx.revisoesHoje >= LIMIAR_REVISAO_ALTA && ctx.fase !== "exploracao") {
    revisoes = Math.min(meta, Math.max(revisoes, ctx.revisoesHoje));
    novas = Math.max(0, meta - revisoes - erros);
  }

  if (offset === 0 && ctx.revisoesHoje > revisoes) {
    revisoes = Math.min(meta, ctx.revisoesHoje);
    novas = Math.max(0, meta - revisoes - erros);
  } else if (offset > 0) {
    const estimada = revisoesEstimadasDia(ctx.fase, meta);
    revisoes = Math.min(meta, estimada);
    novas = Math.max(0, meta - revisoes - erros);
  }

  if (
    ctx.fase !== "semana_final" &&
    ctx.plano.debitoDiario > 0 &&
    novas === 0 &&
    revisoes < meta
  ) {
    novas = Math.min(ctx.plano.debitoDiario, meta - revisoes - erros);
  }

  const total = revisoes + novas + erros;
  if (total > meta) {
    novas = Math.max(0, meta - revisoes - erros);
  }

  return { revisoes, novas, erros };
}

export function mixParaSlots(mix: MixDia): SlotsSessaoAuto {
  return {
    revisoes: mix.revisoes,
    erros: mix.erros,
    pratica: mix.novas,
  };
}

/** Texto PT-BR do porquê (sem LLM). Alinhado a `escolherDisciplinaFoco`. */
export function explicarDecisao(
  ctx: TutorContexto,
  tipo: TipoMissao,
  disciplinaFoco?: Disciplina,
): string {
  if (tipo === "espelho") {
    if (ctx.espelho.quantidade === 0) {
      return "Ainda sem simulado — calibre ritmo e nota antes da prova.";
    }
    if (ctx.espelho.media !== null && ctx.espelho.media < MIN_PONTOS_TOTAL) {
      return `Simulado abaixo de ${MIN_PONTOS_TOTAL} pts — simulado é prioridade para sobrevivência.`;
    }
    return "Hora de um simulado de 60 questões no formato da prova.";
  }

  if (tipo === "folga") {
    return "Edital coberto — dia leve com revisões pontuais.";
  }

  if (tipo === "revisoes" || ctx.revisoesHoje >= LIMIAR_REVISAO_ALTA) {
    return "SRS em dia evita esquecer — revisões dominam hoje.";
  }

  const foco = disciplinaFoco ?? escolherDisciplinaFoco(ctx);

  if (ctx.disciplinasEmRisco.some((r) => r.disciplina === foco)) {
    return `${DISCIPLINA_LABELS[foco]} em risco de mínimo — prioridade absoluta.`;
  }

  if (ctx.plano.diasAtraso > 0) {
    return `Ritmo atrasado ${ctx.plano.diasAtraso} dia(s) — feche lacunas do edital.`;
  }

  const gap = ctx.plano.projecao.gapPara90;
  if (gap > 0) {
    return `ROI em ${DISCIPLINA_LABELS[foco]} — faltam ~${gap} pts na projeção para 90.`;
  }

  return `Consolidar ${DISCIPLINA_LABELS[foco]} (peso ${SIMULADO_ESPELHO_DISTRIBUICAO[foco]}Q × ${pesoAcerto(foco)} pts).`;
}

/** Tipos de missão para 7 dias com slot de espelho quando necessário. */
export function montarTiposSemana(
  ctx: TutorContexto,
  hoje = new Date(),
): TipoMissao[] {
  const tipos: TipoMissao[] = Array.from({ length: 7 }, () => "estudo");

  if (precisaEspelho(ctx, hoje)) {
    const offset = escolherDiaEspelho(ctx.diasParaProva);
    tipos[offset] = "espelho";
  }

  if (
    ctx.fase === "semana_final" &&
    ctx.plano.topicosRestantes === 0 &&
    !tipos.includes("espelho")
  ) {
    tipos[6] = "folga";
  }

  return tipos;
}

/** Export para testes — ordem ROI do mapa. */
export function disciplinasRoiOrdenadas(): Disciplina[] {
  return disciplinasPorRoi().map((d) => d.disciplina);
}
