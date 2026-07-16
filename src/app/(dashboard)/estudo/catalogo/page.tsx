import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTopicosPorDisciplina } from "@/lib/topicos";
import { getContagemQuestoesReais } from "@/lib/questoes-reais";
import { TopicosCatalogo } from "@/components/estudo/topicos-catalogo";
import { hrefEstudoReaisIdecan, hrefVitrineReais } from "@/lib/estudo-links";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DISCIPLINAS,
  DISCIPLINA_LABELS,
  SIMULADO_ESPELHO_DISTRIBUICAO,
  type Disciplina,
} from "@/types";

export const dynamic = "force-dynamic";

function parseDisciplina(raw?: string): Disciplina | undefined {
  if (!raw) return undefined;
  return DISCIPLINAS.includes(raw as Disciplina)
    ? (raw as Disciplina)
    : undefined;
}

export default async function EstudoCatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ disciplina?: string }>;
}) {
  const { disciplina: disciplinaRaw } = await searchParams;
  const disciplina = parseDisciplina(disciplinaRaw);

  if (!disciplina) {
    const totalReais = await getContagemQuestoesReais();

    return (      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 md:p-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Catálogo do edital
          </h1>
          <p className="text-sm text-muted-foreground">
            Escolha a disciplina para ver os assuntos do Anexo I retificado
          </p>
        </header>
        <ul className="grid gap-2 sm:grid-cols-2">
          {DISCIPLINAS.map((d) => (
            <li key={d}>
              <Link
                href={`/estudo/catalogo?disciplina=${d}`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-auto w-full justify-between px-4 py-3",
                  d === "legislacao_transito" &&
                    "border-transito/40 bg-transito/5 hover:bg-transito/10",
                )}
              >
                <span
                  className={
                    d === "legislacao_transito"
                      ? "font-medium text-transito-foreground"
                      : undefined
                  }
                >
                  {DISCIPLINA_LABELS[d]}
                </span>
                <Badge variant="secondary" className="tabular-nums">
                  {SIMULADO_ESPELHO_DISTRIBUICAO[d]}Q
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
        {totalReais > 0 && (
          <div className="flex flex-wrap gap-2">
            <Link
              href={hrefVitrineReais()}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Questões reais IDECAN ({totalReais}Q)
            </Link>
            <Link
              href={hrefEstudoReaisIdecan()}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Estudar só reais
            </Link>
          </div>
        )}
        <Link          href="/dashboard"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit")}
        >
          ← Voltar ao painel
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const resumo = await getTopicosPorDisciplina(disciplina, user?.id);
  const usandoFallbackEstatico = resumo.topicos.every((t) =>
    t.id.startsWith("edital-"),
  );

  const isTransito = disciplina === "legislacao_transito";
  const label = DISCIPLINA_LABELS[disciplina];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 md:p-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Link
              href="/estudo/catalogo"
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              ← Todas as disciplinas
            </Link>
            <h1
              className={cn(
                "text-2xl font-bold tracking-tight",
                isTransito && "text-transito-foreground",
              )}
            >
              {label}
            </h1>
            <p className="text-sm text-muted-foreground">
              {resumo.totalMapeados} assuntos mapeados ·{" "}
              {resumo.totalEstudaveis} com questões
              {resumo.totalReais > 0 && (
                <>
                  {" "}
                  ·{" "}
                  <span className="text-amber-800 dark:text-amber-200">
                    {resumo.totalReais} reais IDECAN
                  </span>
                </>
              )}{" "}
              · {SIMULADO_ESPELHO_DISTRIBUICAO[disciplina]}Q na prova
            </p>
          </div>
          {resumo.totalEstudaveis > 0 && (
            <Badge variant="outline" className="tabular-nums">
              {resumo.coberturaPct}% coberto
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/estudo?disciplina=${disciplina}&modo=auto`}
            className={cn(
              buttonVariants({ size: "sm" }),
              isTransito && "bg-transito hover:bg-transito/90",
            )}
          >
            Estudar tudo (motor ATA)
          </Link>
          {resumo.totalReais > 0 && (
            <Link
              href={hrefEstudoReaisIdecan(disciplina)}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Só reais IDECAN ({resumo.totalReais}Q)
            </Link>
          )}
          <Link
            href={`/estudo/reais?disciplina=${disciplina}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Vitrine reais
          </Link>
          <Link
            href={`/desempenho?disciplina=${disciplina}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Ver desempenho
          </Link>
        </div>
      </header>

      {usandoFallbackEstatico && (
        <Alert>
          <AlertTitle>Catálogo offline do edital</AlertTitle>
          <AlertDescription className="text-sm">
            Os assuntos aparecem a partir do Anexo I retificado. Se tudo
            estiver como &quot;Em breve&quot;, o app não conseguiu ler o banco
            (reinicie o servidor após o seed) ou execute{" "}
            <code className="rounded bg-muted px-1">npm run db:seed:topics</code>{" "}
            e depois <code className="rounded bg-muted px-1">npm run db:seed</code>.
          </AlertDescription>
        </Alert>
      )}

      <TopicosCatalogo resumo={resumo} />

      <Link
        href="/dashboard"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit")}
      >
        ← Voltar ao painel
      </Link>
    </div>
  );
}
