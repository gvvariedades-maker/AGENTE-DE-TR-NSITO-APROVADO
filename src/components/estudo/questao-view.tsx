"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { salvarTentativa } from "@/app/actions/estudo";
import { concluirSessaoEstudo } from "@/app/actions/study-session";
import {
  finalizarSimulado,
  type FinalizarSimuladoResult,
} from "@/app/actions/simulado";
import {
  labelTipoErro,
} from "@/lib/estudo-reverso-utils";
import {
  contarRespondidas,
  contarResultados,
  getEstadoQuestao,
  type EstadoQuestao,
} from "@/lib/estado-questao";
import { montarRespostasSimulado } from "@/lib/simulado-nota";
import { SimuladoResultado } from "@/components/estudo/simulado-resultado";
import { hrefEstudoCatalogo } from "@/lib/estudo-links";
import { DISCIPLINA_LABELS, type Disciplina } from "@/types";
import type { QuestaoUI } from "@/lib/questoes";
import { AlternativaButton } from "@/components/estudo/alternativa-button";
import { EnunciadoFormatado } from "@/components/estudo/enunciado-formatado";
import { MapaQuestoes } from "@/components/estudo/mapa-questoes";
import { SimuladoBar } from "@/components/estudo/simulado-bar";
import { SessaoBar } from "@/components/estudo/sessao-bar";
import { FeedbackElaborado } from "@/components/estudo/feedback-elaborado";
import { FeedbackResultado } from "@/components/estudo/feedback-resultado";
import { EstudoReversoPlayer } from "@/components/estudo-reverso/estudo-reverso-player";
import { ConfiancaFsrs } from "@/components/estudo/confianca-fsrs";
import { registrarEstudoReverso } from "@/app/actions/estudo-reverso";
import { escolherTrilhaEstudoReverso } from "@/lib/estudo-reverso-visual-trilha";
import type { FsrsGrade } from "@/lib/srs";
import type { EstudoReversoVisual } from "@/types/estudo-reverso-visual";
import { FocusModeToggle } from "@/components/estudo/focus-mode-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export type ModoQuestao = "estudo" | "simulado";

