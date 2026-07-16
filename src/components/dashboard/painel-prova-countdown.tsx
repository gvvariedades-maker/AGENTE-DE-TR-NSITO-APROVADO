import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { diasParaProva } from "@/lib/prova-data";
import { calcularFase, labelFase } from "@/lib/plano-prova-calc";
import { PROVA_DATA } from "@/types";

function formatarDataProva() {
  return PROVA_DATA.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function PainelProvaCountdown() {
  const dias = diasParaProva();
  const fase = labelFase(calcularFase(dias));

  return (
    <section
      aria-label="Contagem regressiva para a prova"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-transito/25 bg-transito/5 px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <CalendarDays
          className="size-4 shrink-0 text-transito"
          aria-hidden
        />
        <span className="text-sm font-medium text-foreground">
          Prova objetiva IDECAN
        </span>
      </div>
      <p className="text-sm tabular-nums">
        <span className="font-bold text-foreground">{dias} dias</span>
        <span className="text-muted-foreground"> · {formatarDataProva()}</span>
        <span className="hidden text-muted-foreground sm:inline">
          {" "}
          · 60 questões · 4 h · {fase}
        </span>
        <span className="text-muted-foreground">
          {" "}
          ·{" "}
          <Link
            href="#plano-prova"
            className="font-medium text-transito underline-offset-4 hover:underline"
          >
            ver plano
          </Link>
        </span>
      </p>
    </section>
  );
}
