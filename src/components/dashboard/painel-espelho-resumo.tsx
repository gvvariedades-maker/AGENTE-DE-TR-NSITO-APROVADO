import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { MIN_PONTOS_TOTAL } from "@/lib/edital-constants";
import type { EspelhoResumo } from "@/lib/semaforo";

interface PainelEspelhoResumoProps {
  espelho: EspelhoResumo;
  className?: string;
}

function corNota(nota: number) {
  if (nota >= MIN_PONTOS_TOTAL) return "text-semaforo-verde";
  if (nota >= MIN_PONTOS_TOTAL * 0.7) return "text-semaforo-amarelo";
  return "text-semaforo-vermelho";
}

function ChipNota({
  label,
  nota,
  destaque,
}: {
  label: string;
  nota: number;
  destaque?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col rounded-lg border px-3 py-2.5",
        destaque
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-muted/30",
      )}
    >
      <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <span
        className={cn(
          "mt-0.5 text-2xl font-bold tabular-nums leading-none",
          corNota(nota),
        )}
      >
        {nota.toFixed(1)}
      </span>
      <span className="mt-0.5 text-[10px] text-muted-foreground">/ 100</span>
    </div>
  );
}

export function PainelEspelhoResumo({
  espelho,
  className,
}: PainelEspelhoResumoProps) {
  const { quantidade, ultimo, media, melhor, janela } = espelho;

  if (quantidade === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-5 text-center",
          className,
        )}
      >
        <p className="text-sm text-muted-foreground">
          Nenhum simulado entregue ainda. O semáforo usa só o simulado 60Q — treino
          não entra na nota.
        </p>
        <Link href="/simulado" className={cn(buttonVariants({ size: "sm" }))}>
          Fazer 1º simulado
        </Link>
      </div>
    );
  }

  const labelMedia =
    quantidade >= janela
      ? `Média (${janela})`
      : `Média (${quantidade})`;
  const labelMelhor =
    quantidade >= janela
      ? `Melhor (${janela})`
      : `Melhor (${quantidade})`;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex gap-2">
        {ultimo && (
          <ChipNota label="Último" nota={ultimo.nota} destaque />
        )}
        {media !== null && <ChipNota label={labelMedia} nota={media} />}
        {melhor !== null && <ChipNota label={labelMelhor} nota={melhor} />}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {quantidade} simulado{quantidade > 1 ? "s" : ""} no histórico · barras
        abaixo = último simulado
      </p>
    </div>
  );
}
