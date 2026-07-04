import {
  MIN_PONTOS_DISCIPLINA_ESPECIFICO,
  MIN_PONTOS_DISCIPLINA_GERAL,
  MIN_PONTOS_TOTAL,
  isDisciplinaGeral,
  pesoAcerto,
} from "@/lib/edital-constants";
import { DISCIPLINAS, type Disciplina } from "@/types";

export interface RespostaSimuladoItem {
  questionId: string;
  disciplina: Disciplina;
  acertou: boolean;
  resposta?: string;
}

export interface DisciplinaEmRisco {
  disciplina: Disciplina;
  pontos: number;
  minimo: number;
  acertos: number;
  total: number;
}

export interface ResultadoSimulado {
  notaTotal: number;
  notasDisciplina: Record<Disciplina, number>;
  zerouDisciplina: boolean;
  aprovado: boolean;
  acertos: number;
  erros: number;
  totalQuestoes: number;
  disciplinasEmRisco: DisciplinaEmRisco[];
}

function minimoDisciplina(disciplina: Disciplina): number {
  return isDisciplinaGeral(disciplina)
    ? MIN_PONTOS_DISCIPLINA_GERAL
    : MIN_PONTOS_DISCIPLINA_ESPECIFICO;
}

/**
 * Calcula nota do simulado espelho com pesos do edital:
 * Gerais = 1 pt/acerto; Específicos = 2 pts/acerto.
 * `zerou_disciplina` = alguma disciplina presente na prova ficou abaixo do mínimo.
 */
export function calcularResultadoSimulado(
  respostas: RespostaSimuladoItem[],
): ResultadoSimulado {
  const acertosPorDisciplina = new Map<Disciplina, number>();
  const totalPorDisciplina = new Map<Disciplina, number>();

  for (const d of DISCIPLINAS) {
    acertosPorDisciplina.set(d, 0);
    totalPorDisciplina.set(d, 0);
  }

  let acertos = 0;
  for (const item of respostas) {
    totalPorDisciplina.set(
      item.disciplina,
      (totalPorDisciplina.get(item.disciplina) ?? 0) + 1,
    );
    if (item.acertou) {
      acertos += 1;
      acertosPorDisciplina.set(
        item.disciplina,
        (acertosPorDisciplina.get(item.disciplina) ?? 0) + 1,
      );
    }
  }

  const notasDisciplina = {} as Record<Disciplina, number>;
  let notaTotal = 0;
  const disciplinasEmRisco: DisciplinaEmRisco[] = [];

  for (const disciplina of DISCIPLINAS) {
    const acertosDisc = acertosPorDisciplina.get(disciplina) ?? 0;
    const pts = acertosDisc * pesoAcerto(disciplina);
    notasDisciplina[disciplina] = pts;
    notaTotal += pts;

    const totalDisc = totalPorDisciplina.get(disciplina) ?? 0;
    const minimo = minimoDisciplina(disciplina);
    if (totalDisc > 0 && pts < minimo) {
      disciplinasEmRisco.push({
        disciplina,
        pontos: pts,
        minimo,
        acertos: acertosDisc,
        total: totalDisc,
      });
    }
  }

  const zerouDisciplina = disciplinasEmRisco.length > 0;
  const aprovado = notaTotal >= MIN_PONTOS_TOTAL && !zerouDisciplina;

  return {
    notaTotal,
    notasDisciplina,
    zerouDisciplina,
    aprovado,
    acertos,
    erros: respostas.length - acertos,
    totalQuestoes: respostas.length,
    disciplinasEmRisco,
  };
}

/** Monta respostas a partir do mapa de marcações (questões não respondidas = erro). */
export function montarRespostasSimulado(
  questoes: { id: string; disciplina: Disciplina; gabarito: string }[],
  marcacoes: Map<string, string>,
): RespostaSimuladoItem[] {
  return questoes.map((q) => {
    const resposta = marcacoes.get(q.id);
    const acertou = resposta !== undefined && resposta === q.gabarito;
    return {
      questionId: q.id,
      disciplina: q.disciplina,
      acertou,
      resposta,
    };
  });
}
