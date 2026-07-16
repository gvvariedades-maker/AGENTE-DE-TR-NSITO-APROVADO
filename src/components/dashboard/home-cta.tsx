import Link from "next/link";
import { BookOpen, CalendarDays, Scale, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModoTreinoCard } from "@/components/dashboard/modo-treino-card";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { PROVA_DATA } from "@/types";

interface HomeCtaProps {
  diasParaProva: number;
}

function formatarDataProva() {
  return PROVA_DATA.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function HomeCta({ diasParaProva }: HomeCtaProps) {
  return (
    <section aria-labelledby="comecar-titulo" className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-border bg-card md:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle id="comecar-titulo" className="text-lg font-semibold">
              Sua prova hoje
            </CardTitle>
            <CardDescription>
              Uma sessão focada — prioridade do edital
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-lg border border-transito/25 bg-transito/5 px-4 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-transito/15 ring-1 ring-transito/30">
                <Target
                  className="size-4 text-transito-foreground"
                  aria-hidden
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Priorize agora
                </p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">
                  Legislação de Trânsito
                </p>
                <p className="text-xs text-muted-foreground">
                  30 das 60 questões · 50% da prova
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/estudo?disciplina=legislacao_transito"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full min-h-11 sm:flex-1",
                )}
              >
                Estudar CTB agora
              </Link>
              <InstallAppButton
                variant="outline"
                size="lg"
                className="w-full min-h-11 sm:w-auto"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDays className="size-4" aria-hidden />
              Contagem regressiva
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="text-5xl font-bold tabular-nums tracking-tight text-foreground">
                {diasParaProva}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                dias para a prova
              </p>
            </div>

            <dl className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Data</dt>
                <dd className="text-right font-medium tabular-nums">
                  {formatarDataProva()}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Formato</dt>
                <dd className="font-medium">60 questões · 4 horas</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Nota mínima</dt>
                <dd className="font-medium">50 pts total</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <ModoTreinoCard
          icon={Scale}
          label="Simulado"
          desc="60 questões · 4 horas · proporção IDECAN"
          href="/simulado"
          destaque
          ativo
        />
        <ModoTreinoCard
          icon={BookOpen}
          label="Painel semáforo"
          desc="Nota projetada, semáforo e evolução"
          href="/dashboard"
          ativo
        />
      </div>
    </section>
  );
}
