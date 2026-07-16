import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { PainelSparkline } from "@/components/dashboard/painel-sparkline";
import type { DesempenhoResumo } from "@/lib/desempenho";

interface PainelHeroProps {
  desempenho: DesempenhoResumo;
  atividadeHoje: { questoes: number; acertos: number };
}

export function PainelHero({ desempenho, atividadeHoje }: PainelHeroProps) {
  const totalSemana = desempenho.atividade.reduce((s, a) => s + a.total, 0);
  const diasAtivos = desempenho.atividade.filter((a) => a.total > 0).length;
  const taxaHoje =
    atividadeHoje.questoes > 0
      ? Math.round((atividadeHoje.acertos / atividadeHoje.questoes) * 100)
      : null;

  return (
    <section aria-labelledby="treino-semana-titulo">
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="flex flex-col gap-4 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2
                id="treino-semana-titulo"
                className="text-sm font-semibold text-foreground"
              >
                Treino esta semana
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Questões avulsas — volume do estudo, não é simulado.
              </p>
            </div>
            {desempenho.hasData && (
              <div className="text-right">
                <p className="text-2xl font-bold tabular-nums leading-none text-foreground">
                  {totalSemana}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {totalSemana === 1 ? "questão" : "questões"}
                  {diasAtivos > 0 && (
                    <> · {diasAtivos} {diasAtivos === 1 ? "dia" : "dias"}</>
                  )}
                </p>
              </div>
            )}
          </div>

          {desempenho.hasData ? (
            <>
              <PainelSparkline atividade={desempenho.atividade} />

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                <p className="text-sm text-muted-foreground">
                  Hoje:{" "}
                  <span className="font-semibold text-foreground">
                    {atividadeHoje.questoes}
                  </span>{" "}
                  {atividadeHoje.questoes === 1 ? "questão" : "questões"}
                  {taxaHoje !== null && (
                    <>
                      {" "}
                      ·{" "}
                      <span className="font-semibold text-foreground">
                        {taxaHoje}%
                      </span>{" "}
                      de acerto
                    </>
                  )}
                </p>
                <Link
                  href="/desempenho"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "shrink-0",
                  )}
                >
                  Ver evolução
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-3">
              <p className="text-sm text-muted-foreground">
                O gráfico aparece depois das primeiras questões de treino.
              </p>
              <Link
                href="/desempenho"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Ver evolução
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
