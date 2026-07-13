import Link from "next/link";
import { BookMarked } from "lucide-react";
import {
  hrefEstudoReaisIdecan,
  hrefEstudoCatalogo,
  hrefVitrineReais,
} from "@/lib/estudo-links";
import { getVitrineReaisResumo } from "@/lib/questoes-reais";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BadgeQuestaoReal } from "@/components/estudo/badge-questao-real";
import {
  DISCIPLINAS,
  DISCIPLINA_LABELS,
  type Disciplina,
} from "@/types";

export const dynamic = "force-dynamic";

function parseDisciplina(raw?: string): Disciplina | undefined {
  if (!raw) return undefined;
  return DISCIPLINAS.includes(raw as Disciplina)
    ? (raw as Disciplina)
    : undefined;
}

export default async function EstudoReaisPage({
  searchParams,
}: {
  searchParams: Promise<{ disciplina?: string }>;
}) {
  const { disciplina: disciplinaRaw } = await searchParams;
  const disciplina = parseDisciplina(disciplinaRaw);
  const vitrine = await getVitrineReaisResumo();

  if (!disciplina) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 md:p-8">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <BookMarked className="size-6 text-amber-700 dark:text-amber-300" />
            <h1 className="text-2xl font-bold tracking-tight">
              Questões reais IDECAN
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Provas extraídas do corpus Tec Concursos (nível superior), com aula
            completa — separadas do banco de treino inédito.
          </p>
          {vitrine.total > 0 && (
            <BadgeQuestaoReal tags={["real_idecan"]} />
          )}
        </header>

        {vitrine.total === 0 ? (
          <Alert>
            <AlertTitle>Nenhuma questão real no banco</AlertTitle>
            <AlertDescription className="text-sm">
              Execute o seed das reais:{" "}
              <code className="rounded bg-muted px-1">npm run db:seed:reais</code>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Link
                href={hrefEstudoReaisIdecan()}
                className={cn(buttonVariants())}
              >
                Estudar todas ({vitrine.total}Q)
              </Link>
              <Link
                href="/estudo/catalogo"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Catálogo completo (inéditas + reais)
              </Link>
            </div>

            <ul className="grid gap-2 sm:grid-cols-2">
              {vitrine.disciplinas.map((bloco) => (
                <li key={bloco.disciplina}>
                  <Link
                    href={`${hrefVitrineReais()}?disciplina=${bloco.disciplina}`}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-auto w-full flex-col items-start gap-1 px-4 py-3",
                      bloco.disciplina === "legislacao_transito" &&
                        "border-transito/40 bg-transito/5",
                    )}
                  >
                    <span className="font-medium">
                      {DISCIPLINA_LABELS[bloco.disciplina]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {bloco.total} questão
                      {bloco.total > 1 ? "ões" : ""} real
                      {bloco.total > 1 ? "is" : ""} · {bloco.topicos.length}{" "}
                      microtópico{bloco.topicos.length > 1 ? "s" : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit")}
        >
          ← Voltar ao painel
        </Link>
      </div>
    );
  }

  const bloco = vitrine.disciplinas.find((d) => d.disciplina === disciplina);
  const label = DISCIPLINA_LABELS[disciplina];
  const isTransito = disciplina === "legislacao_transito";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 md:p-8">
      <header className="flex flex-col gap-3">
        <Link
          href={hrefVitrineReais()}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          ← Todas as disciplinas (reais)
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1
            className={cn(
              "text-2xl font-bold tracking-tight",
              isTransito && "text-transito-foreground",
            )}
          >
            {label}
          </h1>
          <BadgeQuestaoReal tags={["real_idecan"]} />
        </div>
        <p className="text-sm text-muted-foreground">
          {bloco?.total ?? 0} questões reais IDECAN (superior) nesta disciplina
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={hrefEstudoReaisIdecan(disciplina)}
            className={cn(
              buttonVariants({ size: "sm" }),
              isTransito && "bg-transito hover:bg-transito/90",
            )}
          >
            Estudar só reais desta disciplina
          </Link>
          <Link
            href={hrefEstudoCatalogo(disciplina)}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Catálogo completo
          </Link>
        </div>
      </header>

      {!bloco || bloco.topicos.length === 0 ? (
        <Alert>
          <AlertTitle>Sem questões reais nesta disciplina</AlertTitle>
          <AlertDescription>
            Ainda não há lotes em{" "}
            <code className="rounded bg-muted px-1">content/questoes-reais/</code>{" "}
            para {label}.
          </AlertDescription>
        </Alert>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {bloco.topicos.map((topico) => (
            <li key={topico.slug}>
              <Link
                href={`/estudo?disciplina=${disciplina}&topico=${encodeURIComponent(topico.slug)}&modo=reais_idecan`}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm transition-colors",
                  "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isTransito
                    ? "border-transito/20 bg-card/50"
                    : "border-border bg-card/50",
                )}
              >
                <span className="min-w-0 leading-snug">{topico.label}</span>
                <Badge variant="secondary" className="tabular-nums text-xs">
                  {topico.questoesReaisCount}Q
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
