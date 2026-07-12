export interface ProximoPasso {
  href: string;
  label: string;
  motivo: string;
}

interface ProximoPassoInput {
  emRisco: boolean;
  revisoesHoje: number;
  questoesDisponiveis: boolean;
}

export function calcularProximoPasso({
  emRisco,
  revisoesHoje,
  questoesDisponiveis,
}: ProximoPassoInput): ProximoPasso {
  if (emRisco) {
    return {
      href: "/estudo?modo=anti_zerar",
      label: "Treinar anti-zerar",
      motivo: "Gerais abaixo do mínimo — risco de eliminação",
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
    label: "Sniper CTB",
    motivo: "50% da prova — aprofundar Legislação de Trânsito",
  };
}
