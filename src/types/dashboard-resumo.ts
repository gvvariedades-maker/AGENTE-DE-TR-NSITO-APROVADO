import type { DesempenhoResumo } from "@/lib/desempenho";
import type { PlanoProvaResumo } from "@/lib/plano-prova";
import type { RetencaoResumo } from "@/lib/retencao";
import type { PiorTopico } from "@/lib/piores-topicos-shared";
import type { SemanaChegadaResumo } from "@/lib/semana-chegada";
import type { DominioResumo } from "@/lib/tutor/dominio-resumo";
import type { TutorCalibracao } from "@/lib/tutor/calibracao";
import type { PainelDominioEvidencias } from "@/lib/mastery/painel-dominio-evidencias";

export interface DashboardResumo {
  desempenho: DesempenhoResumo;
  retencao: RetencaoResumo;
  plano: PlanoProvaResumo;
  semana: SemanaChegadaResumo;
  dominio: DominioResumo;
  /** Domínio por skill (Fase 6) — separado do semáforo. */
  dominioEvidencias: PainelDominioEvidencias;
  calibracao: TutorCalibracao;
  atividadeHoje: { questoes: number; acertos: number };
  questoesCount: number;
  questoesReaisCount: number;
  pioresTopicos: PiorTopico[];
}
