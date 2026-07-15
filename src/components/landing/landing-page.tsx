import Link from "next/link";
import {
  BookMarked,
  Brain,
  CalendarDays,
  CheckCircle2,
  Scale,
  ShieldAlert,
  Target,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PROVA_DATA } from "@/types";

function diasParaProva() {
  const hoje = new Date();
  const diff = PROVA_DATA.getTime() - hoje.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatarDataProva() {
  return PROVA_DATA.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const PILARES = [
  {
    icon: Scale,
    titulo: "Simulado espelho",
    desc: "60 questões na proporção exata do edital — 4 horas como na prova.",
  },
  {
    icon: Brain,
    titulo: "Estudo reverso",
    desc: "Micro-aulas visuais após cada resposta. Você aprende no erro.",
  },
  {
    icon: BookMarked,
    titulo: "Questões reais IDECAN",
    desc: "Provas do corpus superior com enunciado fiel e aula completa.",
  },
  {
    icon: ShieldAlert,
    titulo: "Semáforo anti-eliminação",
    desc: "Saiba onde está em risco de zerar antes que seja tarde.",
  },
] as const;

const PROVAS = [
  "CTB e resoluções CONTRAN",
  "Questões no DNA da banca IDECAN",
  "Métricas de retenção e desempenho",
  "Foco no que pesa 50% da prova",
] as const;

export function LandingPage() {
  const dias = diasParaProva();

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-transito/20 blur-3xl" />
        <div className="absolute top-1/3 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-full bg-gradient-to-t from-asfalto to-transparent" />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-faixa to-transparent opacity-80"
        aria-hidden
      />

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-5 md:px-8">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            STTP Campina Grande/PB
          </p>
          <p className="truncate text-sm font-bold text-foreground">
            Agente de Trânsito Aprovado
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Entrar
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Criar conta
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 pb-16 md:gap-16 md:px-8 md:pb-24">
        <section className="flex flex-col items-center gap-8 pt-4 text-center md:pt-10">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge className="border-transito/40 bg-transito/15 text-transito-foreground">
              IDECAN · Edital 04/2026
            </Badge>
            <Badge variant="outline">Concurso público</Badge>
          </div>

          <div className="flex max-w-3xl flex-col gap-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-5xl md:leading-[1.1]">
              A vaga é sua.
              <span className="block text-primary">A preparação começa agora.</span>
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Plataforma feita para quem vai disputar a prova de Agente de
              Trânsito — simulados espelho, estudo reverso visual e treino
              calibrado na banca IDECAN.
            </p>
          </div>

          <div className="flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: "lg" }),
                "min-h-12 w-full px-8 text-base font-semibold sm:w-auto",
              )}
            >
              Entrar na plataforma
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "min-h-12 w-full border-primary/30 px-8 text-base font-semibold sm:w-auto",
              )}
            >
              Criar minha conta
            </Link>
          </div>

          <div className="grid w-full max-w-2xl gap-4 rounded-2xl border border-transito/25 bg-card/80 p-6 shadow-sm backdrop-blur-sm sm:grid-cols-[1fr_auto] sm:items-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-transito/15 ring-1 ring-transito/30">
                <span className="text-2xl font-bold tabular-nums text-transito-foreground">
                  {dias}
                </span>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  <CalendarDays className="size-3.5" aria-hidden />
                  Contagem regressiva
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {dias === 1 ? "Falta 1 dia" : `Faltam ${dias} dias`} para a
                  prova
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatarDataProva()} · 60 questões · 4 horas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm">
              <Target
                className="size-4 shrink-0 text-transito-foreground"
                aria-hidden
              />
              <span>
                <strong className="font-semibold text-foreground">30Q de CTB</strong>
                {" — "}
                metade da nota
              </span>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="pilares-titulo"
          className="flex flex-col gap-6"
        >
          <div className="text-center md:text-left">
            <h2
              id="pilares-titulo"
              className="text-xl font-bold tracking-tight md:text-2xl"
            >
              Treine como a prova será
            </h2>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              Cada recurso foi desenhado para o edital STTP Campina Grande —
              sem distração, com foco em aprovação.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {PILARES.map(({ icon: Icon, titulo, desc }) => (
              <article
                key={titulo}
                className="flex gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-transito/30 hover:bg-transito/5"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-transito/15 ring-1 ring-transito/25">
                  <Icon
                    className="size-5 text-transito-foreground"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">{titulo}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="motivacao-titulo"
          className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-transito/10 via-card to-asfalto p-6 md:p-10"
        >
          <div
            className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-primary/10 blur-2xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl flex-col gap-3">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <TrendingUp className="size-5" aria-hidden />
                <span className="text-xs font-bold tracking-widest uppercase">
                  Sua jornada
                </span>
              </div>
              <h2
                id="motivacao-titulo"
                className="text-2xl font-bold tracking-tight md:text-3xl"
              >
                Não é sorte. É método, constância e prova espelhada.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                Cada sessão te aproxima da nota mínima de 50 pontos — com
                alertas de risco por disciplina e prioridade automática no que
                mais cai: Legislação de Trânsito.
              </p>
            </div>

            <ul className="flex flex-col gap-3 md:min-w-[16rem]">
              {PROVAS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-foreground"
                >
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-semaforo-verde"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card px-6 py-10 text-center md:py-12">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Pronto para começar?
          </p>
          <h2 className="max-w-lg text-2xl font-bold tracking-tight md:text-3xl">
            Entre agora e transforme estudo em aprovação
          </h2>
          <p className="max-w-md text-sm text-muted-foreground md:text-base">
            Crie sua conta em menos de um minuto e comece a treinar com o
            motor ATA — prioridade inteligente no edital IDECAN.
          </p>
          <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: "lg" }),
                "min-h-12 w-full font-semibold sm:flex-1",
              )}
            >
              Entrar
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "min-h-12 w-full font-semibold sm:flex-1",
              )}
            >
              Criar conta
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-muted/30 px-4 py-6 text-center text-xs text-muted-foreground md:px-8">
        <p>
          Agente de Trânsito Aprovado · STTP Campina Grande/PB · Banca IDECAN
        </p>
        <p className="mt-1">Edital 04/2026 · Prova em {formatarDataProva()}</p>
      </footer>
    </div>
  );
}
