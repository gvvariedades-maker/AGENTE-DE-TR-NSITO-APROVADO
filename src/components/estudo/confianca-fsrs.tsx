"use client";

import type { FsrsGrade } from "@/lib/srs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfiancaFsrsProps {
  acertou: boolean;
  onSelecionar: (grade: FsrsGrade) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Coleta nota FSRS (1–4) pós-resposta para agendamento mais preciso.
 * Acerto: Good (3) vs Easy (4). Erro: Again (1) vs Hard (2, “quase acertei”).
 */
export function ConfiancaFsrs({
  acertou,
  onSelecionar,
  disabled,
  className,
}: ConfiancaFsrsProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-muted/30 p-3",
        className,
      )}
      role="group"
      aria-label="Nível de confiança na resposta"
    >
      <p className="mb-2 text-center text-sm font-medium text-foreground">
        Como foi essa resposta?
      </p>
      <div className="grid grid-cols-2 gap-2">
        {acertou ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => onSelecionar(3)}
            >
              Acertei na dúvida
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={disabled}
              onClick={() => onSelecionar(4)}
            >
              Acertei com certeza
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => onSelecionar(1)}
            >
              Não sabia
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={disabled}
              onClick={() => onSelecionar(2)}
            >
              Quase acertei
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
