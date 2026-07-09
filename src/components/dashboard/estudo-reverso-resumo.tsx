"use client";

import type { EstudoReversoResumo } from "@/lib/retencao";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EstudoReversoResumoCardProps {
  resumo: EstudoReversoResumo;
}

export function EstudoReversoResumoCard({ resumo }: EstudoReversoResumoCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Estudo reverso visual</CardTitle>
        <CardDescription>
          Aulas completas concluídas após responder questões
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {resumo.hasData ? (
          <>
            <dl className="grid grid-cols-2 gap-3 text-center">
              <div>
                <dt className="text-xs text-muted-foreground">Sessões</dt>
                <dd className="text-2xl font-bold tabular-nums">
                  {resumo.sessoesTotal}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Concluídas</dt>
                <dd className="text-2xl font-bold tabular-nums text-transito-foreground">
                  {resumo.taxaConclusao}%
                </dd>
              </div>
            </dl>

            {resumo.amostrasPosVisual > 0 && (
              <dl className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-muted/20 p-3 text-center">
                <div>
                  <dt className="text-xs text-muted-foreground">Acerto pré-visual</dt>
                  <dd className="text-lg font-semibold tabular-nums">
                    {resumo.taxaAcertoPreVisual ?? "—"}%
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Acerto pós-visual</dt>
                  <dd className="text-lg font-semibold tabular-nums text-semaforo-verde">
                    {resumo.taxaAcertoPosVisual ?? "—"}%
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Delta</dt>
                  <dd
                    className={`text-lg font-semibold tabular-nums ${
                      resumo.deltaAcerto !== null && resumo.deltaAcerto >= 0
                        ? "text-semaforo-verde"
                        : "text-semaforo-vermelho"
                    }`}
                  >
                    {resumo.deltaAcerto !== null
                      ? `${resumo.deltaAcerto >= 0 ? "+" : ""}${resumo.deltaAcerto} pp`
                      : "—"}
                  </dd>
                </div>
              </dl>
            )}
            {resumo.amostrasPosVisual > 0 && (
              <p className="text-center text-xs text-muted-foreground">
                Baseado em {resumo.amostrasPosVisual} reattempt(s) após aula completa
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Após responder uma questão, a aula completa de estudo reverso abre
            automaticamente para fixar o microtópico.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
