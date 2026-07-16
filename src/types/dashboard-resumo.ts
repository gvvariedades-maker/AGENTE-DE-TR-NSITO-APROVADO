import type { DesempenhoResumo } from "@/lib/desempenho";
import type { RetencaoResumo } from "@/lib/retencao";
import type { PiorTopico } from "@/lib/piores-topicos-shared";

export interface DashboardResumo {
  desempenho: DesempenhoResumo;
  retencao: RetencaoResumo;
  atividadeHoje: { questoes: number; acertos: number };
  questoesCount: number;
  questoesReaisCount: number;
  pioresTopicos: PiorTopico[];
}
