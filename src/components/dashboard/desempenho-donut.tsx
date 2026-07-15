import { cn } from "@/lib/utils";
import type { DesempenhoOverview } from "@/lib/desempenho";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DesempenhoDonutProps {
  overview: DesempenhoOverview;
  periodoLabel: string;
  className?: string;
}

export function DesempenhoDonut({
  overview,
  periodoLabel,
  className,
}: DesempenhoDonutProps) {
  const { total, acertos, erros, taxaAcerto } = overview;
  const pctAcertos = total > 0 ? (acertos / total) * 100 : 0;
  const hasData = total > 0;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Visão geral</CardTitle>
        <CardDescription>{periodoLabel}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-5 pt-2">
        <div
          className="relative flex size-44 items-center justify-center rounded-full sm:size-48"
          style={{
            background: hasData
              ? `conic-gradient(
                  var(--semaforo-verde) 0% ${pctAcertos}%,
                  var(--semaforo-vermelho) ${pctAcertos}% 100%
                )`
              : "var(--muted)",
          }}
          role="img"
          aria-label={
            hasData
              ? `${total} questões resolvidas, ${taxaAcerto}% de acerto`
              : "Nenhuma questão resolvida no período"
          }
        >
          <div className="flex size-[70%] flex-col items-center justify-center rounded-full bg-card text-center shadow-sm ring-1 ring-border">
            <p className="text-2xl font-bold tabular-nums leading-none sm:text-3xl">
              {total.toLocaleString("pt-BR")}
            </p>
            <p className="mt-1 max-w-[6.5rem] text-[11px] leading-tight text-muted-foreground">
              Questões resolvidas
            </p>
          </div>
        </div>

        {hasData ? (
          <>
            <ul className="flex w-full flex-col gap-2 text-sm">
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full bg-semaforo-verde"
                    aria-hidden
                  />
                  Acertos
                </span>
                <span className="tabular-nums text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {((acertos / total) * 100).toFixed(2)}%
                  </span>{" "}
                  {acertos.toLocaleString("pt-BR")}
                </span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full bg-semaforo-vermelho"
                    aria-hidden
                  />
                  Erros
                </span>
                <span className="tabular-nums text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {((erros / total) * 100).toFixed(2)}%
                  </span>{" "}
                  {erros.toLocaleString("pt-BR")}
                </span>
              </li>
            </ul>

            <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              {taxaAcerto}% de acerto
            </div>
          </>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Resolva questões neste período para ver o gráfico.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
