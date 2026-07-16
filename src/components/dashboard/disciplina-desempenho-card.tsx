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
import { Progress } from "@/components/ui/progress";
import { SemaforoVisual } from "@/components/dashboard/semaforo-visual";
import type { DesempenhoDisciplina } from "@/lib/desempenho";
import { labelModoSessao } from "@/lib/motor-ata-shared";
import { labelTopicoEdital } from "@/lib/edital-topicos";
import type { SessaoEstudoResumo } from "@/lib/desempenho";

const zonaBorder = {
  verde: "border-semaforo-verde/30",
  amarelo: "border-semaforo-amarelo/30",
  vermelho: "border-semaforo-vermelho/30",
  vazio: "border-border",
} as const;

interface DisciplinaDesempenhoCardProps {
  disciplina: DesempenhoDisciplina;
  expandida?: boolean;
  topicos?: Array<{
    slug: string;
    tentativas: number;
    taxaAcerto: number;
  }>;
}

export function DisciplinaDesempenhoCard({
  disciplina: d,
  expandida = false,
  topicos = [],
}: DisciplinaDesempenhoCardProps) {
  const isTransito = d.disciplina === "legislacao_transito";

  return (
    <Card
      className={cn(
        "overflow-hidden",
        zonaBorder[d.zona],
        isTransito && "border-transito/30",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle
              className={cn(
                "text-base leading-snug",
                isTransito && "text-transito-foreground",
              )}
            >
              <Link
                href={`/desempenho?disciplina=${d.disciplina}`}
                className="hover:underline"
              >
                {d.label}
              </Link>
            </CardTitle>
            <CardDescription className="mt-0.5">
              {d.questoesProva}Q na prova · mín. {d.minimo} pt
            </CardDescription>
          </div>
          <SemaforoVisual zona={d.zona} size="sm" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <p className="text-lg font-bold tabular-nums">
              {d.pontos.toFixed(1)}
            </p>
            <p className="text-muted-foreground">pts proj.</p>
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums">
              {d.tentativas > 0 ? `${d.taxaAcerto}%` : "—"}
            </p>
            <p className="text-muted-foreground">acerto</p>
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums">
              {d.coberturaPct}%
            </p>
            <p className="text-muted-foreground">edital</p>
          </div>
        </div>

        {d.topicosTotal > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Cobertura de tópicos</span>
              <span className="tabular-nums">
                {d.topicosVistos}/{d.topicosTotal}
              </span>
            </div>
            <Progress value={d.coberturaPct} className="h-1.5" />
          </div>
        )}

        <Link
          href={`/estudo?disciplina=${d.disciplina}&modo=auto`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full",
          )}
        >
          Estudar {d.label.split(" ")[0]}
        </Link>

        {expandida && topicos.length > 0 && (
          <ul className="mt-1 flex flex-col gap-1 border-t border-border pt-3">
            {topicos.map((t) => (
              <li
                key={t.slug}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <Link
                  href={`/estudo?topico=${encodeURIComponent(t.slug)}`}
                  className="min-w-0 truncate hover:underline"
                >
                  {labelTopicoEdital(t.slug)}
                </Link>
                <span className="shrink-0 tabular-nums text-xs text-muted-foreground">
                  {t.taxaAcerto}% · {t.tentativas}Q
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

interface SessoesRecentesListProps {
  sessoes: SessaoEstudoResumo[];
}

export function SessoesRecentesList({ sessoes }: SessoesRecentesListProps) {
  if (sessoes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma sessão registrada ainda. Inicie pelo botão &quot;Estudar
        agora&quot;.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {sessoes.map((s) => {
        const data = s.startedAt.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
        const taxa =
          s.answeredCount > 0
            ? Math.round((s.acertos / s.answeredCount) * 100)
            : 0;

        return (
          <li
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {labelModoSessao(
                  s.modo as Parameters<typeof labelModoSessao>[0],
                )}
              </Badge>
              {!s.completed && (
                <Badge variant="secondary" className="text-xs">
                  em andamento
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>{data}</span>
              <span className="tabular-nums">
                {s.answeredCount}/{s.plannedCount}Q
              </span>
              {s.answeredCount > 0 && (
                <span className="tabular-nums">
                  {s.acertos}✓ {s.erros}✗ ({taxa}%)
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
