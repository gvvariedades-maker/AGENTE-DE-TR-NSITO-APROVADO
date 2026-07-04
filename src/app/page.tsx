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
import { PROVA_DATA, SIMULADO_ESPELHO_DISTRIBUICAO } from "@/types";

function diasParaProva() {
  const hoje = new Date();
  const diff = PROVA_DATA.getTime() - hoje.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function HomePage() {
  const dias = diasParaProva();
  const totalQuestoes = Object.values(SIMULADO_ESPELHO_DISTRIBUICAO).reduce(
    (a, b) => a + b,
    0,
  );

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

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Contagem regressiva</CardTitle>
            <CardDescription>Prova objetiva — 30/08/2026</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold tabular-nums">{dias} dias</p>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Simulado Espelho</CardTitle>
              <CardDescription>
                {totalQuestoes} questões · 4 horas · proporção do edital
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/dashboard"
                className={cn(buttonVariants(), "w-full")}
              >
                Ir para o painel
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estudo Reverso</CardTitle>
              <CardDescription>
                Errou → lei seca → 3 questões irmãs → domínio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: "outline" }), "w-full")}
              >
                Começar a estudar
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição da prova</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm">
              <li className="flex justify-between">
                <span>Legislação de Trânsito</span>
                <span className="font-medium">30 questões</span>
              </li>
              <li className="flex justify-between">
                <span>Língua Portuguesa</span>
                <span className="font-medium">8 questões</span>
              </li>
              <li className="flex justify-between text-muted-foreground">
                <span>+ 5 demais disciplinas</span>
                <span className="font-medium">22 questões</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
