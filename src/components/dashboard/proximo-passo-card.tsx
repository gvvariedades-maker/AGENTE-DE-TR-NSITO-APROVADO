import Link from "next/link";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProximoPassoCardProps {
  href: string;
  label: string;
  motivo: string;
  className?: string;
}

export function ProximoPassoCard({
  href,
  label,
  motivo,
  className,
}: ProximoPassoCardProps) {
  return (
    <Card className={cn("border-border bg-card", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Próximo passo</CardTitle>
        <CardDescription>Uma ação — a de maior impacto agora</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-lg border border-transito/25 bg-transito/5 px-4 py-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-transito/15 ring-1 ring-transito/30">
            <Target className="size-4 text-transito-foreground" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Priorize agora
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {motivo}
            </p>
          </div>
        </div>

        <Link
          href={href}
          className={cn(buttonVariants({ size: "lg" }), "w-full min-h-11")}
        >
          {label}
        </Link>

        <div className="flex gap-2 border-t border-border pt-4">
          <Link
            href="/estudo"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "flex-1",
            )}
          >
            Estudo
          </Link>
          <Link
            href="/simulado"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "flex-1 text-muted-foreground",
            )}
          >
            Simulado
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
