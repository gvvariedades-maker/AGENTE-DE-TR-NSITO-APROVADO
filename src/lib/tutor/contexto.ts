import type { DesempenhoResumo } from "@/lib/desempenho";
import type { PlanoProvaResumo, FaseProva } from "@/lib/plano-prova-calc";
import type { PiorTopico } from "@/lib/piores-topicos-shared";
import type { RetencaoResumo } from "@/lib/retencao";
import type { EspelhoResumo } from "@/lib/semaforo";
import type { DominioResumo } from "@/lib/tutor/dominio-resumo";
import type { TutorCalibracao } from "@/lib/tutor/calibracao";
import { CALIBRACAO_PADRAO } from "@/lib/tutor/calibracao";
import { diasParaProva } from "@/lib/prova-data";
import { calcularFase } from "@/lib/plano-prova-calc";
import type { Disciplina } from "@/types";

export interface TutorContexto {
  diasParaProva: number;
  fase: FaseProva;
  plano: PlanoProvaResumo;
  dominio: DominioResumo;
  revisoesHoje: number;
  espelho: EspelhoResumo;
  disciplinasEmRisco: { disciplina: Disciplina; pontos: number; minimo: number }[];
  disciplinas: { disciplina: Disciplina; coberturaPct: number }[];
  pioresTopicos: PiorTopico[];
  atividadeHoje: { questoes: number };
  calibracao: TutorCalibracao;
}

export interface CarregarTutorContextoInput {
  plano: PlanoProvaResumo;
  dominio?: DominioResumo;
  desempenho?: Pick<
    DesempenhoResumo,
    "semaforo" | "disciplinas" | "coberturaEditalPct"
  >;
  retencao?: Pick<RetencaoResumo, "revisoesHoje">;
  atividadeHoje?: { questoes: number };
  pioresTopicos?: PiorTopico[];
  calibracao?: TutorCalibracao;
}

/** Agrega estado do aluno para o Planejador Tutor (Camada 1). */
export function carregarTutorContexto(
  input: CarregarTutorContextoInput,
): TutorContexto {
  const dias = input.plano.diasParaProva ?? diasParaProva();
  const semaforo = input.desempenho?.semaforo;

  return {
    diasParaProva: dias,
    fase: input.plano.fase ?? calcularFase(dias),
    plano: input.plano,
    dominio: input.dominio ?? {
      global: { total: 0, nao_visto: 0, aprendendo: 0, formando: 0, dominado: 0 },
      porDisciplina: {} as DominioResumo["porDisciplina"],
      backlog: 0,
      debitoDiario: 0,
      topicos: [],
      hasData: false,
    },
    revisoesHoje:
      input.retencao?.revisoesHoje ?? input.plano.revisoesHoje ?? 0,
    espelho: semaforo?.espelho ?? {
      janela: 3,
      quantidade: 0,
      ultimo: null,
      media: null,
      melhor: null,
    },
    disciplinasEmRisco: semaforo?.disciplinasEmRisco ?? [],
    disciplinas:
      input.desempenho?.disciplinas.map((d) => ({
        disciplina: d.disciplina,
        coberturaPct: d.coberturaPct,
      })) ?? [],
    pioresTopicos: input.pioresTopicos ?? [],
    atividadeHoje: input.atividadeHoje ?? { questoes: 0 },
    calibracao: input.calibracao ?? CALIBRACAO_PADRAO,
  };
}
