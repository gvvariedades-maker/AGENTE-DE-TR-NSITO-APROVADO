import {
  MIN_PONTOS_DISCIPLINA_ESPECIFICO,
  MIN_PONTOS_DISCIPLINA_GERAL,
  MIN_PONTOS_TOTAL,
  isDisciplinaGeral,
  type ZonaSemaforo,
} from "@/lib/edital-constants";
import type { ContagemDominio } from "@/lib/dominio-topico";
import type { PlanoProvaResumo } from "@/lib/plano-prova-calc";
import { projetarPontosDisciplina } from "@/lib/semaforo-projecao";
import {
  DISCIPLINAS,
  DISCIPLINA_LABELS,
  type Disciplina,
} from "@/types";

export const META_NOTA_ALVO = 90;
export const META_NOTA_SOBREVIVENCIA = MIN_PONTOS_TOTAL;

export interface ProjecaoDisciplina {
  disciplina: Disciplina;
  label: string;
  pontosProjetados: number;
  tentativas: number;
  acertos: number;
  minimo: number;
  emRisco: boolean;
}

export interface ProjecaoNota {
  notaProjetada: number;
  gapPara90: number;
  gapPara50: number;
  porDisciplina: ProjecaoDisciplina[];
  /** Peso do espelho na projeção final (0 = só tentativas, 1 = só espelho). */
  pesoEspelho: number;
}

export interface SinalIndiceChegada {
  id: "dominio" | "ritmo" | "espelho" | "sobrevivencia";
  label: string;
  texto: string;
  zona: ZonaSemaforo;
}

export interface IndiceChegada {
  sinais: SinalIndiceChegada[];
  resumo: string;
}

export interface MontarProjecaoInput {
  disciplinas: {
    disciplina: Disciplina;
    acertos: number;
    tentativas: number;
    pontos?: number;
  }[];
  disciplinasEmRisco: { disciplina: Disciplina }[];
  espelhoMedia: number | null;
  espelhoQuantidade: number;
}

function minimoDisciplina(d: Disciplina): number {
  return isDisciplinaGeral(d)
    ? MIN_PONTOS_DISCIPLINA_GERAL
    : MIN_PONTOS_DISCIPLINA_ESPECIFICO;
}

/** Projeção por disciplina a partir das tentativas (+ blend opcional com espelho). */
export function montarProjecaoNota(input: MontarProjecaoInput): ProjecaoNota {
  const emRisco = new Set(input.disciplinasEmRisco.map((r) => r.disciplina));

  const porDisciplina: ProjecaoDisciplina[] = DISCIPLINAS.map((disciplina) => {
    const row = input.disciplinas.find((d) => d.disciplina === disciplina);
    const acertos = row?.acertos ?? 0;
    const tentativas = row?.tentativas ?? 0;
    const pontosTentativas = projetarPontosDisciplina(
      acertos,
      tentativas,
      disciplina,
    );
    const minimo = minimoDisciplina(disciplina);
    return {
      disciplina,
      label: DISCIPLINA_LABELS[disciplina],
      pontosProjetados: pontosTentativas,
      tentativas,
      acertos,
      minimo,
      emRisco: emRisco.has(disciplina),
    };
  });

  const somaTentativas = porDisciplina.reduce(
    (s, d) => s + d.pontosProjetados,
    0,
  );

  const pesoEspelho =
    input.espelhoQuantidade > 0 && input.espelhoMedia !== null
      ? Math.min(0.65, 0.25 + input.espelhoQuantidade * 0.12)
      : 0;

  const notaProjetada = Math.round(
    somaTentativas * (1 - pesoEspelho) +
      (input.espelhoMedia ?? somaTentativas) * pesoEspelho,
  );

  return {
    notaProjetada,
    gapPara90: Math.max(0, META_NOTA_ALVO - notaProjetada),
    gapPara50: Math.max(0, META_NOTA_SOBREVIVENCIA - notaProjetada),
    porDisciplina,
    pesoEspelho,
  };
}

