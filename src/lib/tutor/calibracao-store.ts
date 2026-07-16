import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userTutorCalib } from "@/lib/db/schema";
import type { Disciplina } from "@/types";
import {
  CALIBRACAO_PADRAO,
  recalcularCalibracao,
  type RecalcularCalibracaoInput,
  type TutorCalibracao,
} from "@/lib/tutor/calibracao";

function rowParaCalibracao(row: {
  capacidadeQuestoes: number;
  biasRevisao: number;
  boostDisciplinasJson: unknown;
  updatedAt: Date;
}): TutorCalibracao {
  const boost =
    typeof row.boostDisciplinasJson === "object" &&
    row.boostDisciplinasJson !== null
      ? (row.boostDisciplinasJson as Partial<Record<Disciplina, number>>)
      : {};
  return {
    capacidadeQuestoes: row.capacidadeQuestoes,
    biasRevisao: row.biasRevisao,
    boostDisciplinas: boost,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getTutorCalibracao(
  userId?: string | null,
): Promise<TutorCalibracao> {
  if (!userId) return { ...CALIBRACAO_PADRAO };

  try {
    const rows = await db
      .select()
      .from(userTutorCalib)
      .where(eq(userTutorCalib.userId, userId))
      .limit(1);

    if (rows.length === 0) return { ...CALIBRACAO_PADRAO };
    return rowParaCalibracao(rows[0]);
  } catch {
    return { ...CALIBRACAO_PADRAO };
  }
}

export async function salvarTutorCalibracao(
  userId: string,
  calib: TutorCalibracao,
): Promise<void> {
  const existing = await db
    .select({ id: userTutorCalib.id })
    .from(userTutorCalib)
    .where(eq(userTutorCalib.userId, userId))
    .limit(1);

  const payload = {
    capacidadeQuestoes: calib.capacidadeQuestoes,
    biasRevisao: calib.biasRevisao,
    boostDisciplinasJson: calib.boostDisciplinas,
    updatedAt: new Date(),
  };

  if (existing.length > 0) {
    await db
      .update(userTutorCalib)
      .set(payload)
      .where(eq(userTutorCalib.userId, userId));
  } else {
    await db.insert(userTutorCalib).values({
      userId,
      ...payload,
    });
  }
}

export async function atualizarCalibracaoUsuario(
  userId: string,
  input: Omit<RecalcularCalibracaoInput, "atual"> & {
    atual?: TutorCalibracao;
  },
): Promise<TutorCalibracao> {
  const atual = input.atual ?? (await getTutorCalibracao(userId));
  const nova = recalcularCalibracao({ ...input, atual });
  await salvarTutorCalibracao(userId, nova);
  return nova;
}
