import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ShellVariant = "card" | "lei" | "tabela" | "lista";

const VARIANT_CLASS: Record<ShellVariant, string> = {
  card: "rounded-xl border border-border/80 bg-card/90 px-4 py-4 shadow-sm",
  lei: "rounded-xl border border-transito/25 border-l-4 border-l-transito bg-transito/5 px-4 py-4 shadow-sm",
  tabela: "overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm",
  lista: "space-y-2.5",
};

interface TelaConteudoShellProps {
  children: ReactNode;
  variant?: ShellVariant;
  className?: string;
}

export function TelaConteudoShell({
  children,
  variant = "card",
  className,
}: TelaConteudoShellProps) {
  return <div className={cn(VARIANT_CLASS[variant], className)}>{children}</div>;
}
