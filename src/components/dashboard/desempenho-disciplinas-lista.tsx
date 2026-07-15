import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DesempenhoDisciplina } from "@/lib/desempenho";
import type { PeriodoDesempenho } from "@/lib/desempenho-periodo";

interface DesempenhoDisciplinasListaProps {
  disciplinas: DesempenhoDisciplina[];
  periodo: PeriodoDesempenho;
  className?: string;
}

function ordenarParaLista(disciplinas: DesempenhoDisciplina[]) {
  const ctb = disciplinas.find((d) => d.disciplina === "legislacao_transito");
  const demais = disciplinas
    .filter((d) => d.disciplina !== "legislacao_transito")
    .sort((a, b) => {
      if (a.zona === "vermelho" && b.zona !== "vermelho") return -1;
      if (b.zona === "vermelho" && a.zona !== "vermelho") return 1;
      if (a.tentativas === 0 && b.tentativas > 0) return 1;
      if (b.tentativas === 0 && a.tentativas > 0) return -1;
      return a.taxaAcerto - b.taxaAcerto;
    });
  return ctb ? [ctb, ...demais] : demais;
}

function piorParaTreinar(disciplinas: DesempenhoDisciplina[]) {
  const comDados = disciplinas.filter((d) => d.tentativas > 0);
  if (comDados.length === 0) {
    return disciplinas.find((d) => d.disciplina === "legislacao_transito");
  }
  return [...comDados].sort((a, b) => {
    if (a.zona === "vermelho" && b.zona !== "vermelho") return -1;
    if (b.zona === "vermelho" && a.zona !== "vermelho") return 1;
    return a.taxaAcerto - b.taxaAcerto;
  })[0];
}

const zonaBar = {
  verde: "[&_[data-slot=progress-indicator]]:bg-semaforo-verde",
  amarelo: "[&_[data-slot=progress-indicator]]:bg-semaforo-amarelo",
  vermelho: "[&_[data-slot=progress-indicator]]:bg-semaforo-vermelho",
  vazio: "",
} as const;

export function DesempenhoDisciplinasLista({
  disciplinas,
  periodo,
  className,
}: DesempenhoDisciplinasListaProps) {
  const lista = ordenarParaLista(disciplinas);
  const pior = piorParaTreinar(disciplinas);
  const periodoQs = periodo !== "inicio" ? `&periodo=${periodo}` : "";

  return (
    <Card className={cn("flex flex-col overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Desempenho por disciplinas</CardTitle>
        <CardDescription>
          CTB em destaque · toque para ver tópicos
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-0 px-0">
        <ul className="divide-y divide-border">
          {lista.map((d) => {
            const isCtb = d.disciplina === "legislacao_transito";
            return (
              <li key={d.disciplina}>
                <Link
                  href={`/desempenho?disciplina=${d.disciplina}${periodoQs}`}
                  className={cn(
                    "flex flex-col gap-2 px-6 py-3 transition-colors hover:bg-muted/50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    isCtb && "bg-transito/5",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "min-w-0 truncate text-sm font-medium",
                        isCtb && "text-transito-foreground",
                      )}
                    >
                      {d.label}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <span className="text-sm font-semibold tabular-nums">
                        {d.tentativas > 0 ? `${d.taxaAcerto}%` : "—"}
                      </span>
                      <ChevronRight
                        className="size-4 text-muted-foreground"
                        aria-hidden
                      />
                    </span>
                  </div>
                  <Progress
                    value={d.tentativas > 0 ? d.taxaAcerto : 0}
                    aria-label={`Acerto em ${d.label}`}
                    className={cn("w-full", zonaBar[d.zona])}
                  />
                  <p className="text-[11px] text-muted-foreground tabular-nums">
                    {d.tentativas > 0
                      ? `${d.acertos}/${d.tentativas} · ${d.pontos.toFixed(1)} pts proj.`
                      : "Sem tentativas no período"}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
      {pior && (
        <CardFooter className="border-t border-border pt-4">
          <Link
            href={
              pior.zona === "vermelho"
                ? "/estudo?modo=anti_zerar"
                : `/estudo?disciplina=${pior.disciplina}`
            }
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full min-h-11",
            )}
          >
            Treinar {pior.label}
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
