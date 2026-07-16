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

const SIZE = 200;
const STROKE = 22;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;
const GAP = 6;
const CX = SIZE / 2;
const CY = SIZE / 2;

function polar(fracao: number, raio: number) {
  const rad = ((fracao * 360 - 90) * Math.PI) / 180;
  return {
    x: CX + raio * Math.cos(rad),
    y: CY + raio * Math.sin(rad),
  };
}

export function DesempenhoDonut({
  overview,
  periodoLabel,
  className,
}: DesempenhoDonutProps) {
  const { total, acertos, erros, taxaAcerto } = overview;
  const pctAcertos = total > 0 ? (acertos / total) * 100 : 0;
  const pctErros = total > 0 ? (erros / total) * 100 : 0;
  const hasData = total > 0;

  const temAmbos = acertos > 0 && erros > 0;
  const usable = temAmbos ? Math.max(C - GAP * 2, 0) : C;
  const lenAcertos = hasData ? (pctAcertos / 100) * usable : 0;
  const lenErros = hasData ? (pctErros / 100) * usable : 0;
  const gapOffset = temAmbos ? GAP : 0;

  const meioAcertos = pctAcertos / 200;
  const meioErros = (pctAcertos + pctErros / 2) / 100;
  const posAcertos = polar(meioAcertos, R);
  const posErros = polar(meioErros, R);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Visão geral</CardTitle>
        <CardDescription>{periodoLabel}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 pt-2">
        <div
          className="relative flex items-center justify-center p-3"
          role="img"
          aria-label={
            hasData
              ? `${total} questões resolvidas: ${acertos} acertos, ${erros} erros, ${taxaAcerto}% de acerto`
              : "Nenhuma questão resolvida no período"
          }
        >
          <div className="relative" style={{ width: SIZE, height: SIZE }}>
            <svg
              width={SIZE}
              height={SIZE}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="block"
              aria-hidden
            >
              <circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke="var(--muted)"
                strokeWidth={STROKE}
              />
              {hasData && lenAcertos > 0 && (
                <circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  fill="none"
                  stroke="var(--semaforo-verde)"
                  strokeWidth={STROKE}
                  strokeLinecap="butt"
                  strokeDasharray={`${lenAcertos} ${C - lenAcertos}`}
                  strokeDashoffset={0}
                  transform={`rotate(-90 ${CX} ${CY})`}
                />
              )}
              {hasData && lenErros > 0 && (
                <circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  fill="none"
                  stroke="var(--semaforo-vermelho)"
                  strokeWidth={STROKE}
                  strokeLinecap="butt"
                  strokeDasharray={`${lenErros} ${C - lenErros}`}
                  strokeDashoffset={-(lenAcertos + gapOffset)}
                  transform={`rotate(-90 ${CX} ${CY})`}
                />
              )}
            </svg>

            {hasData && acertos > 0 && pctAcertos >= 8 && (
              <span
                className="absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-semaforo-verde text-[11px] font-bold tabular-nums text-white ring-2 ring-card sm:size-8 sm:text-xs"
                style={{ left: posAcertos.x, top: posAcertos.y }}
                aria-hidden
              >
                {acertos.toLocaleString("pt-BR")}
              </span>
            )}
            {hasData && erros > 0 && pctErros >= 8 && (
              <span
                className="absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-semaforo-vermelho text-[11px] font-bold tabular-nums text-white ring-2 ring-card sm:size-8 sm:text-xs"
                style={{ left: posErros.x, top: posErros.y }}
                aria-hidden
              >
                {erros.toLocaleString("pt-BR")}
              </span>
            )}

            <div className="pointer-events-none absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-card text-center">
              {hasData ? (
                <>
                  <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    Acerto
                  </p>
                  <p className="mt-0.5 text-3xl font-bold tabular-nums leading-none tracking-tight text-semaforo-verde sm:text-4xl">
                    {taxaAcerto}%
                  </p>
                  <p className="mt-1.5 text-[11px] tabular-nums text-muted-foreground">
                    {total.toLocaleString("pt-BR")} questões
                  </p>
                </>
              ) : (
                <p className="max-w-[5.5rem] text-[11px] leading-tight text-muted-foreground">
                  Sem dados no período
                </p>
              )}
            </div>
          </div>
        </div>

        {hasData ? (
          <ul className="grid w-full grid-cols-2 gap-2">
            <li className="flex flex-col gap-1 rounded-xl border border-semaforo-verde/25 bg-semaforo-verde/5 px-3 py-2.5">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <span
                  className="size-2 rounded-full bg-semaforo-verde"
                  aria-hidden
                />
                Acertos
              </span>
              <span className="text-lg font-bold tabular-nums leading-none text-semaforo-verde">
                {pctAcertos.toFixed(2)}%
              </span>
            </li>
            <li className="flex flex-col gap-1 rounded-xl border border-semaforo-vermelho/25 bg-semaforo-vermelho/5 px-3 py-2.5">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <span
                  className="size-2 rounded-full bg-semaforo-vermelho"
                  aria-hidden
                />
                Erros
              </span>
              <span className="text-lg font-bold tabular-nums leading-none text-semaforo-vermelho">
                {pctErros.toFixed(2)}%
              </span>
            </li>
          </ul>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Resolva questões neste período para ver o gráfico.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
