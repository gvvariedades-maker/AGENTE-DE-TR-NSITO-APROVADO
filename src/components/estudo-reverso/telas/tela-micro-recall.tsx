"use client";

import { useState } from "react";
import type { ConteudoMicroRecall } from "@/types/estudo-reverso-visual";
import { validarMicroRecall } from "@/lib/recall-match";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TelaMicroRecallProps {
  conteudo: ConteudoMicroRecall;
  onResultado: (acertou: boolean) => void;
}

export function TelaMicroRecall({ conteudo, onResultado }: TelaMicroRecallProps) {
  const [resposta, setResposta] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [acertou, setAcertou] = useState(false);

  const confirmar = () => {
    const ok = validarMicroRecall(
      resposta,
      conteudo.resposta_esperada,
      conteudo.aceitar_variacoes,
    );
    setAcertou(ok);
    setEnviado(true);
    onResultado(ok);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{conteudo.pergunta}</p>
      {!enviado ? (
        <>
          <input
            type="text"
            value={resposta}
            onChange={(e) => setResposta(e.target.value)}
            placeholder="Digite sua resposta..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && resposta.trim() && confirmar()}
          />
          {conteudo.dica && (
            <p className="text-xs text-muted-foreground">Dica: {conteudo.dica}</p>
          )}
          <Button
            type="button"
            className="w-full"
            disabled={!resposta.trim()}
            onClick={confirmar}
          >
            Verificar recall
          </Button>
        </>
      ) : (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            acertou
              ? "border-semaforo-verde/40 bg-semaforo-verde/10 text-semaforo-verde"
              : "border-semaforo-vermelho/40 bg-semaforo-vermelho/10",
          )}
        >
          {acertou ? (
            <p>Correto! Boa recuperação ativa.</p>
          ) : (
            <p>
              Resposta esperada:{" "}
              <strong>{conteudo.resposta_esperada}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
