import Link from "next/link";
import { DISCIPLINA_LABELS, SIMULADO_ESPELHO_DISTRIBUICAO, type Disciplina } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DisciplinaItemProps {
  disciplina: Disciplina;
}

export function DisciplinaItem({ disciplina }: DisciplinaItemProps) {
  const qtd = SIMULADO_ESPELHO_DISTRIBUICAO[disciplina];
  const isTransito = disciplina === "legislacao_transito";
  const isGeral = [
    "portugues",
    "informatica",
    "historia_cg_pb",
    "legislacao_etica_sp",
  ].includes(disciplina);

  return (
    <li>
      <Link
        href={`/estudo?disciplina=${disciplina}`}
        className={cn(
          "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm transition-colors",
          "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          isTransito
            ? "border-transito/30 bg-transito/5"
            : "border-border bg-card/50",
        )}
      >
        <span
          className={cn(
            "min-w-0 leading-snug",
            isTransito && "font-medium text-transito-foreground",
          )}
        >
          {DISCIPLINA_LABELS[disciplina]}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "tabular-nums",
              isTransito && "border-transito/40 text-transito-foreground",
            )}
          >
            {qtd}Q
          </Badge>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {isGeral ? "Geral" : "Espec."}
          </span>
        </div>
      </Link>
    </li>
  );
}
