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
import { DisciplinaItem } from "@/components/dashboard/disciplina-item";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DISCIPLINAS } from "@/types";
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

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 md:p-8">
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

      {pioresTopicos.some((p) => p.tentativas > 0) && (
        <section className="rounded-xl border border-border bg-card/50 p-4">
          <h2 className="text-sm font-semibold">Pontos fracos</h2>
          <ul className="mt-2 flex flex-col gap-1">
            {pioresTopicos.slice(0, 3).map((p) => (
              <li key={p.slug} className="flex items-baseline gap-2 text-sm">
                <Link
                  href={hrefEstudoTopico(p.slug, p.disciplina)}
                  className="hover:underline"
                >
                  {labelPiorTopico(p)}
                </Link>
                {p.erros > 0 && (
                  <Link
                    href={hrefEstudoErros(p.slug)}
                    className="text-xs text-semaforo-vermelho hover:underline"
                  >
                    erros
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {prioridadeEdital.length > 0 && (
        <section className="rounded-xl border border-border bg-card/50 p-4">
          <h2 className="text-sm font-semibold">Prioridade do edital</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {pioresTopicos.some((p) => p.tentativas > 0)
              ? "Próximos tópicos estudáveis ainda não vistos"
              : "Sugestão inicial — CTB, CONTRAN e disciplinas de risco"}
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
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
        </section>
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
        <ul className="grid gap-2 sm:grid-cols-2">
          {DISCIPLINAS.map((d) => (
            <DisciplinaItem
              key={d}
              disciplina={d}
              desempenho={desempenhoPorDisciplina.get(d)}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}
