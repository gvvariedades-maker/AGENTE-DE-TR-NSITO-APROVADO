import Link from "next/link";
import {
  BookOpen,
  Crosshair,
  Scale,
  ShieldAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DISCIPLINAS } from "@/types";
import { MIN_PONTOS_TOTAL } from "@/lib/edital-constants";
import { getSemaforoData, DISCIPLINA_LABELS } from "@/lib/semaforo";
import { getQuestoesCount } from "@/lib/questoes";
import { getRetencaoResumo, getAtividadeSemanal } from "@/lib/retencao";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { CicloRetencao } from "@/components/dashboard/ciclo-retencao";
import { SemaforoZonaCard } from "@/components/dashboard/semaforo-zona-card";
import { ProvaDistribuicaoBar } from "@/components/dashboard/prova-distribuicao-bar";
import { ModoTreinoCard } from "@/components/dashboard/modo-treino-card";
import { DisciplinaItem } from "@/components/dashboard/disciplina-item";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

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
    href: "/estudo",
    icon: Crosshair,
    ativo: true,
  },
  {
    slug: "anti_zerar",
    label: "Anti-zerar",
    desc: "Disciplinas abaixo do mínimo do edital",
    icon: ShieldAlert,
    ativo: false,
  },
  {
    slug: "pegadinha_idecan",
    label: "Pegadinha IDECAN",
    desc: "Armadilhas típicas da banca",
    href: "/estudo",
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

  const [semaforo, questoesCount, retencao, atividade] = await Promise.all([
    getSemaforoData(user?.id),
    getQuestoesCount(),
    getRetencaoResumo(user?.id),
    getAtividadeSemanal(user?.id),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-4 md:p-8">
      <DashboardHero
        diasParaProva={semaforo.diasParaProva}
        semaforo={semaforo}
      />

      {!semaforo.hasData && (
        <Alert className="border-transito/30 bg-transito/5">
          <AlertTitle>Semáforo aguardando dados</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <span>
              Resolva questões ou complete um simulado espelho para acionar o
              monitor de eliminação por disciplina.
            </span>
            <Link
              href="/estudo"
              className={cn(buttonVariants({ size: "sm" }), "w-fit")}
            >
              Primeira questão CTB
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {semaforo.disciplinasEmRisco.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Risco de eliminação — edital IDECAN</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-inside list-disc text-sm">
              {semaforo.disciplinasEmRisco.map((r) => (
                <li key={r.disciplina}>
                  {DISCIPLINA_LABELS[r.disciplina]}: {r.pontos.toFixed(1)} pts
                  (mín. {r.minimo})
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <section aria-labelledby="semaforo-titulo" className="flex flex-col gap-4">
        <div>
          <h2 id="semaforo-titulo" className="text-lg font-semibold">
            Semáforo de aprovação
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerais, específicos e nota total — critérios do edital STTP
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <SemaforoZonaCard
            metrica={semaforo.gerais}
            minimoLabel="Mín. 1 pt/disciplina geral"
          />
          <SemaforoZonaCard
            metrica={semaforo.especificos}
            minimoLabel="Mín. 2 pts/disciplina específica"
          />
          <SemaforoZonaCard
            metrica={semaforo.total}
            minimoLabel={`Mín. ${MIN_PONTOS_TOTAL} pts na prova`}
          />
        </div>
        {semaforo.hasData && (
          <p className="text-xs text-muted-foreground">
            Fonte:{" "}
            {semaforo.fonte === "simulado"
              ? "último simulado espelho"
              : "projeção pelas suas tentativas"}
          </p>
        )}
      </section>

      <ProvaDistribuicaoBar />

      <CicloRetencao resumo={retencao} atividade={atividade} />

      <Card className="border-transito/30 bg-transito/5">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Operação de hoje</CardTitle>
              <CardDescription>
                {questoesCount > 0
                  ? `${questoesCount} questões no banco · priorize CTB`
                  : "Rode o seed — enquanto isso, use a questão demo CTB"}
              </CardDescription>
            </div>
            <Badge className="bg-transito/20 text-transito-foreground">
              30Q Trânsito
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="outline">Estudo reverso</Badge>
          <Badge variant="outline">DNA IDECAN</Badge>
          <Link href="/estudo" className={cn(buttonVariants({ size: "sm" }))}>
            Estudar CTB agora
          </Link>
          <Link
            href="/simulado"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Simulado espelho
          </Link>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">Modos de treino</h2>
          <p className="text-sm text-muted-foreground">
            Estratégias alinhadas ao perfil da prova e da banca
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
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

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">Disciplinas do edital</h2>
          <p className="text-sm text-muted-foreground">
            Anexo I retificado — STTP Campina Grande/PB
          </p>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {DISCIPLINAS.map((d) => (
            <DisciplinaItem key={d} disciplina={d} />
          ))}
        </ul>
      </section>

      <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "w-fit")}>
        ← Voltar ao início
      </Link>
    </div>
  );
}
