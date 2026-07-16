import { DISCIPLINA_LABELS, type Disciplina } from "@/types";

export interface ProximoPasso {
  href: string;
  label: string;
  motivo: string;
}

interface ProximoPassoInput {
  emRisco: boolean;
  /** Primeira disciplina abaixo do mínimo (quando houver). */
  disciplinaRisco?: Disciplina;
  revisoesHoje: number;
  questoesDisponiveis: boolean;
}

/**
 * Próxima ação do painel — 3 caminhos claros:
 * 1) disciplina abaixo do mínimo → estudar essa disciplina
 * 2) revisões FSRS → motor auto
 * 3) padrão → CTB (50% da prova)
 */
export function calcularProximoPasso({
  emRisco,
  disciplinaRisco,
  revisoesHoje,
  questoesDisponiveis,
}: ProximoPassoInput): ProximoPasso {
  if (emRisco && disciplinaRisco) {
    return {
      href: `/estudo?disciplina=${disciplinaRisco}`,
      label: `Estudar ${DISCIPLINA_LABELS[disciplinaRisco]}`,
      motivo: "Abaixo do mínimo nesta disciplina",
    };
  }

  if (emRisco) {
    return {
      href: "/estudo?modo=auto",
      label: "Continuar estudo",
      motivo: "Há disciplinas abaixo do mínimo — o motor prioriza essas lacunas",
    };
  }

  if (revisoesHoje > 0) {
    return {
      href: "/estudo?modo=auto",
      label: `Revisar · ${revisoesHoje}`,
      motivo: "Itens no ciclo FSRS para hoje",
    };
  }

  if (!questoesDisponiveis) {
    return {
      href: "/estudo?disciplina=legislacao_transito",
      label: "Começar com CTB",
      motivo: "Inicie pela metade da prova",
    };
  }

  return {
    href: "/estudo?disciplina=legislacao_transito",
    label: "Estudar CTB",
    motivo: "50% da prova — Legislação de Trânsito",
  };
}
