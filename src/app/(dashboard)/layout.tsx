import Link from "next/link";
import { TrafficCone } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const NAV = [
  { href: "/dashboard", label: "Painel" },
  { href: "/estudo", label: "Estudo" },
  { href: "/simulado", label: "Simulado" },
] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      {/* Faixa institucional */}
      <div className="h-1 bg-transito" aria-hidden />

      <nav className="border-b border-border bg-asfalto/80 backdrop-blur-sm">
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
          <ul className="flex gap-0.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="flex flex-1 flex-col bg-background">{children}</div>
    </div>
  );
}
