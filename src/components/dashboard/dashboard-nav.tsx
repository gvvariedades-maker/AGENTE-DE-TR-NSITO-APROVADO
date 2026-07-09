"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrafficCone } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

const NAV = [
  { href: "/dashboard", label: "Painel", match: (p: string) => p === "/dashboard" },
  { href: "/desempenho", label: "Desempenho", match: (p: string) => p.startsWith("/desempenho") },
  { href: "/estudo", label: "Estudo", match: (p: string) => p.startsWith("/estudo") },
  { href: "/simulado", label: "Simulado", match: (p: string) => p.startsWith("/simulado") },
] as const;

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-card/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-sm font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-transito/15 ring-1 ring-transito/30 text-transito-foreground">
            <TrafficCone className="size-4" aria-hidden />
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span>ATA Aprovado</span>
            <span className="text-[10px] font-normal text-muted-foreground">
              Agente de Trânsito
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <ul className="flex gap-0.5">
            {NAV.map((item) => {
              const ativo = item.match(pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={ativo ? "page" : undefined}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      ativo
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              Sair
            </Button>
          </form>
        </div>
      </div>
    </nav>
  );
}
