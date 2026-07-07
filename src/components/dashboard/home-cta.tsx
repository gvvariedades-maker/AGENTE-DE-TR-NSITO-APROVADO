import Link from "next/link";
import { BookOpen, Scale } from "lucide-react";
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

export function HomeCta() {
  return (
    <section aria-labelledby="comecar-titulo" className="flex flex-col gap-4">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle id="comecar-titulo" className="text-lg font-semibold">
            Sua prova hoje
          </CardTitle>
          <CardDescription>
            Prática de recuperação — uma sessão focada por vez
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Resolva questões para ativar revisões automáticas. Errou → lei seca →
            questões irmãs → domínio.
          </p>

          <div className="rounded-lg border border-border bg-card/80 px-4 py-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Priorize agora
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              Legislação de Trânsito — prioridade do edital
            </p>
          </div>

          <Link
            href="/estudo"
            className={cn(buttonVariants({ size: "lg" }), "w-full min-h-11")}
          >
            Estudar CTB agora
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-2 sm:grid-cols-2">
        <ModoTreinoCard
          icon={Scale}
          label="Simulado espelho"
          desc="60 questões · 4 horas · proporção IDECAN"
          href="/simulado"
          destaque
          ativo
        />
        <ModoTreinoCard
          icon={BookOpen}
          label="Painel semáforo"
          desc="Métricas de aprovação e risco de eliminação"
          href="/dashboard"
          ativo
        />
      </div>
    </section>
  );
}
