import { hrefEstudoRevisoes } from "@/lib/estudo-links";
import {
  type FaseProva,
  type PlanoProvaResumo,
} from "@/lib/plano-prova-calc";
import type { EspelhoResumo, SemaforoData } from "@/lib/semaforo";
import type { PiorTopico } from "@/lib/piores-topicos-shared";
import { carregarTutorContexto } from "@/lib/tutor/contexto";
import type { TutorCalibracao } from "@/lib/tutor/calibracao";
import {
  decidirMetaQuestoes,
  decidirMix,
  decidirTipoMissao,
  escolherDisciplinaFoco,
  explicarDecisao,
  montarTiposSemana,
  precisaEspelho,
  escolherDiaEspelho,
} from "@/lib/tutor/politica";
import {
  DISCIPLINA_LABELS,
  type Disciplina,
} from "@/types";

export type TipoMissao = "estudo" | "revisoes" | "espelho" | "folga";

export type StatusMissao =
  | "feito"
  | "parcial"
  | "hoje"
  | "futuro"
  | "atrasado";

export interface MixDia {
  revisoes: number;
  novas: number;
  erros: number;
}

export interface MissaoDia {
  data: string;
  diaSemanaLabel: string;
  offset: number;
  tipo: TipoMissao;
  metaQuestoes: number;
  mix: MixDia;
  disciplinaFoco?: Disciplina;
  titulo: string;
  motivo: string;
  href: string;
  status: StatusMissao;
  progressoQuestoes: number;
}

export interface SemanaChegadaResumo {
  missoes: MissaoDia[];
  metaSemanal: number;
  feitos: number;
  mensagemChegada90: string;
}

export interface EscolherFocoInput {
  coberturaEditalPct: number;
  disciplinasEmRisco: { disciplina: Disciplina }[];
  disciplinas: { disciplina: Disciplina; coberturaPct: number }[];
  pioresTopicos?: PiorTopico[];
}

