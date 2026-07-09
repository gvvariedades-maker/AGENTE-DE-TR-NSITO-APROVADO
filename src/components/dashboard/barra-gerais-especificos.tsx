import { cn } from "@/lib/utils";
import type { SemaforoData } from "@/lib/semaforo";
import { MAX_PONTOS_ESPECIFICOS, MAX_PONTOS_GERAIS } from "@/lib/edital-constants";

interface BarraGeraisEspecificosProps {
  semaforo: SemaforoData;
  className?: string;
}

const zonaCor = {
  verde: "bg-semaforo-verde",
  amarelo: "bg-semaforo-amarelo",
  vermelho: "bg-semaforo-vermelho",
  vazio: "bg-muted",
} as const;

export function BarraGeraisEspecificos({
  semaforo,
  className,
}: BarraGeraisEspecificosProps) {
  const gerais = semaforo.gerais.pontos ?? 0;
  const especificos = semaforo.especificos.pontos ?? 0;
  const pctGerais = Math.min(100, (gerais / MAX_PONTOS_GERAIS) * 100);
  const pctEspecificos = Math.min(
    100,
    (especificos / MAX_PONTOS_ESPECIFICOS) * 100,
  );

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between text-xs">
          <span className="text-muted-foreground">Gerais</span>
          <span className="font-medium tabular-nums">
            {gerais.toFixed(1)}
            <span className="text-muted-foreground">
              /{MAX_PONTOS_GERAIS.toFixed(0)}
            </span>
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              zonaCor[semaforo.gerais.zona],
            )}
            style={{ width: `${pctGerais}%` }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between text-xs">
          <span className="text-muted-foreground">Específicos</span>
          <span className="font-medium tabular-nums">
            {especificos.toFixed(1)}
            <span className="text-muted-foreground">
              /{MAX_PONTOS_ESPECIFICOS.toFixed(0)}
            </span>
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              zonaCor[semaforo.especificos.zona],
            )}
            style={{ width: `${pctEspecificos}%` }}
          />
        </div>
      </div>
    </div>
  );
}
