"use client";

import { Download, X } from "lucide-react";
import { useState } from "react";
import { IosInstallHelp } from "@/components/pwa/ios-install-help";
import { Button, buttonVariants } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { isMobileDevice, PWA_BANNER_DISMISS_KEY } from "@/lib/pwa/install";
import { cn } from "@/lib/utils";

function bannerInitiallyDismissed(): boolean {
  if (typeof window === "undefined") return true;
  if (!isMobileDevice()) return true;
  return localStorage.getItem(PWA_BANNER_DISMISS_KEY) === "1";
}

export function InstallAppBanner() {
  const { canInstall, canPrompt, isIos, install, ready } = usePwaInstall();
  const [dismissed, setDismissed] = useState(bannerInitiallyDismissed);
  const [iosHelpOpen, setIosHelpOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (!ready || !canInstall || dismissed) return null;

  function dismiss() {
    localStorage.setItem(PWA_BANNER_DISMISS_KEY, "1");
    setDismissed(true);
  }

  async function handleInstall() {
    if (isIos && !canPrompt) {
      setIosHelpOpen(true);
      return;
    }

    setInstalling(true);
    try {
      const ok = await install();
      if (ok) dismiss();
    } finally {
      setInstalling(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-4 shadow-lg backdrop-blur-sm"
        role="region"
        aria-label="Instalar aplicativo"
      >
        <div className="mx-auto flex max-w-5xl items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              Instale o ATA Aprovado no celular
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Acesso rápido na tela inicial — estude offline quando a página já
              estiver carregada.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              size="sm"
              onClick={handleInstall}
              disabled={installing}
              className="min-h-9"
            >
              <Download className="size-4" aria-hidden />
              {installing ? "…" : "Instalar"}
            </Button>
            <button
              type="button"
              onClick={dismiss}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "size-9 p-0",
              )}
              aria-label="Dispensar"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
      <IosInstallHelp open={iosHelpOpen} onClose={() => setIosHelpOpen(false)} />
    </>
  );
}
