import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  PERIODOS_DESEMPENHO,
  type PeriodoDesempenho,
} from "@/lib/desempenho-periodo";

interface DesempenhoPeriodoFilterProps {
  periodo: PeriodoDesempenho;
  disciplina?: string;
  visao?: string;
}

export function DesempenhoPeriodoFilter({
  periodo,
  disciplina,
  visao,
}: DesempenhoPeriodoFilterProps) {
  return (
    <nav
      aria-label="Filtrar período"
      className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-muted/40 p-1.5"
    >
      {PERIODOS_DESEMPENHO.map((p) => {
        const ativo = p.value === periodo;
        const params = new URLSearchParams();
        if (p.value !== "inicio") params.set("periodo", p.value);
        if (disciplina) params.set("disciplina", disciplina);
        if (visao && visao !== "geral") params.set("visao", visao);
        const qs = params.toString();
        const href = qs ? `/desempenho?${qs}` : "/desempenho";

        return (
          <Link
            key={p.value}
            href={href}
            className={cn(
              buttonVariants({
                variant: ativo ? "default" : "ghost",
                size: "sm",
              }),
              "min-h-9 rounded-lg px-3 text-xs sm:text-sm",
              !ativo && "text-muted-foreground",
            )}
            aria-current={ativo ? "true" : undefined}
          >
            {p.label}
          </Link>
        );
      })}
    </nav>
  );
}
