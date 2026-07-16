import type { DesempenhoResumo, DesempenhoTopico } from "@/lib/desempenho";
import type { DesempenhoSimuladosResumo } from "@/lib/desempenho-simulados";
import type { RetencaoResumo } from "@/lib/retencao";

export interface DesempenhoPageResumo {
  desempenho: DesempenhoResumo;
  simulados: DesempenhoSimuladosResumo;
  retencao: RetencaoResumo;
  questoesCount: number;
  topicosFoco: DesempenhoTopico[];
}
