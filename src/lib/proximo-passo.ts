import type { PlanoProvaResumo } from "@/lib/plano-prova";
import { MIN_PONTOS_TOTAL } from "@/lib/edital-constants";

export interface ProximoPasso {
  href: string;
  label: string;
  motivo: string;
}

/**
 * Próxima ação do painel — prioriza o pacote do plano até a prova.
 */
export function calcularProximoPasso(plano: PlanoProvaResumo): ProximoPasso {
  if (
    plano.fase === "semana_final" &&
    plano.revisoesHoje > 0
  ) {
    return {
      href: plano.pacote.href,
      label: plano.pacote.label,
      motivo: plano.pacote.motivo,
    };
  }

  if (
    plano.espelhoMedia !== null &&
    plano.espelhoMedia < MIN_PONTOS_TOTAL &&
    plano.diasParaProva <= 30
  ) {
    return {
      href: "/simulado",
      label: "Fazer simulado",
      motivo: `Média dos últimos simulados abaixo de ${MIN_PONTOS_TOTAL} — treine a prova completa`,
    };
  }

  if (plano.diasAtraso > 0) {
    return {
      href: plano.pacote.href,
      label: plano.pacote.label,
      motivo: plano.pacote.motivo,
    };
  }

  if (plano.revisoesHoje > 0) {
    return {
      href: plano.pacote.href,
      label: plano.pacote.label,
      motivo: plano.pacote.motivo,
    };
  }

  return {
    href: plano.pacote.href,
    label: plano.pacote.label,
    motivo: plano.pacote.motivo,
  };
}
