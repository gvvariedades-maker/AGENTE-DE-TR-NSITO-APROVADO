"use client";

import { useActionState, useState } from "react";
import {
  resetDesempenho,
  type ResetDesempenhoState,
} from "@/app/actions/desempenho";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ResetDesempenhoFormProps {
  temHistorico: boolean;
}

const initialState: ResetDesempenhoState = {};

const inputClassName =
  "h-10 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60";

export function ResetDesempenhoForm({ temHistorico }: ResetDesempenhoFormProps) {
  const [state, formAction, pending] = useActionState(
    resetDesempenho,
    initialState,
  );
  const [confirmacao, setConfirmacao] = useState("");

  const confirmado = confirmacao === "ZERAR";

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive">Zerar desempenho</CardTitle>
        <CardDescription>
          Remove todo o histórico de estudo desta conta: tentativas, revisões
          SRS, simulados e sessões. As questões do banco não são afetadas.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {!temHistorico ? (
          <p className="text-sm text-muted-foreground">
            Você ainda não tem histórico para apagar.
          </p>
        ) : (
          <form action={formAction} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">
                Digite <strong className="text-foreground">ZERAR</strong> para
                confirmar
              </span>
              <input
                type="text"
                name="confirmacao"
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                autoComplete="off"
                disabled={pending}
                placeholder="ZERAR"
                className={inputClassName}
              />
            </label>

            {state.error && (
              <p className="text-sm text-destructive" role="alert">
                {state.error}
              </p>
            )}

            <Button
              type="submit"
              variant="destructive"
              disabled={pending || !confirmado}
            >
              {pending ? "Zerando…" : "Zerar todo o histórico"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
