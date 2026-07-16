import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type VisaoDesempenho = "geral" | "simulados";

export const VISOES_DESEMPENHO: { value: VisaoDesempenho; label: string }[] = [
  { value: "geral", label: "Geral" },
  { value: "simulados", label: "Simulados" },
];

export function parseVisaoDesempenho(raw?: string): VisaoDesempenho {
  return raw === "simulados" ? "simulados" : "geral";
}

interface DesempenhoVisaoFilterProps {
  visao: VisaoDesempenho;
  periodo?: string;
  disciplina?: string;
}

export function DesempenhoVisaoFilter({
  visao,
  periodo,
  disciplina,
}: DesempenhoVisaoFilterProps) {
  return (
    <nav
      aria-label="Tipo de desempenho"
      className="flex gap-1 rounded-xl border border-border bg-card p-1"
    >
      {VISOES_DESEMPENHO.map((v) => {
        const ativo = v.value === visao;
        const params = new URLSearchParams();
        if (v.value !== "geral") params.set("visao", v.value);
        if (periodo && periodo !== "inicio") params.set("periodo", periodo);
        if (disciplina) params.set("disciplina", disciplina);
        const qs = params.toString();
        const href = qs ? `/desempenho?${qs}` : "/desempenho";

        return (
          <Link
            key={v.value}
            href={href}
            className={cn(
              buttonVariants({
                variant: ativo ? "default" : "ghost",
                size: "sm",
              }),
              "min-h-9 flex-1 rounded-lg px-4 text-sm sm:flex-none",
              !ativo && "text-muted-foreground",
            )}
            aria-current={ativo ? "true" : undefined}
          >
            {v.label}
          </Link>
        );
      })}
    </nav>
  );
}
