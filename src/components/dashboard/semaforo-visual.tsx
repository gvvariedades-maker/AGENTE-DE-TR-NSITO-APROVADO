import { cn } from "@/lib/utils";
import type { ZonaSemaforo } from "@/lib/edital-constants";

const luzAtiva: Record<ZonaSemaforo, "verde" | "amarelo" | "vermelho" | null> = {
  verde: "verde",
  amarelo: "amarelo",
  vermelho: "vermelho",
  vazio: null,
};

interface SemaforoVisualProps {
  zona: ZonaSemaforo;
  size?: "sm" | "lg";
  label?: string;
  className?: string;
}

export function SemaforoVisual({
  zona,
  size = "sm",
  label,
  className,
}: SemaforoVisualProps) {
  const ativa = luzAtiva[zona];

  const housing =
    size === "lg"
      ? "gap-2.5 rounded-2xl px-3.5 py-4"
      : "gap-1.5 rounded-xl px-2.5 py-3";

  const luz =
    size === "lg" ? "size-7" : "size-4";

  return (
    <div
      className={cn("flex flex-col items-center gap-2", className)}
      role="img"
      aria-label={
        label
          ? `${label}: ${zona === "vazio" ? "sem dados" : zona}`
          : `Semáforo ${zona === "vazio" ? "inativo" : zona}`
      }
    >
      <div
        className={cn(
          "flex flex-col items-center bg-foreground/10 ring-1 ring-border/60",
          housing,
        )}
      >
        <span
          className={cn(
            "rounded-full bg-semaforo-verde/25 ring-1 ring-semaforo-verde/40",
            luz,
            ativa === "verde" && "bg-semaforo-verde shadow-[0_0_12px_var(--semaforo-verde)]",
          )}
        />
        <span
          className={cn(
            "rounded-full bg-semaforo-amarelo/25 ring-1 ring-semaforo-amarelo/40",
            luz,
            ativa === "amarelo" &&
              "bg-semaforo-amarelo shadow-[0_0_12px_var(--semaforo-amarelo)]",
          )}
        />
        <span
          className={cn(
            "rounded-full bg-semaforo-vermelho/25 ring-1 ring-semaforo-vermelho/40",
            luz,
            ativa === "vermelho" &&
              "bg-semaforo-vermelho shadow-[0_0_12px_var(--semaforo-vermelho)]",
          )}
        />
      </div>
      {label && (
        <span className="text-center text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
      )}
    </div>
  );
}