function zonaDominio(contagem: ContagemDominio): ZonaSemaforo {
  if (contagem.total === 0) return "vazio";
  const pct = contagem.dominado / contagem.total;
  if (pct >= 0.6) return "verde";
  if (pct >= 0.35) return "amarelo";
  return "vermelho";
}

function zonaRitmo(plano: PlanoProvaResumo): ZonaSemaforo {
  if (plano.diasAtraso > 3) return "vermelho";
  if (plano.diasAtraso > 0) return "amarelo";
  if (plano.chegada === "vermelho") return "vermelho";
  if (plano.chegada === "amarelo") return "amarelo";
  return plano.chegada === "vazio" ? "vazio" : "verde";
}

function zonaEspelho(
  media: number | null,
  quantidade: number,
): ZonaSemaforo {
  if (quantidade === 0 || media === null) return "vazio";
  if (media < MIN_PONTOS_TOTAL) return "vermelho";
  if (media < META_NOTA_ALVO) return "amarelo";
  return "verde";
}

function zonaSobrevivencia(
  projecao: ProjecaoNota,
  disciplinasEmRisco: number,
): ZonaSemaforo {
  if (disciplinasEmRisco > 0) return "vermelho";
  if (projecao.gapPara50 > 0) return "vermelho";
  if (projecao.notaProjetada < META_NOTA_ALVO) return "amarelo";
  return "verde";
}

/** Quatro sinais de transparência no Plano (domínio, ritmo, espelho, sobrevivência). */
export function montarIndiceChegada(input: {
  plano: PlanoProvaResumo;
  projecao: ProjecaoNota;
  dominioGlobal: ContagemDominio;
  disciplinasEmRisco: number;
}): IndiceChegada {
  const { plano, projecao, dominioGlobal, disciplinasEmRisco } = input;

  const pctDominio =
    dominioGlobal.total > 0
      ? Math.round((dominioGlobal.dominado / dominioGlobal.total) * 100)
      : 0;

  const sinais: SinalIndiceChegada[] = [
    {
      id: "dominio",
      label: "Domínio",
      texto:
        dominioGlobal.total > 0
          ? `${pctDominio}% consolidado (${dominioGlobal.dominado}/${dominioGlobal.total})`
          : "Sem assuntos estudados ainda",
      zona: zonaDominio(dominioGlobal),
    },
    {
      id: "ritmo",
      label: "Ritmo",
      texto:
        plano.diasAtraso > 0
          ? `${plano.diasAtraso} dia(s) de atraso · meta ${plano.debitoDiario}/dia`
          : `No ritmo · meta ${plano.debitoDiario} assunto(s)/dia`,
      zona: zonaRitmo(plano),
    },
    {
      id: "espelho",
      label: "Simulado",
      texto:
        plano.espelhoQuantidade > 0 && plano.espelhoMedia !== null
          ? `Média ${plano.espelhoMedia.toFixed(0)} pts (${plano.espelhoQuantidade} simulado${plano.espelhoQuantidade > 1 ? "s" : ""})`
          : "Nenhum simulado entregue ainda",
      zona: zonaEspelho(plano.espelhoMedia, plano.espelhoQuantidade),
    },
    {
      id: "sobrevivencia",
      label: "Sobrevivência",
      texto:
        disciplinasEmRisco > 0
          ? `${disciplinasEmRisco} disciplina(s) abaixo do mínimo`
          : projecao.gapPara50 > 0
            ? `Projeção ${projecao.notaProjetada} pts — abaixo de ${MIN_PONTOS_TOTAL}`
            : `Projeção ~${projecao.notaProjetada} pts · mínimos ok`,
      zona: zonaSobrevivencia(projecao, disciplinasEmRisco),
    },
  ];

  const vermelhos = sinais.filter((s) => s.zona === "vermelho").length;
  const resumo =
    vermelhos >= 2
      ? "Trajetória em risco — priorize o que o tutor indicou hoje."
      : projecao.gapPara90 > 0
        ? `Projeção ~${projecao.notaProjetada} pts · faltam ${projecao.gapPara90} para ${META_NOTA_ALVO}.`
        : `Projeção ~${projecao.notaProjetada} pts — na faixa do alvo.`;

  return { sinais, resumo };
}
