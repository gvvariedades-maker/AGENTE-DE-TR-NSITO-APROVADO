import Link from "next/link";
import { BookMarked, BookOpen, Crosshair } from "lucide-react";
import { ModoTreinoCard } from "@/components/dashboard/modo-treino-card";

interface PainelMaisModosProps {
  questoesReaisAtivo: boolean;
  questoesReaisDesc: string;
}

const MODOS_SECUNDARIOS = [
  {
    slug: "sniper_ctb",
    label: "Sniper CTB",
    desc: "Sessão só Legislação de Trânsito",
    href: "/estudo?disciplina=legislacao_transito",
    icon: Crosshair,
  },
  {
    slug: "pegadinha_idecan",
    label: "Pegadinha IDECAN",
    desc: "Armadilhas típicas da banca",
    href: "/estudo?modo=pegadinha",
    icon: BookOpen,
  },
] as const;

export function PainelMaisModos({
  questoesReaisAtivo,
  questoesReaisDesc,
}: PainelMaisModosProps) {
  return (
    <details className="group rounded-xl border border-border bg-card">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-2">
          Mais modos de treino
          <span className="text-xs font-normal text-muted-foreground group-open:hidden">
            ver
          </span>
          <span className="hidden text-xs font-normal text-muted-foreground group-open:inline">
            ocultar
          </span>
        </span>
      </summary>
      <div className="grid gap-2 border-t border-border p-3 sm:grid-cols-2">
        {MODOS_SECUNDARIOS.map((modo) => (
          <ModoTreinoCard
            key={modo.slug}
            icon={modo.icon}
            label={modo.label}
            desc={modo.desc}
            href={modo.href}
            ativo
          />
        ))}
        <ModoTreinoCard
          icon={BookMarked}
          label="Questões reais IDECAN"
          desc={questoesReaisDesc}
          href={questoesReaisAtivo ? "/estudo/reais" : undefined}
          ativo={questoesReaisAtivo}
        />
        <Link
          href="/estudo?modo=auto"
          className="flex items-center justify-center rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          Motor ATA (automático)
        </Link>
      </div>
    </details>
  );
}
