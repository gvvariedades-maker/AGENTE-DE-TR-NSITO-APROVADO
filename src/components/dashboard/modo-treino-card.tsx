import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const content = (
    <>
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
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium leading-snug",
            destaque && "text-transito-foreground",
          )}
        >
          {label}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      {ativo && href ? (
        <ChevronRight
          className={cn(
            "size-4 shrink-0",
            destaque ? "text-transito-foreground" : "text-muted-foreground",
          )}
          aria-hidden
        />
      ) : (
        <Badge variant="outline" className="shrink-0 text-xs">
          Em breve
        </Badge>
      )}
    </>
  );

  const rowClass = cn(
    "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
    "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
    destaque
      ? "border-transito/40 bg-transito/5 hover:bg-transito/10"
      : "border-border bg-card/50 hover:bg-muted/40",
    !ativo && "opacity-70",
  );

  if (ativo && href) {
    return (
      <Link href={href} className={rowClass}>
        {content}
      </Link>
    );
  }

  return <div className={rowClass}>{content}</div>;
}
