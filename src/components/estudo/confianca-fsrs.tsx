"use client";

import type { FsrsGrade } from "@/lib/srs";
import {
  resolveRatingPolicy,
  type ConfidenceLevel,
} from "@/lib/srs/rating-policy";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfiancaSelecao = {
  confidence: ConfidenceLevel;
  fsrsRating: FsrsGrade;
};

interface ConfiancaFsrsProps {
  acertou: boolean;
  onSelecionar: (selecao: ConfiancaSelecao) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Coleta confiança subjetiva (1|3) e deriva nota FSRS via rating-policy.
 * Erro → sempre Again (1). Acerto na dúvida → Hard (2). Acerto certo → Easy (4).
 */
export function ConfiancaFsrs({
  acertou,
  onSelecionar,
  disabled,
  className,
}: ConfiancaFsrsProps) {
  const escolher = (confidence: ConfidenceLevel) => {
    onSelecionar(resolveRatingPolicy({ acertou, confidence }));
  };

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
              onClick={() => escolher(1)}
            >
              Acertei na dúvida
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={disabled}
              onClick={() => escolher(3)}
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
              onClick={() => escolher(1)}
            >
              Não sabia
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={disabled}
              onClick={() => escolher(3)}
            >
              Quase acertei
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