export interface SemanaChegadaInput {
  hoje?: Date;
  plano: PlanoProvaResumo;
  atividadeHoje: { questoes: number };
  disciplinasEmRisco: { disciplina: Disciplina }[];
  disciplinas: { disciplina: Disciplina; coberturaPct: number }[];
  espelho: EspelhoResumo;
  pioresTopicos?: PiorTopico[];
  calibracao?: TutorCalibracao;
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

const MINUTOS_PADRAO = 45;
const META_PISO = 12;
const META_TETO = 30;
const META_ESPELHO_90 = 85;

const CAPACIDADE_FASE: Record<
  FaseProva,
  { min: number; max: number; centro: number }
> = {
  exploracao: { min: 18, max: 22, centro: 20 },
  consolidacao: { min: 20, max: 25, centro: 22 },
  aperto: { min: 22, max: 28, centro: 25 },
  semana_final: { min: 15, max: 20, centro: 18 },
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function formatDataISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDias(base: Date, dias: number): Date {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dias);
  return d;
}

/** Meta de questões por sessão conforme fase e tempo disponível (default 45 min). */
export function capacidadeDia(fase: FaseProva, minutos = MINUTOS_PADRAO): number {
  const { min, max, centro } = CAPACIDADE_FASE[fase];
  const fator = minutos / MINUTOS_PADRAO;
  return clamp(Math.round(centro * fator), min, max);
}

/** @deprecated Use decidirMetaQuestoes via política — mantido para testes legados. */
export function metaQuestoesDia(
  fase: FaseProva,
  debitoDiario: number,
  minutos = MINUTOS_PADRAO,
): number {
  const cap = capacidadeDia(fase, minutos);
  const fromDebito = debitoDiario * 3;
  return clamp(Math.max(fromDebito, cap), META_PISO, META_TETO);
}

/** Delega à política tutor (ROI edital × banca). */
export function escolherFocoDisciplina(input: EscolherFocoInput): Disciplina {
  const ctx = carregarTutorContexto({
    plano: {
      coberturaEditalPct: input.coberturaEditalPct,
    } as PlanoProvaResumo,
    desempenho: {
      semaforo: {
        disciplinasEmRisco: input.disciplinasEmRisco.map((r) => ({
          ...r,
          pontos: 0,
          minimo: 1,
        })),
        espelho: {
          janela: 3,
          quantidade: 0,
          ultimo: null,
          media: null,
          melhor: null,
        },
      } as unknown as SemaforoData,
      disciplinas: input.disciplinas.map((d) => ({
        ...d,
        label: "",
        pontos: 0,
        minimo: 1,
        zona: "vazio" as const,
        tentativas: 0,
        acertos: 0,
        taxaAcerto: 0,
        topicosTotal: 0,
        topicosMapeados: 0,
        topicosVistos: 0,
        questoesProva: 0,
      })),
      coberturaEditalPct: input.coberturaEditalPct,
    },
    pioresTopicos: input.pioresTopicos,
  });
  return escolherDisciplinaFoco(ctx);
}

/** Distribui mix de revisões/novas/erros para 7 dias via política. */
export function alocarMixSemana(
  fase: FaseProva,
  revisoesHoje: number,
  debito: number,
  metasDiarias: number[],
  calibracao?: TutorCalibracao,
): MixDia[] {
  if (metasDiarias.length !== 7) {
    throw new Error("alocarMixSemana exige exatamente 7 metas diárias");
  }

  const planoStub = {
    fase,
    debitoDiario: debito,
    revisoesHoje,
    diasParaProva: 30,
    projecao: { gapPara90: 10, notaProjetada: 80, gapPara50: 0, porDisciplina: [], pesoEspelho: 0 },
  } as unknown as PlanoProvaResumo;

  const ctx = carregarTutorContexto({
    plano: planoStub,
    retencao: { revisoesHoje },
    calibracao,
  });

  return metasDiarias.map((meta, offset) => decidirMix(ctx, meta, offset));
}

export interface InserirEspelhoInput {
  espelhoQuantidade: number;
  espelhoMedia: number | null;
  ultimoEspelhoEm: Date | null;
  hoje: Date;
  diasParaProva: number;
}

/** Indica se a semana precisa de um slot de simulado espelho. */
export function precisaEspelhoNaSemana(input: InserirEspelhoInput): boolean {
  const ctx = carregarTutorContexto({
    plano: { diasParaProva: input.diasParaProva } as PlanoProvaResumo,
    desempenho: {
      semaforo: {
        espelho: {
          janela: 3,
          quantidade: input.espelhoQuantidade,
          ultimo: input.ultimoEspelhoEm
            ? { nota: 0, createdAt: input.ultimoEspelhoEm }
            : null,
          media: input.espelhoMedia,
          melhor: null,
        },
        disciplinasEmRisco: [],
      } as unknown as SemaforoData,
      disciplinas: [],
      coberturaEditalPct: 0,
    },
  });
  return precisaEspelho(ctx, input.hoje);
}

export { escolherDiaEspelho };

/** Marca um offset como espelho na lista de tipos do dia. */
export function inserirEspelhoNaSemana(
  tipos: TipoMissao[],
  input: InserirEspelhoInput,
): TipoMissao[] {
  if (!precisaEspelhoNaSemana(input)) return tipos;

  const offset = escolherDiaEspelho(input.diasParaProva);
  const next = [...tipos];
  next[offset] = "espelho";
  return next;
}

/** Rótulo do CTA principal do dia (painel + plano). */
export function labelCtaMissao(missao: MissaoDia): string {
  if (missao.status === "feito") {
    return missao.tipo === "folga" ? "Dia leve" : "Dia concluído";
  }
  switch (missao.tipo) {
    case "espelho":
      return "Fazer simulado";
    case "folga":
      return "Ver evolução";
    default: {
      const restante =
        missao.progressoQuestoes > 0
          ? Math.max(1, missao.metaQuestoes - missao.progressoQuestoes)
          : missao.metaQuestoes;
      return `Meta do dia · ${restante} questões`;
    }
  }
}

export function statusMissao(
  progresso: number,
  meta: number,
  offset: number,
): StatusMissao {
  if (offset < 0) return "atrasado";
  if (offset === 0) {
    if (meta > 0 && progresso >= meta) return "feito";
    if (progresso > 0) return "parcial";
    return "hoje";
  }
  return "futuro";
}

function hrefEstudoMissao(
  meta: number,
  disciplina: Disciplina | undefined,
  missaoHoje: boolean,
): string {
  const params = new URLSearchParams({
    modo: "auto",
    limit: String(clamp(meta, 10, 30)),
  });
  if (disciplina) params.set("disciplina", disciplina);
  if (missaoHoje) params.set("missao", "hoje");
  return `/estudo?${params.toString()}`;
}

function hrefRevisoesMissao(meta: number, missaoHoje: boolean): string {
  const params = new URLSearchParams({
    modo: "revisoes",
    limit: String(clamp(meta, 10, 30)),
  });
  if (missaoHoje) params.set("missao", "hoje");
  return `/estudo?${params.toString()}`;
}

function montarTituloMotivoHref(
  tipo: TipoMissao,
  mix: MixDia,
  meta: number,
  disciplinaFoco: Disciplina | undefined,
  ctx: ReturnType<typeof carregarTutorContexto>,
  offset: number,
): { titulo: string; motivo: string; href: string } {
  const missaoHoje = offset === 0;
  const labelDisc = disciplinaFoco
    ? DISCIPLINA_LABELS[disciplinaFoco]
    : "edital";
  const motivo = explicarDecisao(ctx, tipo, disciplinaFoco);

  switch (tipo) {
    case "espelho":
      return {
        titulo: "Simulado",
        motivo,
        href: "/simulado",
      };
    case "folga":
      return {
        titulo: "Descanso ativo",
        motivo,
        href: "/desempenho",
      };
    case "revisoes":
      return {
        titulo: `Revisões · ${mix.revisoes}`,
        motivo,
        href:
          missaoHoje && meta > 0
            ? hrefRevisoesMissao(meta, true)
            : hrefEstudoRevisoes(),
      };
    default:
      return {
        titulo: `${labelDisc} + revisões`,
        motivo,
        href: hrefEstudoMissao(meta, disciplinaFoco, missaoHoje),
      };
  }
}

function diasParaFecharCobertura(plano: PlanoProvaResumo): number | null {
  if (plano.topicosRestantes <= 0) return 0;
  if (plano.debitoDiario <= 0) return null;
  return Math.ceil(plano.topicosRestantes / plano.debitoDiario);
}

export function mensagemChegada90(
  plano: PlanoProvaResumo,
  espelhoMedia: number | null,
): string {
  const diasCobertura = diasParaFecharCobertura(plano);
  const gap = plano.projecao?.gapPara90 ?? 0;

  if (plano.topicosRestantes === 0) {
    const espelhoTxt =
      espelhoMedia !== null
        ? `Média dos simulados: ${Math.round(espelhoMedia)} pts.`
        : "Faça um simulado esta semana.";
    return `Edital coberto. Para 90 pontos: mantenha simulados ≥ ${META_ESPELHO_90} e revisões em dia. ${espelhoTxt}`;
  }

  if (diasCobertura !== null && plano.diasAtraso === 0) {
  return `Com este ritmo, a cobertura fecha em cerca de ${diasCobertura} dias. Projeção ~${plano.projecao?.notaProjetada ?? "?"} pts${gap > 0 ? ` · faltam ${gap} para 90` : ""}.`;
  }

  if (plano.diasAtraso > 0) {
    return `Ritmo atrasado ${plano.diasAtraso} dia(s). Para 90 pontos: recupere cobertura e mantenha simulados ≥ ${META_ESPELHO_90}.`;
  }

  return `Para 90 pontos: mantenha simulados ≥ ${META_ESPELHO_90} e revisões em dia.`;
}

export function montarSemanaChegada(input: SemanaChegadaInput): SemanaChegadaResumo {
  const hoje = input.hoje ?? new Date();
  const ctx = carregarTutorContexto({
    plano: input.plano,
    desempenho: {
      semaforo: {
        disciplinasEmRisco: input.disciplinasEmRisco.map((r) => ({
          disciplina: r.disciplina,
          pontos: 0,
          minimo: 1,
        })),
        espelho: input.espelho,
      } as import("@/lib/semaforo").SemaforoData,
      disciplinas: input.disciplinas.map((d) => ({
        ...d,
        label: DISCIPLINA_LABELS[d.disciplina],
        pontos: 0,
        minimo: 1,
        zona: "vazio" as const,
        tentativas: 0,
        acertos: 0,
        taxaAcerto: 0,
        topicosTotal: 0,
        topicosMapeados: 0,
        topicosVistos: 0,
        questoesProva: 0,
      })),
      coberturaEditalPct: input.plano.coberturaEditalPct,
    },
    atividadeHoje: input.atividadeHoje,
    pioresTopicos: input.pioresTopicos,
    calibracao: input.calibracao,
  });

  const disciplinaFoco = escolherDisciplinaFoco(ctx);
  const metaBase = decidirMetaQuestoes(ctx);
  const metasDiarias = Array.from({ length: 7 }, () => metaBase);

  const tiposComEspelho = montarTiposSemana(ctx, hoje);

  for (let i = 0; i < 7; i++) {
    if (tiposComEspelho[i] === "espelho" || tiposComEspelho[i] === "folga") {
      metasDiarias[i] = 0;
    }
  }

  const mixes = metasDiarias.map((meta, offset) =>
    decidirMix(ctx, meta, offset),
  );

  const missoes: MissaoDia[] = [];

  for (let offset = 0; offset < 7; offset++) {
    const data = addDias(hoje, offset);
    const meta = metasDiarias[offset];
    const mix = mixes[offset];
    const forcarEspelho = tiposComEspelho[offset] === "espelho";
    const tipo =
      tiposComEspelho[offset] === "folga"
        ? "folga"
        : decidirTipoMissao(ctx, mix, meta, forcarEspelho);

    const metaFinal =
      tipo === "espelho" || tipo === "folga" ? 0 : meta;
    const progresso = offset === 0 ? input.atividadeHoje.questoes : 0;
    const { titulo, motivo, href } = montarTituloMotivoHref(
      tipo,
      mix,
      metaFinal,
      disciplinaFoco,
      ctx,
      offset,
    );

    missoes.push({
      data: formatDataISO(data),
      diaSemanaLabel: DIAS_SEMANA[data.getDay()],
      offset,
      tipo,
      metaQuestoes: metaFinal,
      mix,
      disciplinaFoco: tipo === "estudo" ? disciplinaFoco : undefined,
      titulo,
      motivo,
      href,
      status: statusMissao(progresso, metaFinal, offset),
      progressoQuestoes: progresso,
    });
  }

  const metaSemanal = missoes.reduce((acc, m) => acc + m.metaQuestoes, 0);
  const feitos = missoes.filter((m) => m.status === "feito").length;

  return {
    missoes,
    metaSemanal,
    feitos,
    mensagemChegada90: mensagemChegada90(input.plano, input.espelho.media),
  };
}

export function semanaChegadaFallback(plano: PlanoProvaResumo): SemanaChegadaResumo {
  return montarSemanaChegada({
    plano,
    atividadeHoje: { questoes: 0 },
    disciplinasEmRisco: [],
    disciplinas: [],
    espelho: {
      janela: 3,
      quantidade: 0,
      ultimo: null,
      media: null,
      melhor: null,
    },
  });
}
