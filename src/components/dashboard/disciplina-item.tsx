import Link from "next/link";
import {
  DISCIPLINA_LABELS,
  SIMULADO_ESPELHO_DISTRIBUICAO,
  type Disciplina,
} from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { DesempenhoDisciplina } from "@/lib/desempenho";
import type { ZonaSemaforo } from "@/lib/edital-constants";

interface DisciplinaItemProps {
  disciplina: Disciplina;
  desempenho?: DesempenhoDisciplina;
}

const zonaDot: Record<ZonaSemaforo, string> = {
  verde: "bg-semaforo-verde",
  amarelo: "bg-semaforo-amarelo",
  vermelho: "bg-semaforo-vermelho",
  vazio: "bg-muted",
};

export function DisciplinaItem({ disciplina, desempenho }: DisciplinaItemProps) {
  const qtd = SIMULADO_ESPELHO_DISTRIBUICAO[disciplina];
  const isTransito = disciplina === "legislacao_transito";
  const isGeral = [
    "portugues",
    "informatica",
    "historia_cg_pb",
    "legislacao_etica_sp",
  ].includes(disciplina);

  const zona = desempenho?.zona ?? "vazio";
  const temDados = (desempenho?.tentativas ?? 0) > 0;
  const pontosLabel =
    temDados || (desempenho?.pontos ?? 0) > 0
      ? desempenho!.pontos.toFixed(1)
      : null;

  return (
    <li>
      <Link
        href={`/estudo/catalogo?disciplina=${disciplina}`}
        className={cn(
          "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm transition-colors",
          "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          isTransito
            ? "border-transito/30 bg-transito/5"
            : "border-border bg-card/50",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn("size-2 shrink-0 rounded-full", zonaDot[zona])}
            aria-hidden
          />
          <span
            className={cn(
              "min-w-0 leading-snug",
              isTransito && "font-medium text-transito-foreground",
            )}
          >
            {DISCIPLINA_LABELS[disciplina]}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {pontosLabel !== null && (
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {pontosLabel} pt
            </span>
          )}
          {(desempenho?.topicosTotal ?? 0) > 0 && (
            <Badge variant="secondary" className="tabular-nums text-xs">
              {desempenho!.coberturaPct}%
            </Badge>
          )}
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
