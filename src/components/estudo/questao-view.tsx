"use client";

import { useCallback, useEffect, useState } from "react";
import { DISCIPLINA_LABELS } from "@/types";
import type { QuestaoUI } from "@/lib/questoes";
import { AlternativaButton } from "@/components/estudo/alternativa-button";
import { SimuladoBar } from "@/components/estudo/simulado-bar";
import { SessaoBar } from "@/components/estudo/sessao-bar";
import { RecallGate } from "@/components/estudo/recall-gate";
import { FeedbackElaborado } from "@/components/estudo/feedback-elaborado";
import { FocusModeToggle } from "@/components/estudo/focus-mode-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export type ModoQuestao = "estudo" | "simulado";

interface QuestaoViewProps {
  questoes: QuestaoUI[];
  modo: ModoQuestao;
  indiceInicial?: number;
  duracaoMinutos?: number;
}

const LETRAS = ["A", "B", "C", "D", "E"] as const;
const DURACAO_SIMULADO_MS = 4 * 60 * 60 * 1000;
const ALERTA_MINUTOS = 30;

function formatarTempo(ms: number): string {
  const totalSeg = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeg / 3600);
  const m = Math.floor((totalSeg % 3600) / 60);
  const s = totalSeg % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function QuestaoView({
  questoes,
  modo,
  indiceInicial = 0,
  duracaoMinutos,
}: QuestaoViewProps) {
  const [indice, setIndice] = useState(indiceInicial);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [confirmada, setConfirmada] = useState(false);
  const [revelada, setRevelada] = useState(false);
  const [alternativasVisiveis, setAlternativasVisiveis] = useState(
    modo === "simulado",
  );
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [fimMs] = useState(
    () => Date.now() + (duracaoMinutos ?? 240) * 60 * 1000,
  );
  const [tempoRestante, setTempoRestante] = useState(
    duracaoMinutos ? duracaoMinutos * 60 * 1000 : DURACAO_SIMULADO_MS,
  );

  const questao = questoes[indice];
  const total = questoes.length;
  const isSimulado = modo === "simulado";
  const isEstudo = modo === "estudo";
  const minutosRestantes = tempoRestante / (60 * 1000);
  const alertaTempo = isSimulado && minutosRestantes <= ALERTA_MINUTOS;

  const alternativas = questao
    ? Object.entries(questao.alternativas).sort(([a], [b]) =>
        a.localeCompare(b),
      )
    : [];

  const resetQuestao = useCallback(() => {
    setSelecionada(null);
    setConfirmada(false);
    setRevelada(false);
    setAlternativasVisiveis(isSimulado);
  }, [isSimulado]);

  const selecionar = useCallback(
    (letra: string) => {
      if (confirmada || !alternativasVisiveis) return;
      setSelecionada(letra);
    },
    [confirmada, alternativasVisiveis],
  );

  const confirmar = useCallback(() => {
    if (!selecionada || !questao) return;
    setConfirmada(true);
    if (isEstudo) {
      setRevelada(true);
      const acertou = selecionada === questao.gabarito;
      if (acertou) setAcertos((n) => n + 1);
      else setErros((n) => n + 1);
    }
  }, [selecionada, questao, isEstudo]);

  const proxima = useCallback(() => {
    if (indice < total - 1) {
      setIndice((i) => i + 1);
      resetQuestao();
    }
  }, [indice, total, resetQuestao]);

  const anterior = useCallback(() => {
    if (indice > 0) {
      setIndice((i) => i - 1);
      resetQuestao();
    }
  }, [indice, resetQuestao]);

  useEffect(() => {
    if (!isSimulado) return;

    const tick = () => setTempoRestante(fimMs - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isSimulado, fimMs]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (!LETRAS.includes(key as (typeof LETRAS)[number])) return;

      if (e.key === "Enter" && selecionada && !confirmada) {
        confirmar();
        return;
      }

      if (!confirmada && alternativasVisiveis) {
        selecionar(key);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selecionar, confirmar, selecionada, confirmada, alternativasVisiveis]);

  if (!questao) {
    return (
      <p className="p-8 text-center text-muted-foreground">
        Nenhuma questão disponível.
      </p>
    );
  }

  const acertou = revelada && selecionada === questao.gabarito;
  const ultimaQuestao = indice === total - 1;

  return (
    <div className="flex flex-1 flex-col">
      {isSimulado && (
        <>
          <SimuladoBar
            questaoAtual={indice + 1}
            totalQuestoes={total}
            tempoRestante={formatarTempo(tempoRestante)}
            alertaTempo={alertaTempo}
          />
          {alertaTempo && (
            <Alert
              variant="destructive"
              className="mx-4 mt-3 max-w-3xl self-center"
            >
              <AlertTitle>Menos de 30 minutos</AlertTitle>
              <AlertDescription>
                Revise as questões marcadas antes do fim do tempo.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {isEstudo && (
        <SessaoBar
          atual={indice + 1}
          total={total}
          acertos={acertos}
          erros={erros}
        />
      )}

      <article className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {DISCIPLINA_LABELS[questao.disciplina]}
            </Badge>
            {isEstudo && (
              <span className="text-sm text-muted-foreground tabular-nums">
                Questão {indice + 1}/{total}
              </span>
            )}
          </div>
          {isEstudo && <FocusModeToggle />}
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="text-lg leading-relaxed">{questao.enunciado}</p>
        </div>

        {isEstudo && !alternativasVisiveis ? (
          <RecallGate onReveal={() => setAlternativasVisiveis(true)} />
        ) : (
          <fieldset className="flex flex-col gap-2 border-t border-border px-4 py-4">
            <legend className="sr-only">Alternativas</legend>
            {alternativas.map(([letra, texto]) => (
              <AlternativaButton
                key={letra}
                letra={letra}
                texto={texto}
                selecionada={selecionada === letra}
                revelada={revelada}
                correta={letra === questao.gabarito}
                desabilitada={
                  confirmada && isEstudo && selecionada !== letra
                }
                onSelect={selecionar}
              />
            ))}
          </fieldset>
        )}

        {isEstudo && revelada && questao.comentario && (
          <div className="border-t border-border px-4 py-4">
            <FeedbackElaborado
              acertou={acertou}
              gabarito={questao.gabarito}
              comentario={questao.comentario}
            />
          </div>
        )}

        <footer className="flex gap-2 border-t border-border p-4">
          {(isSimulado || indice > 0) && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={anterior}
              disabled={indice === 0}
            >
              Anterior
            </Button>
          )}

          {!alternativasVisiveis ? null : !confirmada ? (
            <Button
              className="flex-1"
              onClick={confirmar}
              disabled={!selecionada}
            >
              {isEstudo ? "Confirmar resposta" : "Marcar"}
            </Button>
          ) : (
            <Button
              className="flex-1"
              onClick={proxima}
              disabled={ultimaQuestao}
            >
              {ultimaQuestao ? "Última questão" : "Próxima"}
            </Button>
          )}
        </footer>
      </article>
    </div>
  );
}
