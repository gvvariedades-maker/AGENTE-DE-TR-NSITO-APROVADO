"use client";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { MetaCadernoEspelho } from "@/lib/simulado-caderno";

interface SimuladoBriefingProps {
  totalQuestoes: number;
  totalEsperado: number;
  questoesReaisCount?: number;
  metaCaderno?: MetaCadernoEspelho;
  isDemo: boolean;
  duracaoHoras?: number;
  onIniciar: () => void;
}

export function SimuladoBriefing({
  totalQuestoes,
  totalEsperado,
  questoesReaisCount = 0,
  metaCaderno,
  isDemo,
  duracaoHoras = 4,
  onIniciar,
}: SimuladoBriefingProps) {
  const ineditasCount =
    metaCaderno?.ineditasCount ?? Math.max(0, totalQuestoes - questoesReaisCount);
  const mix = metaCaderno?.mixDificuldade;
  const reusoCount = metaCaderno?.reusoCount ?? 0;
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 p-4 md:p-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Sala de prova · Simulado do edital
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          Simulado objetivo — Agente de Trânsito
        </h1>
        <p className="text-sm text-muted-foreground">
          Ambiente alinhado à prova IDECAN (Edital 04/2026): {totalEsperado}{" "}
          questões, {duracaoHoras} horas, alternativas A–D, sem gabarito até a
          entrega. O caderno segue cotas de dificuldade da banca (~20% fácil ·
          ~50% médio · ~30% difícil), preferindo questões reais IDECAN dentro
          de cada faixa quando há no banco.
        </p>
        {totalQuestoes > 0 && (
          <p className="text-sm text-muted-foreground">
            Neste caderno:{" "}
            <strong className="font-medium text-foreground">
              {questoesReaisCount} real
              {questoesReaisCount !== 1 ? "is" : ""} IDECAN
            </strong>
            {ineditasCount > 0 && (
              <>
                {" "}
                ·{" "}
                <strong className="font-medium text-foreground">
                  {ineditasCount} inédita{ineditasCount !== 1 ? "s" : ""}
                </strong>
              </>
            )}
            {mix && totalQuestoes > 0 && (
              <>
                {" "}
                · mix aproximado{" "}
                <strong className="font-medium text-foreground">
                  {mix.facil}/{mix.medio}/{mix.dificil}
                </strong>{" "}
                (fácil/médio/difícil)
              </>
            )}
            .
          </p>
        )}
      </header>

      {reusoCount > 0 && (
        <Alert>
          <AlertTitle>Reuso por banco estreito</AlertTitle>
          <AlertDescription>
            {reusoCount} questão{reusoCount !== 1 ? "ões" : ""} reaparece
            {reusoCount !== 1 ? "m" : ""} de simulados anteriores (as menos
            recentes) — o banco ainda não cobre um caderno 100% inédito nesta
            disciplina.
          </AlertDescription>
        </Alert>
      )}

      {isDemo && (
        <Alert>
          <AlertTitle>Banco incompleto</AlertTitle>
          <AlertDescription>
            {totalQuestoes === 0
              ? "Modo demonstração com questões de exemplo."
              : `${totalQuestoes} de ${totalEsperado} questões no simulado. O timer e o cartão-resposta já funcionam como na prova.`}
          </AlertDescription>
        </Alert>
      )}

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-sm font-semibold">Instruções da banca (simuladas)</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-muted-foreground">
          <li>
            O cronômetro de {duracaoHoras}h inicia ao clicar em{" "}
            <strong className="text-foreground">Iniciar prova</strong> e não
            pausa.
          </li>
          <li>
            Navegue pelo <strong className="text-foreground">cartão-resposta</strong>.
            Você pode alterar a alternativa a qualquer momento.
          </li>
          <li>
            Use <strong className="text-foreground">Marcar para revisão</strong>{" "}
            (amarelo) para voltar depois — como na prova real.
          </li>
          <li>
            Não há feedback de acerto/erro durante a prova. O resultado só
            aparece após a entrega ou ao zerar o tempo.
          </li>
          <li>
            Ao entregar, questões em branco contam como erradas no simulado do
            edital (Gerais 1 pt · Específicos 2 pts · corte 50).
          </li>
        </ol>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button size="lg" className="min-h-11 min-w-48" onClick={onIniciar}>
          Iniciar prova
        </Button>
        <p className="text-xs text-muted-foreground">
          {totalQuestoes} questões neste caderno · atalhos A–D e setas no
          desktop
        </p>
      </div>
    </div>
  );
}
