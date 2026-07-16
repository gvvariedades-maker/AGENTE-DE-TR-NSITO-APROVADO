import type { DesempenhoResumo, DesempenhoTopico } from "@/lib/desempenho";
import type { RetencaoResumo } from "@/lib/retencao";

export interface DesempenhoPageResumo {
  desempenho: DesempenhoResumo;
  retencao: RetencaoResumo;
  questoesCount: number;
  topicosFoco: DesempenhoTopico[];
}
