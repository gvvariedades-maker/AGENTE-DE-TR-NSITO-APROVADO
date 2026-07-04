import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProvaDistribuicaoBar } from "@/components/dashboard/prova-distribuicao-bar";
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

export default function HomePage() {
  const dias = diasParaProva();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-4 py-6 md:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-2">
          <Badge variant="secondary" className="w-fit">
            IDECAN · STTP Campina Grande/PB
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Agente de Trânsito Aprovado
          </h1>
          <p className="text-muted-foreground">
            Simulados espelho, estudo reverso e questões no DNA IDECAN.
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 md:px-8">
        <Card className="border-transito/30 bg-transito/5">
          <CardHeader className="pb-2">
            <CardDescription>Prova objetiva — {formatarDataProva()}</CardDescription>
            <CardTitle className="text-lg font-medium text-muted-foreground">
              Contagem regressiva
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold tabular-nums">
              {dias}
              <span className="ml-2 text-lg font-semibold text-muted-foreground">
                dias
              </span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              60 questões · 4 horas · Legislação de Trânsito = 50% da prova
            </p>
          </CardContent>
        </Card>

        <Card className="border-transito/30 bg-transito/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sua prova hoje</CardTitle>
            <CardDescription>
              Prática de recuperação — uma sessão focada por vez
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Resolva questões para ativar revisões automáticas. Errou → lei
              seca → questões irmãs → domínio.
            </p>
            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Priorize agora
              </p>
              <p className="text-sm text-foreground">
                Legislação de Trânsito — prioridade do edital
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/estudo"
                className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
              >
                Estudar CTB agora
              </Link>
              <Link
                href="/simulado"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                )}
              >
                Simulado espelho
              </Link>
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Painel semáforo →
              </Link>
            </div>
          </CardContent>
        </Card>

        <ProvaDistribuicaoBar />
      </main>
    </div>
  );
}
