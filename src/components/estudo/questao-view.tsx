"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { ArrowLeft, Flag } from "lucide-react";
import { salvarTentativa } from "@/app/actions/estudo";
import { concluirSessaoEstudo } from "@/app/actions/study-session";
import {
  finalizarSimulado,
  type FinalizarSimuladoResult,
} from "@/app/actions/simulado";
import { labelTipoErro } from "@/lib/estudo-reverso-utils";
import {
  contarMarcadasRevisao,
  contarRespondidas,
  getEstadoQuestao,
  type EstadoQuestao,
} from "@/lib/estado-questao";
import { montarRespostasSimulado } from "@/lib/simulado-nota";
import { SimuladoResultado } from "@/components/estudo/simulado-resultado";
import { SimuladoBriefing } from "@/components/estudo/simulado-briefing";
import { DISCIPLINA_LABELS, type Disciplina } from "@/types";
import type { QuestaoUI } from "@/lib/questoes";
import type { MetaCadernoEspelho } from "@/lib/simulado-caderno";
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
import {
  escolherTrilhaEstudoReverso,
  LABEL_TRILHA_ESTUDO_REVERSO_COMPLETO,
} from "@/lib/estudo-reverso-visual-trilha";
import type { FsrsGrade } from "@/lib/srs";
import type { EstudoReversoVisual } from "@/types/estudo-reverso-visual";
import { FocusModeToggle } from "@/components/estudo/focus-mode-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BadgeQuestaoReal } from "@/components/estudo/badge-questao-real";
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
  /** Total esperado no espelho (ex.: 60) — usado no briefing. */
  totalEsperado?: number;
  /** Questões reais IDECAN neste caderno (quando disponíveis no banco). */
  questoesReaisCount?: number;
  /** Meta do montador de caderno (mix, reuso). */
  metaCaderno?: MetaCadernoEspelho;
  /** Ex.: "Revisão agendada" no modo só-revisões. */
  rotuloSessao?: string;
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
const TOTAL_ESPELHO = 60;

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
  totalEsperado = TOTAL_ESPELHO,
  questoesReaisCount = 0,
  metaCaderno,
  rotuloSessao,
}: QuestaoViewProps) {
  const isSimulado = modo === "simulado";
  const isEstudo = modo === "estudo";

  const [lista] = useState(questoesIniciais);
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
  const [provaIniciada, setProvaIniciada] = useState(!isSimulado);
  const [provaEncerrada, setProvaEncerrada] = useState(false);
  const [duracaoLabel, setDuracaoLabel] = useState("");
  const [cartaoMobileAberto, setCartaoMobileAberto] = useState(false);
  const [confirmandoEntrega, setConfirmandoEntrega] = useState(false);
  const [fimMs, setFimMs] = useState<number | null>(null);
  const [tempoRestante, setTempoRestante] = useState(
    duracaoMinutos ? duracaoMinutos * 60 * 1000 : DURACAO_SIMULADO_MS,
  );

  const inicioQuestaoRef = useRef(Date.now());
  const inicioSimuladoRef = useRef(Date.now());
  const finalizadoRef = useRef(false);
  const fimProvaMsRef = useRef<number | null>(null);

  const questao = lista[indice];
  const total = lista.length;
  const minutosRestantes = tempoRestante / (60 * 1000);
  const alertaTempo =
    isSimulado && provaIniciada && !provaEncerrada && minutosRestantes <= ALERTA_MINUTOS;

  const estado = questao ? getEstadoQuestao(estados, questao.id) : null;
  const selecionada = estado?.selecionada ?? null;
  const confirmada = estado?.confirmada ?? false;
  const revelada = estado?.revelada ?? false;
  const marcadaRevisao = estado?.marcadaRevisao ?? false;
  const dominioAlcancado = estado?.dominioAlcancado ?? false;
  const tipoErroLabel = estado?.tipoErroLabel;
  const ultimoAttemptId = estado?.ultimoAttemptId;

  const respondidas = useMemo(
    () => contarRespondidas(estados),
    [estados],
  );

  const marcadasRevisao = useMemo(
    () => contarMarcadasRevisao(estados),
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

  const irPara = useCallback(
    (novoIndice: number) => {
      if (novoIndice < 0 || novoIndice >= lista.length) return;
      setModoReverso(false);
      setTrilhaReversoAtiva(null);
      setAguardandoConfianca(false);
      setIndice(novoIndice);
      inicioQuestaoRef.current = Date.now();
      setCartaoMobileAberto(false);
    },
    [lista.length],
  );

  const selecionar = useCallback(
    (letra: string) => {
      if (!questao) return;
      if (isEstudo && confirmada) return;
      patchEstado(questao.id, { selecionada: letra });
    },
    [questao, isEstudo, confirmada, patchEstado],
  );

  const toggleRevisao = useCallback(() => {
    if (!questao || !isSimulado) return;
    patchEstado(questao.id, { marcadaRevisao: !marcadaRevisao });
  }, [questao, isSimulado, marcadaRevisao, patchEstado]);

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
      patchEstado(questao.id, { confirmada: true, selecionada });
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
  }, [selecionada, questao, isEstudo, isSimulado, patchEstado]);

  const concluirSessaoHandler = useCallback(() => {
    if (!sessionId || sessaoConcluida) return;
    setSessaoConcluida(true);
    void concluirSessaoEstudo(sessionId);
  }, [sessionId, sessaoConcluida]);

  const encerrarProva = useCallback(() => {
    if (fimProvaMsRef.current !== null) return;
    const agora = Date.now();
    fimProvaMsRef.current = agora;
    setProvaEncerrada(true);
    setTempoRestante(Math.max(0, (fimMs ?? agora) - agora));
    setDuracaoLabel(formatarTempo(agora - inicioSimuladoRef.current));
  }, [fimMs]);

  const finalizarSimuladoHandler = useCallback(() => {
    if (!isSimulado || finalizadoRef.current) return;
    finalizadoRef.current = true;
    setConfirmandoEntrega(false);
    encerrarProva();

    const respostas = montarRespostasSimulado(lista, marcacoesSimulado);
    const duracaoMin = Math.max(
      1,
      Math.round(
        ((fimProvaMsRef.current ?? Date.now()) - inicioSimuladoRef.current) /
          60_000,
      ),
    );

    startFinalizar(async () => {
      const result = await finalizarSimulado({ respostas, duracaoMin });
      setResultadoSimulado(result);
      delete document.documentElement.dataset.foco;
    });
  }, [isSimulado, lista, marcacoesSimulado, encerrarProva]);

  const iniciarProva = useCallback(() => {
    const ms = (duracaoMinutos ?? 240) * 60 * 1000;
    inicioSimuladoRef.current = Date.now();
    inicioQuestaoRef.current = Date.now();
    setFimMs(Date.now() + ms);
    setTempoRestante(ms);
    setProvaIniciada(true);
  }, [duracaoMinutos]);

  const proxima = useCallback(() => {
    irPara(indice + 1);
  }, [indice, irPara]);

  const anterior = useCallback(() => {
    irPara(indice - 1);
  }, [indice, irPara]);

  // Modo foco automático na sala de prova
  useEffect(() => {
    if (!isSimulado || !provaIniciada || resultadoSimulado) return;
    document.documentElement.dataset.foco = "true";
    return () => {
      delete document.documentElement.dataset.foco;
    };
  }, [isSimulado, provaIniciada, resultadoSimulado]);

  useEffect(() => {
    if (!isSimulado || !provaIniciada || fimMs === null || provaEncerrada) return;

    const tick = () => setTempoRestante(fimMs - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isSimulado, provaIniciada, fimMs, provaEncerrada]);

  // Auto-entrega ao zerar o tempo
  useEffect(() => {
    if (!isSimulado || !provaIniciada || provaEncerrada || resultadoSimulado) return;
    if (tempoRestante > 0) return;
    finalizarSimuladoHandler();
  }, [
    isSimulado,
    provaIniciada,
    provaEncerrada,
    tempoRestante,
    resultadoSimulado,
    finalizarSimuladoHandler,
  ]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (!provaIniciada && isSimulado) return;

      const bloqueiaSelecaoEstudo =
        isEstudo && confirmada && (aguardandoConfianca || revelada);

      if (e.key === "Enter" && selecionada && !(isEstudo && confirmada)) {
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

      if (bloqueiaSelecaoEstudo) return;

      const letra = TECLA_PARA_LETRA[e.key.toUpperCase()];
      if (!letra) return;
      if (isEstudo && confirmada) return;

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
    isSimulado,
    indice,
    total,
    questao,
    provaIniciada,
    aguardandoConfianca,
    revelada,
  ]);

  if (resultadoSimulado) {
    return (
      <SimuladoResultado
        data={resultadoSimulado}
        duracaoLabel={duracaoLabel}
      />
    );
  }

  if (isSimulado && !provaIniciada) {
    return (
      <SimuladoBriefing
        totalQuestoes={total}
        totalEsperado={totalEsperado}
        questoesReaisCount={questoesReaisCount}
        metaCaderno={metaCaderno}
        isDemo={isDemo || total < totalEsperado}
        duracaoHoras={(duracaoMinutos ?? 240) / 60}
        onIniciar={iniciarProva}
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
  const mostrarProxima =
    navegacaoLateral && !ultimaQuestao && !aguardandoConfianca;
  const mostrarConcluirSessao = isEstudo && ultimaQuestao && confirmada;
  const emBranco = Math.max(0, total - respondidas);
  const botaoMarcarLabel =
    isSimulado && confirmada ? "Alterar resposta" : isEstudo ? "Confirmar resposta" : "Responder";

  const cartao = (
    <MapaQuestoes
      total={total}
      indiceAtual={indice}
      questaoIds={questaoIds}
      estados={estados}
      onIrPara={irPara}
      variante={isSimulado ? "prova" : "estudo"}
    />
  );

  return (
    <div className="flex flex-1 flex-col">
      {isSimulado && (
        <>
          <SimuladoBar
            questaoAtual={indice + 1}
            totalQuestoes={total}
            respondidas={respondidas}
            marcadasRevisao={marcadasRevisao}
            tempoRestante={formatarTempo(tempoRestante)}
            alertaTempo={alertaTempo}
            cartaoAberto={cartaoMobileAberto}
            onToggleCartao={() => setCartaoMobileAberto((v) => !v)}
            onFinalizar={() => setConfirmandoEntrega(true)}
            finalizando={finalizando}
          />
          {cartaoMobileAberto && (
            <div className="border-b border-border bg-card px-3 py-3 lg:hidden">
              {cartao}
            </div>
          )}
          {alertaTempo && (
            <Alert
              variant="destructive"
              className="mx-4 mt-3 max-w-6xl self-center"
            >
              <AlertTitle>Menos de 30 minutos</AlertTitle>
              <AlertDescription>
                Revise as questões marcadas (amarelo) e entregue a prova antes
                do fim do tempo. Ao zerar o cronômetro, a prova é entregue
                automaticamente.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {isEstudo && (
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center px-4 pt-2.5 pb-1">
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "min-h-9 gap-1.5 border-transito/50 bg-background font-semibold text-transito shadow-sm hover:bg-transito/10 hover:text-transito",
              )}
            >
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
              Voltar
            </Link>
          </div>
          <SessaoBar
            atual={indice + 1}
            total={total}
            respondidas={respondidas}
          />
          {cartao}
        </div>
      )}

      {confirmandoEntrega && isSimulado && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="entrega-titulo"
        >
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-lg">
            <h2 id="entrega-titulo" className="text-lg font-semibold">
              Entregar prova?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {emBranco > 0
                ? `${emBranco} questão(ões) em branco serão contabilizadas como erro.`
                : "Todas as questões foram respondidas."}
              {marcadasRevisao > 0
                ? ` ${marcadasRevisao} ainda marcada(s) para revisão.`
                : ""}
            </p>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmandoEntrega(false)}
              >
                Continuar prova
              </Button>
              <Button
                type="button"
                onClick={finalizarSimuladoHandler}
                disabled={finalizando}
              >
                Confirmar entrega
              </Button>
            </div>
          </div>
        </div>
      )}

      <div
        className={cn(
          "mx-auto flex w-full flex-1",
          isSimulado ? "max-w-6xl gap-0 lg:gap-6 lg:px-4 lg:pt-4" : "max-w-3xl",
        )}
      >
        {isSimulado && (
          <aside className="hidden w-56 shrink-0 lg:block xl:w-64">
            <div className="sticky top-[7.5rem] rounded-xl border border-border bg-card p-3">
              {cartao}
            </div>
          </aside>
        )}

        <article className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-2 px-4 pt-3 pb-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="text-xs font-normal">
                {DISCIPLINA_LABELS[questao.disciplina]}
              </Badge>
              {rotuloSessao && (
                <Badge
                  variant="outline"
                  className="border-semaforo-amarelo/40 bg-semaforo-amarelo/10 text-xs font-normal text-semaforo-amarelo"
                >
                  {rotuloSessao}
                </Badge>
              )}
              {!isSimulado && <BadgeQuestaoReal tags={questao.tags} />}
              {isDemo && (
                <Badge variant="outline" className="text-xs font-normal">
                  Demonstração
                </Badge>
              )}
              {isSimulado && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  Item {indice + 1} de {total}
                </span>
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
              <div className="flex items-center justify-start">
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

              <div className="flex flex-col items-center gap-2">
                {isSimulado && (
                  <Button
                    type="button"
                    variant={marcadaRevisao ? "secondary" : "outline"}
                    size="sm"
                    className="gap-1.5"
                    onClick={toggleRevisao}
                    aria-pressed={marcadaRevisao}
                  >
                    <Flag
                      className={cn(
                        "size-3.5",
                        marcadaRevisao && "text-semaforo-amarelo",
                      )}
                      aria-hidden
                      fill={marcadaRevisao ? "currentColor" : "none"}
                    />
                    {marcadaRevisao ? "Revisão marcada" : "Marcar revisão"}
                  </Button>
                )}
                {(!confirmada || isSimulado) && (
                  <Button
                    size="lg"
                    className="min-w-40"
                    onClick={confirmar}
                    disabled={!selecionada || salvando}
                  >
                    {botaoMarcarLabel}
                  </Button>
                )}
                {isEstudo &&
                  confirmada &&
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
                      <span className="flex flex-col items-center gap-0.5 leading-tight">
                        <span>{LABEL_TRILHA_ESTUDO_REVERSO_COMPLETO}</span>
                        <span className="text-xs font-normal opacity-90">
                          {trilhaPadrao.telas.length} telas
                        </span>
                      </span>
                    </Button>
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
            {(isEstudo || isSimulado) && (
              <p className="mt-2 hidden text-center text-xs text-muted-foreground sm:block">
                Atalhos:{" "}
                <kbd className="rounded border border-border px-1">1–4</kbd> ou{" "}
                <kbd className="rounded border border-border px-1">A–D</kbd>{" "}
                selecionar ·{" "}
                <kbd className="rounded border border-border px-1">Enter</kbd>{" "}
                {isSimulado ? "responder" : "confirmar"} ·{" "}
                <kbd className="rounded border border-border px-1">←</kbd>
                <kbd className="rounded border border-border px-1">→</kbd>{" "}
                navegar
              </p>
            )}
          </footer>
        </article>
      </div>
    </div>
  );
}
