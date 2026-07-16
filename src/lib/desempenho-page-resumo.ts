import { getDesempenhoResumo, getDesempenhoTopicos } from "@/lib/desempenho";
import { getRetencaoResumo } from "@/lib/retencao";
import { getQuestoesCount } from "@/lib/questoes";
import { withTimeout } from "@/lib/with-timeout";
import { desempenhoFallback, retencaoFallback } from "@/lib/dashboard-resumo";
import type { DesempenhoPageResumo } from "@/types/desempenho-page-resumo";
import type { Disciplina } from "@/types";

const QUERY_MS = 8_000;

export async function loadDesempenhoPageResumo(
  userId: string | null | undefined,
  options: { since?: Date | null; disciplinaFoco?: Disciplina },
): Promise<DesempenhoPageResumo> {
  const { since, disciplinaFoco } = options;

  const desempenho = await withTimeout(
    getDesempenhoResumo(userId, { since }),
    QUERY_MS,
    desempenhoFallback(),
    "desempenho",
  );
  const retencao = await withTimeout(
    getRetencaoResumo(userId),
    QUERY_MS,
    retencaoFallback,
    "retencao",
  );
  const questoesCount = await withTimeout(
    getQuestoesCount(),
    QUERY_MS,
    0,
    "questoesCount",
  );
  const topicosFoco =
    disciplinaFoco && userId
      ? await withTimeout(
          getDesempenhoTopicos(userId, disciplinaFoco),
          QUERY_MS,
          [],
          "topicosFoco",
        )
      : [];

  return { desempenho, retencao, questoesCount, topicosFoco };
}
