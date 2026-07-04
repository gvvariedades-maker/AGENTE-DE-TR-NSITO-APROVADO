import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModoTreinoCardProps {
  icon: LucideIcon;
  label: string;
  desc: string;
  href?: string;
  destaque?: boolean;
  ativo: boolean;
}

export function ModoTreinoCard({
  icon: Icon,
  label,
  desc,
  href,
  destaque = false,
  ativo,
}: ModoTreinoCardProps) {
  return (
    <Card
      className={cn(
        destaque && "border-transito/40 bg-transito/5",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg ring-1",
              destaque
                ? "bg-transito/15 ring-transito/30 text-transito-foreground"
                : "bg-muted ring-border text-muted-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base">{label}</CardTitle>
            <CardDescription>{desc}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {ativo && href ? (
          <Link
            href={href}
            className={cn(
              buttonVariants({ variant: destaque ? "default" : "secondary" }),
              "w-full",
            )}
          >
            Iniciar
          </Link>
        ) : (
          <Button variant="secondary" className="w-full" disabled>
            Em breve
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
