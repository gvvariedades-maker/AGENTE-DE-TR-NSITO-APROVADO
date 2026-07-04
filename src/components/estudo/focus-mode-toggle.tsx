"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FocusModeToggleProps {
  className?: string;
}

/** Modo foco — esconde nav e reduz carga extrínseca (CLT). */
export function FocusModeToggle({ className }: FocusModeToggleProps) {
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.foco = ativo ? "true" : "false";
    return () => {
      delete document.documentElement.dataset.foco;
    };
  }, [ativo]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("gap-1.5 text-muted-foreground", className)}
      onClick={() => setAtivo((v) => !v)}
      aria-pressed={ativo}
    >
      {ativo ? (
        <>
          <EyeOff className="size-4" aria-hidden />
          Sair do foco
        </>
      ) : (
        <>
          <Eye className="size-4" aria-hidden />
          Modo foco
        </>
      )}
    </Button>
  );
}
