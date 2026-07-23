import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  alternativeDiagnostics,
  misconceptions,
  questions,
} from "@/lib/db/schema";
import {
  diagnoseFromPassoAPassoPure,
  emptyDiagnostics,
  summaryFromMechanism,
  type AttemptDiagnostics,
} from "@/lib/diagnostics/diagnose-from-passo";

export type { AttemptDiagnostics };
export { diagnoseFromPassoAPassoPure } from "@/lib/diagnostics/diagnose-from-passo";

export type DiagnoseAttemptInput = {
  questionId: string;
  resposta: string;
  acertou: boolean;
  /** Se omitido e fallback necessário, busca `comentario_json` no banco. */
  passoAPasso?: string[] | null;
  gabarito?: string | null;
};

type FeedbackJson = {
  summary?: string;
  mechanism_label?: string;
  mistaken_belief?: string;
  correct_rule?: string;
};

function feedbackSummaryFromJson(json: unknown): string | null {
  if (!json || typeof json !== "object") return null;
  const fb = json as FeedbackJson;
  if (typeof fb.summary === "string" && fb.summary.trim()) return fb.summary.trim();
  return null;
}

async function loadPassoAPasso(
  questionId: string,
): Promise<{ passo: string[] | null; gabarito: string | null }> {
  const [row] = await db
    .select({
      comentarioJson: questions.comentarioJson,
      gabarito: questions.gabarito,
    })
    .from(questions)
    .where(eq(questions.id, questionId))
    .limit(1);

  if (!row) return { passo: null, gabarito: null };

  const raw = row.comentarioJson;
  if (!raw || typeof raw !== "object") {
    return { passo: null, gabarito: row.gabarito };
  }
  const passo = (raw as { passo_a_passo?: unknown }).passo_a_passo;
  return {
    passo: Array.isArray(passo)
      ? passo.filter((p): p is string => typeof p === "string")
      : null,
    gabarito: row.gabarito,
  };
}

/**
 * Diagnóstico da alternativa escolhida.
 * Preferência: linha em `alternative_diagnostics`; fallback: passo 2 do comentário.
 */
export async function diagnoseAttempt(
  input: DiagnoseAttemptInput,
): Promise<AttemptDiagnostics> {
  const letra = input.resposta.trim().toUpperCase();

  if (input.acertou) return emptyDiagnostics();

  const [row] = await db
    .select({
      errorType: alternativeDiagnostics.errorType,
      mechanismSlug: alternativeDiagnostics.mechanismSlug,
      feedbackJson: alternativeDiagnostics.feedbackJson,
      misconceptionCode: misconceptions.code,
      mistakenBelief: misconceptions.mistakenBelief,
      correctRule: misconceptions.correctRule,
    })
    .from(alternativeDiagnostics)
    .leftJoin(
      misconceptions,
      eq(alternativeDiagnostics.misconceptionId, misconceptions.id),
    )
    .where(
      and(
        eq(alternativeDiagnostics.questionId, input.questionId),
        eq(alternativeDiagnostics.alternative, letra),
      ),
    )
    .limit(1);

  if (row) {
    const fromJson = feedbackSummaryFromJson(row.feedbackJson);
    const summary =
      fromJson ??
      (row.mistakenBelief && row.correctRule
        ? `${row.mistakenBelief} → ${row.correctRule}`
        : row.mechanismSlug
          ? summaryFromMechanism(row.mechanismSlug, letra)
          : null);

    return {
      errorType: row.errorType,
      misconceptionCode: row.misconceptionCode,
      mechanismSlug: row.mechanismSlug,
      feedbackSummary: summary,
      source: "db",
    };
  }

  let passo = input.passoAPasso ?? null;
  if (!passo) {
    const loaded = await loadPassoAPasso(input.questionId);
    passo = loaded.passo;
  }

  if (!passo?.length) return emptyDiagnostics();

  return diagnoseFromPassoAPassoPure(letra, passo, false);
}
