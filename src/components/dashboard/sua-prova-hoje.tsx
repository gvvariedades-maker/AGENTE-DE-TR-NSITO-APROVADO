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
import type { RetencaoResumo } from "@/lib/retencao";
import { labelTopicoCTB } from "@/lib/ctb-topicos";
import {
  hrefEstudoErros,
  hrefEstudoTopico,
  labelPiorTopico,
  type PiorTopico,
} from "@/lib/piores-topicos";

interface SuaProvaHojeProps {
  retencao: RetencaoResumo;
  pioresTopicos: PiorTopico[];
  questoesDisponiveis: boolean;
}

function ctaTopico(piores: PiorTopico[]): { href: string; label: string } {
  const alvo = piores[0];
  if (!alvo || alvo.tentativas === 0) {
    return { href: "/estudo", label: "Estudar CTB agora" };
  }
  const nome = labelTopicoCTB(alvo.slug);
  const curto = nome.length > 28 ? `${nome.slice(0, 26)}…` : nome;
  if (alvo.erros > 0) {
    return {
      href: hrefEstudoErros(alvo.slug),
      label: `Revisar erros: ${curto}`,
    };
  }
  return {
    href: hrefEstudoTopico(alvo.slug),
    label: `Estudar ${curto}`,
  };
}

export function SuaProvaHoje({
  retencao,
  pioresTopicos,
  questoesDisponiveis,
}: SuaProvaHojeProps) {
  const cta = ctaTopico(pioresTopicos);
  const totalSrs =
    retencao.aprendendo + retencao.jovem + retencao.maduro;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">Sua prova hoje</CardTitle>
            <CardDescription>
              {questoesDisponiveis
                ? "Prática de recuperação — uma sessão focada por vez"
                : "Questão demonstração de CTB disponível para você começar agora"}
            </CardDescription>
          </div>
          {retencao.revisoesHoje > 0 && (
            <Badge
              variant="outline"
              className="border-semaforo-amarelo/50 text-semaforo-amarelo"
            >
              {retencao.revisoesHoje} revisões pendentes hoje
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="text-sm text-muted-foreground">
          {retencao.hasData ? (
            <p>
              Ciclo de revisão:{" "}
              <span className="font-medium text-foreground">
                {retencao.aprendendo} aprendendo
              </span>
              {" · "}
              <span className="font-medium text-foreground">
                {retencao.jovem} jovem
              </span>
              {" · "}
              <span className="font-medium text-foreground">
                {retencao.maduro} maduro
              </span>
              <span className="text-muted-foreground"> ({totalSrs} total)</span>
            </p>
          ) : (
            <p>
              Resolva questões para ativar revisões automáticas. Cada tentativa
              agenda a próxima revisão no tempo certo.
            </p>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Piores tópicos CTB
          </p>
          <ul className="flex flex-col gap-1.5">
            {pioresTopicos.map((p) => (
              <li key={p.slug} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <Link
                  href={hrefEstudoTopico(p.slug)}
                  className="text-sm text-foreground underline-offset-4 hover:underline"
                >
                  {labelPiorTopico(p)}
                </Link>
                {p.erros > 0 && (
                  <Link
                    href={hrefEstudoErros(p.slug)}
                    className="text-xs text-semaforo-vermelho underline-offset-4 hover:underline"
                  >
                    só erros
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={cta.href}
            className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
          >
            {cta.label}
          </Link>
          <Link
            href="/simulado"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
            )}
          >
            Simulado espelho
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
