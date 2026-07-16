import { cn } from "@/lib/utils";
import type { AtividadeDia } from "@/lib/retencao";

interface PainelSparklineProps {
  atividade: AtividadeDia[];
  className?: string;
}

const DIAS_LABEL = ["D", "S", "T", "Q", "Q", "S", "S"];

export function PainelSparkline({ atividade, className }: PainelSparklineProps) {
  const max = Math.max(1, ...atividade.map((a) => a.total));

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        className="flex h-12 items-end justify-between gap-1.5"
        role="img"
        aria-label="Questões de treino nos últimos 7 dias"
      >
        {atividade.map((dia, i) => (
          <div
            key={dia.data}
            className="flex flex-1 flex-col items-center gap-1"
            title={`${DIAS_LABEL[i]}: ${dia.total} questões`}
          >
            <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
              {dia.total > 0 ? dia.total : ""}
            </span>
            <div
              className={cn(
                "w-full min-h-1 rounded-sm transition-colors",
                dia.total > 0 ? "bg-transito" : "bg-muted/80",
              )}
              style={{
                height: `${Math.max(4, (dia.total / max) * 36)}px`,
              }}
            />
            <span className="text-[10px] text-muted-foreground">
              {DIAS_LABEL[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
