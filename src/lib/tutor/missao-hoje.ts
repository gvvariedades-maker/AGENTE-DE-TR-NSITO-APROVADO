import { getDesempenhoResumo, getProgressoMissaoHoje } from "@/lib/desempenho";
import { getPlanoProvaResumo } from "@/lib/plano-prova";
import { getPioresTopicos } from "@/lib/piores-topicos";
import {
  montarSemanaChegada,
  type MixDia,
  type MissaoDia,
} from "@/lib/semana-chegada";
import { getTutorCalibracao } from "@/lib/tutor/calibracao-store";
import { getDominioResumo } from "@/lib/tutor/dominio-resumo";
import { mixParaSlots } from "@/lib/tutor/politica";
import type { SlotsSessaoAuto } from "@/lib/plano-prova-calc";
import type { Disciplina } from "@/types";

export interface MissaoHojeContext {
  missao: MissaoDia;
  slots: SlotsSessaoAuto;
  disciplinaFoco?: Disciplina;
  calibracao: Awaited<ReturnType<typeof getTutorCalibracao>>;
  topicosPrioritarios: string[];
}

export async function carregarMissaoHoje(
  userId: string,
): Promise<MissaoHojeContext | null> {
  const [dominio, calibracao, desempenho, progressoMissao, pioresTopicos] =
    await Promise.all([
      getDominioResumo(userId),
      getTutorCalibracao(userId),
      getDesempenhoResumo(userId),
      getProgressoMissaoHoje(userId),
      getPioresTopicos(userId),
    ]);

  const plano = await getPlanoProvaResumo(userId, dominio);
  const semana = montarSemanaChegada({
    plano,
    atividadeHoje: { questoes: progressoMissao.questoes },
    disciplinasEmRisco: desempenho.semaforo.disciplinasEmRisco,
    disciplinas: desempenho.disciplinas.map((d) => ({
      disciplina: d.disciplina,
      coberturaPct: d.coberturaPct,
    })),
    espelho: desempenho.semaforo.espelho,
    pioresTopicos,
    calibracao,
  });

  const missao = semana.missoes[0];
  if (!missao || missao.tipo === "espelho" || missao.tipo === "folga") {
    return null;
  }

  const topicosPrioritarios = dominio.topicos
    .filter((t) => t.nivel === "aprendendo" || t.nivel === "formando")
    .map((t) => t.slug);

  return {
    missao,
    slots: mixParaSlots(missao.mix),
    disciplinaFoco: missao.disciplinaFoco,
    calibracao,
    topicosPrioritarios,
  };
}

export function slotsFromMix(mix: MixDia): SlotsSessaoAuto {
  return mixParaSlots(mix);
}
