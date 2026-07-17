import Link from "next/link";
import { ArrowUp, Check, ClipboardCheck, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  type MissaoDia,
  type SemanaChegadaResumo,
  type StatusMissao,
  type TipoMissao,
} from "@/lib/semana-chegada";

interface PainelSemanaChegadaProps {
  semana: SemanaChegadaResumo;
}

function labelTipo(tipo: TipoMissao): string {
  switch (tipo) {
    case "espelho":
      return "simulado";
    case "folga":
      return "folga";
    case "revisoes":
      return "revisões";
    default:
      return "questões";
  }
}

function statusCellClasses(status: StatusMissao, isHoje: boolean): string {
  if (isHoje) {
    return "border-transito bg-transito/5 ring-1 ring-transito/30";
  }
  switch (status) {
    case "feito":
      return "border-semaforo-verde/30 bg-semaforo-verde/5";
    case "parcial":
      return "border-semaforo-amarelo/30 bg-semaforo-amarelo/5";
    case "atrasado":
      return "border-semaforo-vermelho/30 bg-semaforo-vermelho/5";
    default:
      return "border-border bg-muted/20";
  }
}

function CelulaDia({ missao }: { missao: MissaoDia }) {
  const isHoje = missao.offset === 0;
  const feito = missao.status === "feito";
  const parcial = missao.status === "parcial";

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center gap-1 rounded-lg border px-1 py-2 text-center transition-colors sm:gap-1.5 sm:px-1.5 sm:py-2.5",
        statusCellClasses(missao.status, isHoje),
      )}
      title={missao.motivo}
    >
      <span
        className={cn(
          "text-[10px] font-semibold uppercase tracking-wide",
          isHoje ? "text-transito-foreground" : "text-muted-foreground",
        )}
      >
        {missao.diaSemanaLabel}
      </span>

      {missao.tipo === "espelho" ? (
        <ClipboardCheck
          className="size-4 shrink-0 text-transito"
          aria-label="simulado"
        />
      ) : missao.tipo === "folga" ? (
        <Moon className="size-4 text-muted-foreground" aria-label="Folga" />
      ) : feito ? (
        <Check
          className="size-4 text-semaforo-verde"
          aria-label="Missão concluída"
        />
      ) : (
        <span
          className={cn(
            "text-sm font-bold tabular-nums leading-none",
            isHoje ? "text-transito-foreground" : "text-foreground",
          )}
        >
          {missao.metaQuestoes}
        </span>
      )}

      <span className="w-full min-w-0 truncate text-[9px] leading-none text-muted-foreground sm:text-[10px]">
        {labelTipo(missao.tipo)}
      </span>

      {parcial && missao.metaQuestoes > 0 && (
        <span className="text-[10px] tabular-nums text-semaforo-amarelo">
          {missao.progressoQuestoes}/{missao.metaQuestoes}
        </span>
      )}
    </div>
  );
}

function missaoPendenteHoje(missao: MissaoDia): boolean {
  if (missao.offset !== 0 || missao.tipo === "folga") return false;
  return missao.status !== "feito";
}

export function PainelSemanaChegada({ semana }: PainelSemanaChegadaProps) {
  const missaoHoje = semana.missoes[0];
  const acaoPendente = missaoPendenteHoje(missaoHoje);

  return (
    <section id="semana-chegada" aria-labelledby="semana-chegada-titulo">
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="flex flex-col gap-4 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2
                id="semana-chegada-titulo"
                className="text-sm font-semibold text-foreground"
              >
                Semana de chegada
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {semana.mensagemChegada90}
              </p>
            </div>
            <p className="shrink-0 text-right text-xs text-muted-foreground">
              <span className="text-lg font-bold tabular-nums leading-none text-foreground">
                {semana.feitos}
              </span>
              <span className="text-muted-foreground">/7</span>
              <br />
              dias feitos
            </p>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {semana.missoes.map((missao) => (
              <CelulaDia key={missao.data} missao={missao} />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            {acaoPendente ? (
              <Link
                href="#plano-prova"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                <ArrowUp className="size-3.5 shrink-0" aria-hidden />
                Ação do dia no plano acima
              </Link>
            ) : (
              <p className="text-xs text-muted-foreground">
                {missaoHoje.tipo === "folga"
                  ? "Dia leve — sem meta de questões"
                  : missaoHoje.status === "feito"
                    ? "Meta de hoje concluída no plano acima"
                    : "Próximas missões na grade"}
              </p>
            )}

            <Link
              href="/desempenho"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "ml-auto text-muted-foreground",
              )}
            >
              Ver evolução
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
