import type { UserMasteryDebugSummary } from "@/lib/mastery";
import { Badge } from "@/components/ui/badge";

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

interface MasteryDebugPanelProps {
  summary: UserMasteryDebugSummary;
}

/** Painel interno: scores por skill (Fase 3). Abrir com ?debug=mastery. */
export function MasteryDebugPanel({ summary }: MasteryDebugPanelProps) {
  return (
    <details className="group rounded-xl border border-dashed border-border bg-muted/30">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-2">
          <span className="flex flex-wrap items-center gap-2">
            Mastery debug
            <Badge variant="outline" className="font-normal">
              {summary.total} skill{summary.total === 1 ? "" : "s"}
            </Badge>
          </span>
          <span className="text-xs font-normal text-muted-foreground group-open:hidden">
            ver
          </span>
          <span className="hidden text-xs font-normal text-muted-foreground group-open:inline">
            ocultar
          </span>
        </span>
      </summary>
      <div className="space-y-3 border-t border-border px-4 py-3">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>mastered: {summary.byState.mastered}</span>
          <span>consolidating: {summary.byState.consolidating}</span>
          <span>learning: {summary.byState.learning}</span>
          <span>at_risk: {summary.byState.at_risk}</span>
          <span>unseen: {summary.byState.unseen}</span>
        </div>

        {summary.rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma evidência de skill ainda. Responda questões com
            question_skills mapeadas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-1.5 pr-2 font-medium">Skill</th>
                  <th className="py-1.5 pr-2 font-medium">Estado</th>
                  <th className="py-1.5 pr-2 font-medium tabular-nums">R</th>
                  <th className="py-1.5 pr-2 font-medium tabular-nums">T</th>
                  <th className="py-1.5 pr-2 font-medium tabular-nums">C</th>
                  <th className="py-1.5 pr-2 font-medium tabular-nums">P</th>
                  <th className="py-1.5 font-medium tabular-nums">N/D/H</th>
                </tr>
              </thead>
              <tbody>
                {summary.rows.map((row) => (
                  <tr
                    key={row.skillId}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="max-w-[14rem] truncate py-1.5 pr-2 font-mono">
                      {row.skillCode}
                    </td>
                    <td className="py-1.5 pr-2">{row.stateLabel}</td>
                    <td className="py-1.5 pr-2 tabular-nums">
                      {pct(row.recallScore)}
                    </td>
                    <td className="py-1.5 pr-2 tabular-nums">
                      {pct(row.transferScore)}
                    </td>
                    <td className="py-1.5 pr-2 tabular-nums">
                      {pct(row.calibrationScore)}
                    </td>
                    <td className="py-1.5 pr-2 tabular-nums font-medium">
                      {pct(row.masteryProbability)}
                    </td>
                    <td className="py-1.5 tabular-nums text-muted-foreground">
                      {row.novelCorrectCount}/{row.delayedCorrectCount}/
                      {row.highConfidenceErrorCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-[11px] text-muted-foreground">
              R=recall · T=transfer · C=calibração · P=prob. domínio ·
              N/D/H=novel/delayed/high-conf-error
            </p>
          </div>
        )}
      </div>
    </details>
  );
}
