import { cn } from "@/lib/utils";
import type { AtividadeDia } from "@/lib/retencao";

interface PainelSparklineProps {
  atividade: AtividadeDia[];
  className?: string;
}

const DIAS_LABEL = ["D", "S", "T", "Q", "Q", "S", "S"];

export function PainelSparkline({ atividade, className }: PainelSparklineProps) {
  const max = Math.max(1, ...atividade.map((a) => a.total));
  const totalSemana = atividade.reduce((s, a) => s + a.total, 0);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          7 dias
        </span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {totalSemana} {totalSemana === 1 ? "questão" : "questões"}
        </span>
      </div>
      <div
        className="flex h-10 items-end justify-between gap-1"
        role="img"
        aria-label={`Atividade nos últimos 7 dias: ${totalSemana} questões`}
      >
        {atividade.map((dia, i) => (
          <div
            key={dia.data}
            className="flex flex-1 flex-col items-center gap-0.5"
            title={`${dia.total} questões`}
          >
            <div
              className={cn(
                "w-full min-h-0.5 rounded-sm transition-colors",
                dia.total > 0 ? "bg-transito" : "bg-muted",
              )}
              style={{
                height: `${Math.max(2, (dia.total / max) * 32)}px`,
              }}
            />
            <span className="text-[9px] text-muted-foreground/70">
              {DIAS_LABEL[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
