import Link from "next/link";
import { Brain, AlertTriangle, ArrowRightLeft, Clock } from "lucide-react";
import type { PainelDominioEvidencias } from "@/lib/mastery/painel-dominio-evidencias";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PainelDominioEvidenciasProps {
  painel: PainelDominioEvidencias;
  className?: string;
}

function MetricChip({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/80 px-3 py-2">
      <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums leading-none">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

/**
 * Domínio conceitual comprovado — separado do semáforo (só simulados).
 */
export function PainelDominioEvidenciasCard({
  painel,
  className,
}: PainelDominioEvidenciasProps) {
  return (
    <Card
      id="dominio-evidencias"
      className={cn(
        "scroll-mt-20 overflow-hidden border-border border-l-4 border-l-muted-foreground/40",
        className,
      )}
    >
      <CardHeader className="border-b border-border pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground"
              aria-hidden
            >
              <Brain className="size-4" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-semibold">
                Domínio comprovado
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs normal-case">
                Evidências de skill (recall + transferência + calibração) —
                independente do semáforo de aprovação.
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0 font-normal">
            ≠ semáforo
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 pt-4">
        {!painel.hasData ? (
          <p className="text-sm text-muted-foreground">
            Ainda sem evidências de skill. Responda questões com mastery
            instrumentado — o semáforo só muda com simulados entregues.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              <MetricChip
                label="Dominadas"
                value={painel.masteredCount}
                hint={`de ${painel.totalSkills} skills`}
              />
              <MetricChip
                label="Retenção atrasada"
                value={painel.delayedRetentionCount}
                hint="≥1 delayed correct"
              />
              <MetricChip
                label="Transferência"
                value={painel.transferReadyCount}
                hint="transfer ≥ 50%"
              />
              <MetricChip
                label="Alta confiança"
                value={painel.highConfErrorSkills}
                hint="skills com erro"
              />
              <MetricChip
                label="Em risco"
                value={painel.atRiskCount}
              />
              <MetricChip
                label="Sem evidência"
                value={painel.withoutEvidenceCount}
              />
            </div>

            {painel.topAtRisk.length > 0 && (
              <section aria-labelledby="skills-risco-titulo">
                <div className="mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5 text-muted-foreground" />
                  <h3
                    id="skills-risco-titulo"
                    className="text-sm font-medium"
                  >
                    Skills em risco / aprendendo
                  </h3>
                </div>
                <ul className="overflow-hidden rounded-lg border border-border">
                  {painel.topAtRisk.map((s, i) => (
                    <li
                      key={s.skillId}
                      className={cn(
                        "flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm",
                        i > 0 && "border-t border-border",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-mono text-xs">
                          {s.skillCode}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {s.skillName}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {s.stateLabel}
                        </Badge>
                        <span className="tabular-nums text-xs text-muted-foreground">
                          {Math.round(s.masteryProbability * 100)}%
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {painel.memorizedWithoutMastery.length > 0 && (
              <section aria-labelledby="memo-sem-dominio-titulo">
                <div className="mb-2 flex items-center gap-1.5">
                  <Clock className="size-3.5 text-muted-foreground" />
                  <h3
                    id="memo-sem-dominio-titulo"
                    className="text-sm font-medium"
                  >
                    Memorizadas sem domínio
                  </h3>
                </div>
                <p className="mb-2 text-[11px] text-muted-foreground">
                  Repetições FSRS altas com mastery baixa — risco de
                  reconhecimento sem transferência.
                </p>
                <ul className="overflow-hidden rounded-lg border border-dashed border-border">
                  {painel.memorizedWithoutMastery.slice(0, 6).map((m, i) => (
                    <li
                      key={m.questionId}
                      className={cn(
                        "flex items-center justify-between gap-2 px-3 py-1.5 text-xs",
                        i > 0 && "border-t border-border",
                      )}
                    >
                      <span className="truncate font-mono text-muted-foreground">
                        {m.skillCode ?? m.questionId.slice(0, 8)}
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {m.reps} reps
                        {m.masteryProbability !== null &&
                          ` · ${Math.round(m.masteryProbability * 100)}%`}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/estudo?modo=auto"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "min-h-9 gap-1.5",
                )}
              >
                <ArrowRightLeft className="size-3.5" />
                Treinar lacunas
              </Link>
              <p className="text-[11px] text-muted-foreground">
                Semáforo de aprovação continua só com simulados entregues.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
