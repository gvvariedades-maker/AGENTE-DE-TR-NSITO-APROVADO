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
  const deltaPositivo =
    resumo.deltaAcerto !== null && resumo.deltaAcerto >= 0;

  return (
    <Card className="h-full border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Estudo reverso visual</CardTitle>
        <CardDescription>
          Aulas completas após responder questões
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {resumo.hasData ? (
          <>
            {resumo.amostrasPosVisual > 0 && resumo.deltaAcerto !== null ? (
              <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-center">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Ganho após a aula
                </p>
                <p
                  className={`mt-1 text-3xl font-bold tabular-nums ${
                    deltaPositivo
                      ? "text-semaforo-verde"
                      : "text-semaforo-vermelho"
                  }`}
                >
                  {resumo.deltaAcerto >= 0 ? "+" : ""}
                  {resumo.deltaAcerto} pp
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {resumo.taxaAcertoPreVisual ?? "—"}% pré →{" "}
                  {resumo.taxaAcertoPosVisual ?? "—"}% pós
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Conclua aulas após errar para medir o ganho de acerto.
              </p>
            )}

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
              <p className="text-center text-xs text-muted-foreground">
                Baseado em {resumo.amostrasPosVisual} reattempt(s) após aula
                completa
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
