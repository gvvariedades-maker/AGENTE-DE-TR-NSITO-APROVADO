import Link from "next/link";
import { Crosshair, Scale, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const ATALHOS = [
  {
    href: "/estudo?disciplina=legislacao_transito",
    label: "CTB",
    desc: "50% da prova",
    icon: Crosshair,
    destaque: true,
  },
  {
    href: "/estudo?modo=anti_zerar",
    label: "Anti-zerar",
    desc: "Evitar eliminação",
    icon: ShieldAlert,
    destaque: false,
  },
  {
    href: "/simulado",
    label: "Simulado",
    desc: "60Q espelho",
    icon: Scale,
    destaque: false,
  },
] as const;

export function PainelAtalhos() {
  return (
    <section
      aria-label="Atalhos de estudo"
      className="flex flex-wrap gap-2"
    >
      {ATALHOS.map(({ href, label, desc, icon: Icon, destaque }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            buttonVariants({
              variant: destaque ? "default" : "outline",
              size: "lg",
            }),
            "min-h-11 flex-1 basis-[calc(33%-0.5rem)] justify-start gap-2 px-3 sm:flex-none sm:basis-auto sm:px-4",
          )}
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          <span className="flex flex-col items-start leading-tight">
            <span className="text-sm font-semibold">{label}</span>
            <span
              className={cn(
                "text-[10px] font-normal",
                destaque ? "text-primary-foreground/80" : "text-muted-foreground",
              )}
            >
              {desc}
            </span>
          </span>
        </Link>
      ))}
    </section>
  );
}
