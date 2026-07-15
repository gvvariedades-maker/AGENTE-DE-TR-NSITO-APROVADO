import { cn } from "@/lib/utils";
import type { ZonaMetrica } from "@/lib/semaforo";
import { formatPontos } from "@/lib/semaforo-format";
import { Badge } from "@/components/ui/badge";

const zonaDot = {
  verde: "bg-semaforo-verde",
  amarelo: "bg-semaforo-amarelo",
  vermelho: "bg-semaforo-vermelho",
  vazio: "bg-muted-foreground/40",
} as const;

const zonaBorder = {
  verde: "border-semaforo-verde/30 bg-semaforo-verde/5",
  amarelo: "border-semaforo-amarelo/30 bg-semaforo-amarelo/5",
  vermelho: "border-semaforo-vermelho/30 bg-semaforo-vermelho/5",
  vazio: "border-border bg-card",
} as const;

interface SemaforoCompactoProps {
  gerais: ZonaMetrica;
  especificos: ZonaMetrica;
  total: ZonaMetrica;
}

function Chip({ metrica }: { metrica: ZonaMetrica }) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-1 rounded-xl border px-3 py-2.5",
        zonaBorder[metrica.zona],
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={cn("size-2 shrink-0 rounded-full", zonaDot[metrica.zona])}
          aria-hidden
        />
        <span className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {metrica.label}
        </span>
      </div>
      <p className="text-lg font-bold tabular-nums leading-none">
        {formatPontos(metrica.pontos)}
      </p>
      <Badge
        variant={metrica.zona === "vermelho" ? "destructive" : "outline"}
        className="w-fit text-[10px]"
      >
        {metrica.statusLabel}
      </Badge>
    </div>
  );
}

export function SemaforoCompacto({
  gerais,
  especificos,
  total,
}: SemaforoCompactoProps) {
  return (
    <section
      aria-labelledby="semaforo-compacto-titulo"
      className="flex flex-col gap-2"
    >
      <h2
        id="semaforo-compacto-titulo"
        className="text-sm font-semibold text-muted-foreground"
      >
        Semáforo de aprovação
      </h2>
      <div className="flex gap-2">
        <Chip metrica={gerais} />
        <Chip metrica={especificos} />
        <Chip metrica={total} />
      </div>
    </section>
  );
}
