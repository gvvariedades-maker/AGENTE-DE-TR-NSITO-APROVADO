import Link from "next/link";
import {
  BookOpen,
  Crosshair,
  Scale,
  ShieldAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDesempenhoResumo, getAtividadeHoje } from "@/lib/desempenho";
import { getRetencaoResumo } from "@/lib/retencao";
import { getQuestoesCount } from "@/lib/questoes";
import { getPioresTopicos, getPrioridadeEdital } from "@/lib/piores-topicos";
import { DISCIPLINA_LABELS } from "@/lib/desempenho";
import {
  DISCIPLINAS_CRITICAS_INICIO,
  labelTopicoEdital,
} from "@/lib/edital-topicos";
import { PainelHero } from "@/components/dashboard/painel-hero";
import { ModoTreinoCard } from "@/components/dashboard/modo-treino-card";
import { DisciplinasMapa } from "@/components/dashboard/disciplinas-mapa";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  hrefEstudoErros,
  hrefEstudoTopico,
  labelPiorTopico,
} from "@/lib/piores-topicos";

const MODOS = [
  {
    slug: "simulado_espelho",
    label: "Simulado Espelho",
    desc: "60 questões · 4 horas · proporção IDECAN",
    href: "/simulado",
    icon: Scale,
    destaque: true,
    ativo: true,
  },
  {
    slug: "sniper_ctb",
    label: "Sniper CTB",
    desc: "Foco total em Legislação de Trânsito",
    href: "/estudo?disciplina=legislacao_transito",
    icon: Crosshair,
    ativo: true,
  },
  {
    slug: "anti_zerar",
    label: "Anti-zerar",
    desc: "Disciplinas abaixo do mínimo do edital",
    href: "/estudo?modo=anti_zerar",
    icon: ShieldAlert,
    ativo: true,
  },
  {
    slug: "pegadinha_idecan",
    label: "Pegadinha IDECAN",
    desc: "Armadilhas típicas da banca",
    href: "/estudo?modo=pegadinha",
    icon: BookOpen,
    ativo: true,
  },
] as const;

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    desempenho,
    retencao,
    atividadeHoje,
    questoesCount,
    pioresTopicos,
    prioridadeEdital,
  ] = await Promise.all([
    getDesempenhoResumo(user?.id),
    getRetencaoResumo(user?.id),
    getAtividadeHoje(user?.id),
    getQuestoesCount(),
    getPioresTopicos(user?.id),
    getPrioridadeEdital(user?.id, 5),
  ]);

  const { semaforo } = desempenho;
  const desempenhoPorDisciplina = new Map(
    desempenho.disciplinas.map((d) => [d.disciplina, d]),
  );
  const mostrarAlertaInicio =
    !desempenho.hasData && semaforo.disciplinasEmRisco.length === 0;
  const temPontosFracos = pioresTopicos.some((p) => p.tentativas > 0);
  const temPrioridade = prioridadeEdital.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <PainelHero
        desempenho={desempenho}
        retencao={retencao}
        atividadeHoje={atividadeHoje}
        questoesDisponiveis={questoesCount > 0}
      />

      {semaforo.disciplinasEmRisco.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Risco de eliminação</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-inside list-disc text-sm">
              {semaforo.disciplinasEmRisco.map((r) => (
                <li key={r.disciplina}>
                  {DISCIPLINA_LABELS[r.disciplina]}: {r.pontos.toFixed(1)} pts
                  (mín. {r.minimo})
                </li>
              ))}
            </ul>
            <Link
              href="/estudo?modo=anti_zerar"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-3",
              )}
            >
              Treinar anti-zerar
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {mostrarAlertaInicio && (
        <Alert>
          <AlertTitle>Comece pelas disciplinas de risco</AlertTitle>
          <AlertDescription className="text-sm">
            Na prova, cada disciplina geral exige mínimo de{" "}
            <strong>1 ponto</strong> para não zerar. Priorize:{" "}
            {DISCIPLINAS_CRITICAS_INICIO.map((d) => DISCIPLINA_LABELS[d]).join(
              ", ",
            )}
            .
            <Link
              href="/estudo?modo=anti_zerar"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-3 block w-fit",
              )}
            >
              Modo anti-zerar
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {(temPontosFracos || temPrioridade) && (
        <div className="grid gap-4 md:grid-cols-2">
          {temPontosFracos && (
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Pontos fracos
                </CardTitle>
                <CardDescription>
                  Tópicos com maior taxa de erro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2">
                  {pioresTopicos.slice(0, 3).map((p) => (
                    <li
                      key={p.slug}
                      className="flex items-baseline justify-between gap-2 text-sm"
                    >
                      <Link
                        href={hrefEstudoTopico(p.slug, p.disciplina)}
                        className="min-w-0 hover:underline"
                      >
                        {labelPiorTopico(p)}
                      </Link>
                      {p.erros > 0 && (
                        <Link
                          href={hrefEstudoErros(p.slug)}
                          className="shrink-0 text-xs text-semaforo-vermelho hover:underline"
                        >
                          erros
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {temPrioridade && (
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Prioridade do edital
                </CardTitle>
                <CardDescription>
                  {temPontosFracos
                    ? "Próximos tópicos estudáveis ainda não vistos"
                    : "Sugestão inicial — CTB, CONTRAN e disciplinas de risco"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2 text-sm">
                  {prioridadeEdital.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={hrefEstudoTopico(p.slug, p.disciplina)}
                        className="text-foreground hover:underline"
                      >
                        {labelTopicoEdital(p.slug)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Modos de treino
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {MODOS.map((modo) => (
            <ModoTreinoCard
              key={modo.slug}
              icon={modo.icon}
              label={modo.label}
              desc={modo.desc}
              href={"href" in modo ? modo.href : undefined}
              destaque={"destaque" in modo ? modo.destaque : false}
              ativo={modo.ativo}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Disciplinas
          </h2>
          <Link
            href="/desempenho"
            className="text-xs text-primary underline-offset-4 hover:underline"
          >
            Ver evolução completa →
          </Link>
        </div>
        <DisciplinasMapa desempenhoPorDisciplina={desempenhoPorDisciplina} />
      </section>
    </div>
  );
}
