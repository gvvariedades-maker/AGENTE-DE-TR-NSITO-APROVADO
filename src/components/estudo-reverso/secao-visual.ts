import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Brain,
  GitCompare,
  Lightbulb,
  Map,
  Route,
  Scale,
  Target,
  BookOpen,
} from "lucide-react";
import type { Secao } from "@/types/estudo-reverso-visual";

export interface SecaoVisualMeta {
  icon: LucideIcon;
  /** Classe Tailwind para ícone, título e barra de progresso. */
  accentClass: string;
  /** Classe de fundo suave para o ícone no cabeçalho. */
  iconBgClass: string;
  /** Rótulo curto na barra de progresso. */
  rotulo: string;
}

const SECAO_VISUAL: Record<Secao, SecaoVisualMeta> = {
  diagnostico: {
    icon: AlertTriangle,
    accentClass: "text-semaforo-amarelo",
    iconBgClass: "bg-semaforo-amarelo/15",
    rotulo: "Diagnóstico",
  },
  mapa: {
    icon: Map,
    accentClass: "text-muted-foreground",
    iconBgClass: "bg-muted",
    rotulo: "Mapa",
  },
  contraste: {
    icon: GitCompare,
    accentClass: "text-blue-600 dark:text-blue-400",
    iconBgClass: "bg-blue-500/10",
    rotulo: "Contraste",
  },
  distratores: {
    icon: Target,
    accentClass: "text-semaforo-vermelho",
    iconBgClass: "bg-semaforo-vermelho/10",
    rotulo: "Distratores",
  },
  metodo: {
    icon: Route,
    accentClass: "text-transito-foreground",
    iconBgClass: "bg-transito/15",
    rotulo: "Método",
  },
  lei: {
    icon: Scale,
    accentClass: "text-transito-foreground",
    iconBgClass: "bg-transito/15",
    rotulo: "Lei",
  },
  conceito: {
    icon: BookOpen,
    accentClass: "text-blue-600 dark:text-blue-400",
    iconBgClass: "bg-blue-500/10",
    rotulo: "Conceito",
  },
  recall: {
    icon: Brain,
    accentClass: "text-semaforo-verde",
    iconBgClass: "bg-semaforo-verde/10",
    rotulo: "Recall",
  },
  macete: {
    icon: Lightbulb,
    accentClass: "text-semaforo-amarelo",
    iconBgClass: "bg-semaforo-amarelo/15",
    rotulo: "Macete",
  },
};

const SECAO_PADRAO: SecaoVisualMeta = {
  icon: BookOpen,
  accentClass: "text-transito-foreground",
  iconBgClass: "bg-transito/10",
  rotulo: "Estudo",
};

export function metaSecaoVisual(secao?: Secao): SecaoVisualMeta {
  if (!secao) return SECAO_PADRAO;
  return SECAO_VISUAL[secao];
}

/**
 * Barra monocromática (transito) — a cor da seção fica só no rótulo.
 * `estado`: futuro | visto | atual
 */
export function progressBarClass(
  estado: "futuro" | "visto" | "atual",
): string {
  if (estado === "futuro") return "bg-muted";
  if (estado === "atual") return "bg-transito h-1.5";
  return "bg-transito/55";
}
