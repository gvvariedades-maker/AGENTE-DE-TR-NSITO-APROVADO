import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SimuladoHistoricoItem } from "@/lib/desempenho-simulados";

interface SimuladosHistoricoListProps {
  historico: SimuladoHistoricoItem[];
  melhorNota: number | null;
  className?: string;
}

function formatarData(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatarDuracao(min: number | null) {
  if (min === null || min <= 0) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0) return `${h}h ${m}min`;
  return `${m} min`;
}

export function SimuladosHistoricoList({
  historico,
  melhorNota,
  className,
}: SimuladosHistoricoListProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Histórico de simulados</CardTitle>
            <CardDescription>
              Espelhos entregues no período
              {melhorNota !== null && (
                <> · melhor nota: {melhorNota} pts</>
              )}
            </CardDescription>
          </div>
          <Link
            href="/simulado"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Novo simulado
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {historico.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum simulado entregue neste período.{" "}
            <Link href="/simulado" className="text-primary underline-offset-4 hover:underline">
              Fazer espelho 60Q
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {historico.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium tabular-nums">
                    {s.notaTotal} pts
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatarData(s.createdAt)} · {formatarDuracao(s.duracaoMin)}
                  </p>
                </div>
                <Badge
                  variant={s.aprovado ? "default" : "destructive"}
                  className={cn(
                    s.aprovado &&
                      "border-semaforo-verde/40 bg-semaforo-verde text-white",
                  )}
                >
                  {s.aprovado ? "Aprovado" : "Eliminado"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
