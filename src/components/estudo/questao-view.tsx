"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { salvarTentativa } from "@/app/actions/estudo";
import {
  finalizarSimulado,
  type FinalizarSimuladoResult,
} from "@/app/actions/simulado";
import {
  intercalarIrmas,
  labelTipoErro,
} from "@/lib/estudo-reverso-utils";
import { montarRespostasSimulado } from "@/lib/simulado-nota";
import { SimuladoResultado } from "@/components/estudo/simulado-resultado";
import { DISCIPLINA_LABELS } from "@/types";
import type { QuestaoUI } from "@/lib/questoes";
import { AlternativaButton } from "@/components/estudo/alternativa-button";
import { SimuladoBar } from "@/components/estudo/simulado-bar";
import { SessaoBar } from "@/components/estudo/sessao-bar";
import { RecallGate } from "@/components/estudo/recall-gate";
import { FeedbackElaborado } from "@/components/estudo/feedback-elaborado";
import { EstudoReversoPlayer } from "@/components/estudo-reverso/estudo-reverso-player";
import { EstudoReversoTrigger } from "@/components/estudo-reverso/estudo-reverso-trigger";
import { registrarEstudoReverso } from "@/app/actions/estudo-reverso";
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

const TECLA_PARA_LETRA: Record<string, string> = {
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  E: "E",
  "1": "A",
  "2": "B",
  "3": "C",
  "4": "D",
  "5": "E",
};
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
  questoes: questoesIniciais,
  modo,
  indiceInicial = 0,
  duracaoMinutos,
}: QuestaoViewProps) {
  const [lista, setLista] = useState(questoesIniciais);
  const [indice, setIndice] = useState(indiceInicial);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [confirmada, setConfirmada] = useState(false);
  const [revelada, setRevelada] = useState(false);
  const [alternativasVisiveis, setAlternativasVisiveis] = useState(
    modo === "simulado",
  );
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [dominioAlcancado, setDominioAlcancado] = useState(false);
  const [tipoErroLabel, setTipoErroLabel] = useState<string | undefined>();
  const [modoReverso, setModoReverso] = useState(false);
  const [ultimoAttemptId, setUltimoAttemptId] = useState<string | undefined>();
  const [salvando, startSalvar] = useTransition();
  const [finalizando, startFinalizar] = useTransition();
  const [resultadoSimulado, setResultadoSimulado] =
    useState<FinalizarSimuladoResult | null>(null);
  const [marcacoesSimulado, setMarcacoesSimulado] = useState<
    Map<string, string>
  >(() => new Map());
  const inicioQuestaoRef = useRef(Date.now());
  const inicioSimuladoRef = useRef(Date.now());
  const [fimMs] = useState(
    () => Date.now() + (duracaoMinutos ?? 240) * 60 * 1000,
  );
  const [tempoRestante, setTempoRestante] = useState(
    duracaoMinutos ? duracaoMinutos * 60 * 1000 : DURACAO_SIMULADO_MS,
  );

  const questao = lista[indice];
  const total = lista.length;
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
    setDominioAlcancado(false);
    setTipoErroLabel(undefined);
    setModoReverso(false);
    setUltimoAttemptId(undefined);
    inicioQuestaoRef.current = Date.now();
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

    const acertou = selecionada === questao.gabarito;
    const tempoSeg = Math.round((Date.now() - inicioQuestaoRef.current) / 1000);

    setConfirmada(true);

    if (isEstudo) {
      setRevelada(true);
      if (acertou) setAcertos((n) => n + 1);
      else setErros((n) => n + 1);

      startSalvar(async () => {
        const result = await salvarTentativa({
          questionId: questao.id,
          resposta: selecionada,
          acertou,
          modo: "estudo",
          tempoSeg,
        });

        if (result.dominioAlcancado) setDominioAlcancado(true);
        if (result.tipoErro) setTipoErroLabel(labelTipoErro(result.tipoErro));
        if (result.attemptId) setUltimoAttemptId(result.attemptId);
        if (result.irmaAs?.length) {
          setLista((prev) => intercalarIrmas(prev, indice, result.irmaAs!));
        }
      });
    } else if (isSimulado) {
      setMarcacoesSimulado((prev) => {
        const next = new Map(prev);
        next.set(questao.id, selecionada);
        return next;
      });

      startSalvar(async () => {
        await salvarTentativa({
          questionId: questao.id,
          resposta: selecionada,
          acertou,
          modo: "simulado",
          tempoSeg,
        });
      });
    }
  }, [selecionada, questao, isEstudo, isSimulado, indice]);

  const finalizarSimuladoHandler = useCallback(() => {
    if (!isSimulado) return;

    const respostas = montarRespostasSimulado(lista, marcacoesSimulado);
    const duracaoMin = Math.max(
      1,
      Math.round((Date.now() - inicioSimuladoRef.current) / 60_000),
    );

    startFinalizar(async () => {
      const result = await finalizarSimulado({ respostas, duracaoMin });
      setResultadoSimulado(result);
    });
  }, [isSimulado, lista, marcacoesSimulado]);

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
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "Enter" && selecionada && !confirmada && alternativasVisiveis) {
        e.preventDefault();
        confirmar();
        return;
      }

      if (confirmada && isEstudo) {
        if (e.key === "ArrowRight" && indice < total - 1) {
          e.preventDefault();
          proxima();
        }
        if (e.key === "ArrowLeft" && indice > 0) {
          e.preventDefault();
          anterior();
        }
        return;
      }

      const letra = TECLA_PARA_LETRA[e.key.toUpperCase()];
      if (!letra || !alternativasVisiveis || confirmada) return;

      const letrasQuestao = Object.keys(questao?.alternativas ?? {});
      if (!letrasQuestao.includes(letra)) return;

      e.preventDefault();
      selecionar(letra);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    selecionar,
    confirmar,
    proxima,
    anterior,
    selecionada,
    confirmada,
    alternativasVisiveis,
    isEstudo,
    indice,
    total,
    questao,
  ]);

  if (resultadoSimulado) {
    const duracaoMs = Date.now() - inicioSimuladoRef.current;
    return (
      <SimuladoResultado
        data={resultadoSimulado}
        duracaoLabel={formatarTempo(duracaoMs)}
      />
    );
  }

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
              dominioAlcancado={dominioAlcancado}
              tipoErroLabel={tipoErroLabel}
            />
          </div>
        )}

        {isEstudo && revelada && questao.estudoReversoVisual && (
          <EstudoReversoTrigger
            acertou={acertou}
            onOpen={() => setModoReverso(true)}
          />
        )}

        {modoReverso && questao.estudoReversoVisual && (
          <EstudoReversoPlayer
            visual={questao.estudoReversoVisual}
            onFechar={() => setModoReverso(false)}
            onConcluir={async (dados) => {
              await registrarEstudoReverso({
                questionId: questao.id,
                attemptId: ultimoAttemptId,
                telasVistas: dados.telasVistas,
                recallAcertou: dados.recallAcertou,
                tempoTotalSeg: dados.tempoTotalSeg,
                concluido: dados.concluido,
              });
            }}
          />
        )}

        <footer className="flex flex-col gap-2 border-t border-border p-4">
          <div className="flex gap-2">
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
              disabled={!selecionada || salvando}
            >
              {isEstudo ? "Confirmar resposta" : "Marcar"}
            </Button>
          ) : isSimulado && ultimaQuestao ? (
            <Button
              className="flex-1"
              onClick={finalizarSimuladoHandler}
              disabled={finalizando}
            >
              Finalizar simulado
            </Button>
          ) : (
            <Button
              className="flex-1"
              onClick={proxima}
              disabled={ultimaQuestao}
            >
              Próxima
            </Button>
          )}
          </div>
          {isEstudo && (
            <p className="hidden text-center text-xs text-muted-foreground sm:block">
              Atalhos:{" "}
              <kbd className="rounded border border-border px-1">1–4</kbd> ou{" "}
              <kbd className="rounded border border-border px-1">A–D</kbd>{" "}
              selecionar ·{" "}
              <kbd className="rounded border border-border px-1">Enter</kbd>{" "}
              confirmar ·{" "}
              <kbd className="rounded border border-border px-1">←</kbd>
              <kbd className="rounded border border-border px-1">→</kbd>{" "}
              navegar
            </p>
          )}
        </footer>
      </article>
    </div>
  );
}
