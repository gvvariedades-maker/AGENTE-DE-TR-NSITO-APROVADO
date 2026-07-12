"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  type BeforeInstallPromptEvent,
  isIosDevice,
  isStandaloneMode,
} from "@/lib/pwa/install";

function subscribeNoop() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function usePwaInstall() {
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const isStandalone = mounted && isStandaloneMode();
  const isIos = mounted && isIosDevice();
  const canPrompt = Boolean(deferredPrompt);
  const canInstall =
    mounted && !isStandaloneMode() && (canPrompt || isIosDevice());

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return outcome === "accepted";
  }, [deferredPrompt]);

  return {
    ready: mounted,
    canInstall,
    canPrompt,
    isIos,
    isStandalone,
    install,
  };
}