interface QuestaoViewProps {
  questoes: QuestaoUI[];
  modo: ModoQuestao;
  indiceInicial?: number;
  duracaoMinutos?: number;
  isDemo?: boolean;
  sessionId?: string;
  /** Disciplina para link de volta ao catálogo de microtópicos. */
  catalogoDisciplina?: Disciplina;
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
  isDemo = false,
  sessionId,
  catalogoDisciplina,
}: QuestaoViewProps) {
  const [lista, setLista] = useState(questoesIniciais);
  const [indice, setIndice] = useState(indiceInicial);
  const [estados, setEstados] = useState<Map<string, EstadoQuestao>>(
    () => new Map(),
  );
  const [modoReverso, setModoReverso] = useState(false);
  const [trilhaReversoAtiva, setTrilhaReversoAtiva] =
    useState<EstudoReversoVisual | null>(null);
  const [aguardandoConfianca, setAguardandoConfianca] = useState(false);
  const [salvando, startSalvar] = useTransition();
  const [finalizando, startFinalizar] = useTransition();
  const [resultadoSimulado, setResultadoSimulado] =
    useState<FinalizarSimuladoResult | null>(null);
  const [sessaoConcluida, setSessaoConcluida] = useState(false);
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

  const estado = questao ? getEstadoQuestao(estados, questao.id) : null;
  const selecionada = estado?.selecionada ?? null;
  const confirmada = estado?.confirmada ?? false;
  const revelada = estado?.revelada ?? false;
  const dominioAlcancado = estado?.dominioAlcancado ?? false;
  const tipoErroLabel = estado?.tipoErroLabel;
  const ultimoAttemptId = estado?.ultimoAttemptId;

  const { acertos, erros } = useMemo(
    () => contarResultados(estados),
    [estados],
  );

  const respondidas = useMemo(
    () => contarRespondidas(estados),
    [estados],
  );

  const questaoIds = useMemo(() => lista.map((q) => q.id), [lista]);

  const alternativas = questao
    ? Object.entries(questao.alternativas).sort(([a], [b]) =>
        a.localeCompare(b),
      )
    : [];

  const patchEstado = useCallback(
    (questionId: string, patch: Partial<EstadoQuestao>) => {
      setEstados((prev) => {
        const next = new Map(prev);
        next.set(questionId, {
          ...getEstadoQuestao(prev, questionId),
          ...patch,
        });
        return next;
      });
    },
    [],
  );

  const irPara = useCallback((novoIndice: number) => {
    if (novoIndice < 0 || novoIndice >= lista.length) return;
    setModoReverso(false);
    setTrilhaReversoAtiva(null);
    setAguardandoConfianca(false);
    setIndice(novoIndice);
    inicioQuestaoRef.current = Date.now();
  }, [lista.length]);

  const selecionar = useCallback(
    (letra: string) => {
      if (!questao || confirmada) return;
      patchEstado(questao.id, { selecionada: letra });
    },
    [questao, confirmada, patchEstado],
  );

  const salvarComConfianca = useCallback(
    (fsrsGrade: FsrsGrade) => {
      if (!selecionada || !questao || !isEstudo) return;

      const acertou = selecionada === questao.gabarito;
      const tempoSeg = Math.round(
        (Date.now() - inicioQuestaoRef.current) / 1000,
      );

      setAguardandoConfianca(false);

      startSalvar(async () => {
        const result = await salvarTentativa({
          questionId: questao.id,
          resposta: selecionada,
          acertou,
          modo: "estudo",
          tempoSeg,
          sessionId,
          fsrsGrade,
        });

        patchEstado(questao.id, {
          dominioAlcancado: result.dominioAlcancado ?? false,
          tipoErroLabel: result.tipoErro
            ? labelTipoErro(result.tipoErro)
            : undefined,
          ultimoAttemptId: result.attemptId,
        });

        if (questao.estudoReversoVisual || questao.estudoReversoVisualCompleto) {
          const trilha = escolherTrilhaEstudoReverso(
            questao.estudoReversoVisual,
            questao.estudoReversoVisualCompleto,
          );
          if (trilha) {
            setTrilhaReversoAtiva(trilha);
            setModoReverso(true);
          }
        }
      });
    },
    [selecionada, questao, isEstudo, patchEstado, sessionId],
  );

  const confirmar = useCallback(() => {
    if (!selecionada || !questao) return;

    const acertou = selecionada === questao.gabarito;
    const tempoSeg = Math.round((Date.now() - inicioQuestaoRef.current) / 1000);

    if (isEstudo) {
      patchEstado(questao.id, {
        confirmada: true,
        revelada: true,
        acertou,
      });
      setAguardandoConfianca(true);
    } else if (isSimulado) {
      patchEstado(questao.id, { confirmada: true });
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
  }, [selecionada, questao, isEstudo, isSimulado, indice, patchEstado, sessionId]);

  const concluirSessaoHandler = useCallback(() => {
    if (!sessionId || sessaoConcluida) return;
    setSessaoConcluida(true);
    void concluirSessaoEstudo(sessionId);
  }, [sessionId, sessaoConcluida]);

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
    irPara(indice + 1);
  }, [indice, irPara]);

  const anterior = useCallback(() => {
    irPara(indice - 1);
  }, [indice, irPara]);

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

      if (e.key === "Enter" && selecionada && !confirmada) {
        e.preventDefault();
        confirmar();
        return;
      }

      if (isEstudo || isSimulado) {
        if (e.key === "ArrowRight" && indice < total - 1) {
          e.preventDefault();
          proxima();
          return;
        }
        if (e.key === "ArrowLeft" && indice > 0) {
          e.preventDefault();
          anterior();
          return;
        }
      }

      if (confirmada && isEstudo && aguardandoConfianca) return;

      if (confirmada && isEstudo) return;

      const letra = TECLA_PARA_LETRA[e.key.toUpperCase()];
      if (!letra || confirmada) return;

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
  const temEstudoReverso = Boolean(
    questao.estudoReversoVisualCompleto ?? questao.estudoReversoVisual,
  );
  const trilhaPadrao =
    questao.estudoReversoVisualCompleto ?? questao.estudoReversoVisual;
  const navegacaoLateral = isEstudo || isSimulado;
  const mostrarBotaoFinalizar =
    confirmada && isSimulado && ultimaQuestao;
  const mostrarProxima =
    navegacaoLateral &&
    !mostrarBotaoFinalizar &&
    !ultimaQuestao &&
    !aguardandoConfianca;
  const mostrarConcluirSessao = isEstudo && ultimaQuestao && confirmada;
  const disciplinaCatalogo =
    catalogoDisciplina ?? (isEstudo ? questao.disciplina : undefined);
  const hrefCatalogo = disciplinaCatalogo
    ? hrefEstudoCatalogo(disciplinaCatalogo)
    : null;

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
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
          <SessaoBar
            atual={indice + 1}
            total={total}
            respondidas={respondidas}
            acertos={acertos}
            erros={erros}
          />
          <MapaQuestoes
            total={total}
            indiceAtual={indice}
            questaoIds={questaoIds}
            estados={estados}
            onIrPara={irPara}
          />
        </div>
      )}

      <article className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <header className="flex items-center justify-between gap-2 px-4 pt-3 pb-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-xs font-normal">
              {DISCIPLINA_LABELS[questao.disciplina]}
            </Badge>
            {isDemo && (
              <Badge variant="outline" className="text-xs font-normal">
                Demonstração
              </Badge>
            )}
          </div>
          {isEstudo && <FocusModeToggle />}
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <EnunciadoFormatado enunciado={questao.enunciado} />
        </div>

        <fieldset className="flex flex-col gap-2 px-4 py-3">
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
                confirmada &&
                isEstudo &&
                letra !== questao.gabarito &&
                letra !== selecionada
              }
              onSelect={selecionar}
            />
          ))}
        </fieldset>

        {isEstudo && revelada && aguardandoConfianca && (
          <div className="px-4 pb-2">
            <ConfiancaFsrs
              acertou={acertou}
              onSelecionar={salvarComConfianca}
              disabled={salvando}
            />
          </div>
        )}

        {isEstudo && revelada && !aguardandoConfianca && (
          <div className="px-4 pb-2">
            {temEstudoReverso ? (
              <FeedbackResultado
                acertou={acertou}
                gabarito={questao.gabarito}
                dominioAlcancado={dominioAlcancado}
                tipoErroLabel={tipoErroLabel}
              />
            ) : (
              questao.comentario && (
                <FeedbackElaborado
                  acertou={acertou}
                  gabarito={questao.gabarito}
                  comentario={questao.comentario}
                  dominioAlcancado={dominioAlcancado}
                  tipoErroLabel={tipoErroLabel}
                />
              )
            )}
          </div>
        )}


        {modoReverso && trilhaReversoAtiva && (
          <EstudoReversoPlayer
            visual={trilhaReversoAtiva}
            onFechar={() => {
              setModoReverso(false);
              setTrilhaReversoAtiva(null);
            }}
            onConcluir={async (dados) => {
              await registrarEstudoReverso({
                questionId: questao.id,
                attemptId: ultimoAttemptId,
                telasVistas: dados.telasVistas,
                tempoTotalSeg: dados.tempoTotalSeg,
                concluido: dados.concluido,
              });
            }}
          />
        )}

        <footer className="sticky bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur-sm">
          <div className="grid grid-cols-3 items-center gap-2">
            <div className="flex flex-col items-start gap-1">
              {isEstudo && hrefCatalogo && (
                <Link
                  href={hrefCatalogo}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "whitespace-nowrap",
                  )}
                >
                  Microtópicos
                </Link>
              )}
              {navegacaoLateral && indice > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={anterior}
                >
                  Anterior
                </Button>
              )}
            </div>

            <div className="flex justify-center">
              {!confirmada ? (
                <Button
                  size="lg"
                  className="min-w-40"
                  onClick={confirmar}
                  disabled={!selecionada || salvando}
                >
                  {isEstudo ? "Confirmar resposta" : "Marcar"}
                </Button>
              ) : mostrarBotaoFinalizar ? (
                <Button
                  size="lg"
                  className="min-w-40"
                  onClick={finalizarSimuladoHandler}
                  disabled={finalizando}
                >
                  Finalizar simulado
                </Button>
              ) : (
                isEstudo &&
                revelada &&
                !aguardandoConfianca &&
                temEstudoReverso &&
                trilhaPadrao && (
                  <Button
                    type="button"
                    size="lg"
                    className="w-full min-w-40"
                    variant={acertou ? "outline" : "default"}
                    onClick={() => {
                      setTrilhaReversoAtiva(trilhaPadrao);
                      setModoReverso(true);
                    }}
                  >
                    Aula completa ({trilhaPadrao.telas.length} telas)
                  </Button>
                )
              )}
            </div>

            <div className="flex justify-end">
              {mostrarProxima && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={proxima}
                >
                  Próxima
                </Button>
              )}

              {mostrarConcluirSessao && (
                <Link
                  href="/dashboard"
                  onClick={concluirSessaoHandler}
                  className={cn(
                    buttonVariants({
                      variant: "ghost",
                      size: "sm",
                    }),
                    "text-muted-foreground",
                  )}
                >
                  Concluir sessão
                </Link>
              )}
            </div>
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
