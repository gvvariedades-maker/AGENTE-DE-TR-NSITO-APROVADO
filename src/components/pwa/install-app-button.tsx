"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { IosInstallHelp } from "@/components/pwa/ios-install-help";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { cn } from "@/lib/utils";

interface InstallAppButtonProps {
  className?: string;
  showLabel?: boolean;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "ghost" | "outline" | "secondary";
}

export function InstallAppButton({
  className,
  showLabel = true,
  size = "sm",
  variant = "ghost",
}: InstallAppButtonProps) {
  const { canInstall, canPrompt, isIos, install } = usePwaInstall();
  const [iosHelpOpen, setIosHelpOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (!canInstall) return null;

  async function handleClick() {
    if (isIos && !canPrompt) {
      setIosHelpOpen(true);
      return;
    }

    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn("text-muted-foreground hover:text-foreground", className)}
        onClick={handleClick}
        disabled={installing}
        aria-label="Instalar aplicativo"
      >
        <Download className="size-4" aria-hidden />
        {showLabel ? (
          <span className={cn(size === "sm" && "hidden sm:inline")}>
            {installing ? "Instalando…" : "Instalar app"}
          </span>
        ) : null}
      </Button>
      <IosInstallHelp open={iosHelpOpen} onClose={() => setIosHelpOpen(false)} />
    </>
  );
}
