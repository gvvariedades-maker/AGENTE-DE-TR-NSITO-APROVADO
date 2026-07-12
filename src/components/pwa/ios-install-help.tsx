"use client";

import { Share, Smartphone, X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface IosInstallHelpProps {
  open: boolean;
  onClose: () => void;
}

export function IosInstallHelp({ open, onClose }: IosInstallHelpProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-transito/15 text-transito-foreground">
              <Smartphone className="size-4" aria-hidden />
            </span>
            <h2 id="ios-install-title" className="text-base font-semibold">
              Instalar no iPhone
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="size-8 shrink-0 p-0"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>

        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Toque em <strong className="text-foreground">Compartilhar</strong>{" "}
            <Share className="inline size-3.5 align-text-bottom" aria-hidden /> na
            barra do Safari
          </li>
          <li>
            Role e escolha{" "}
            <strong className="text-foreground">Adicionar à Tela de Início</strong>
          </li>
          <li>
            Confirme em <strong className="text-foreground">Adicionar</strong>
          </li>
        </ol>

        <Button type="button" className="mt-5 w-full" onClick={onClose}>
          Entendi
        </Button>
      </div>
    </div>
  );
}
