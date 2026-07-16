import type { CSSProperties } from "react";
import type {
  ConteudoTrechoLegal,
  DestaqueTexto,
} from "@/types/estudo-reverso-visual";
import {
  offsetsSegmentosTexto,
  segmentarTextoPlano,
} from "@/lib/estudo-reverso/segmentar-texto-estudo";
import { cn } from "@/lib/utils";
import { TelaConteudoShell } from "./tela-conteudo-shell";

function renderTrechoComGrifos(
  textoCompleto: string,
  inicio: number,
  fim: number,
  grifos: DestaqueTexto[],
) {
  const slice = textoCompleto.slice(inicio, fim);
  const grifosLocais = grifos
    .filter((g) => g.fim > inicio && g.inicio < fim)
    .map((g) => ({
      inicio: Math.max(0, g.inicio - inicio),
      fim: Math.min(slice.length, g.fim - inicio),
      motivo: g.motivo,
    }))
    .sort((a, b) => a.inicio - b.inicio);

  if (grifosLocais.length === 0) {
    return slice;
  }

  const partes: { texto: string; grifo: boolean; motivo?: string }[] = [];
  let cursor = 0;

  for (const g of grifosLocais) {
    if (g.inicio > cursor) {
      partes.push({ texto: slice.slice(cursor, g.inicio), grifo: false });
    }
    partes.push({
      texto: slice.slice(g.inicio, g.fim),
      grifo: true,
      motivo: g.motivo,
    });
    cursor = g.fim;
  }
  if (cursor < slice.length) {
    partes.push({ texto: slice.slice(cursor), grifo: false });
  }

  return partes.map((p, i) => (
    <span
      key={i}
      className={cn(
        p.grifo &&
          "grifo-sweep rounded px-0.5 font-semibold text-transito-foreground",
      )}
      title={p.grifo ? p.motivo : undefined}
    >
      {p.texto}
    </span>
  ));
}

export function TelaTrechoLegal({ conteudo }: { conteudo: ConteudoTrechoLegal }) {
  const texto = conteudo.texto;
  const grifos = conteudo.trechos_grifados ?? [];
  const segmentos = segmentarTextoPlano(texto);
  const offsets = offsetsSegmentosTexto(texto, segmentos);

  return (
    <div className="space-y-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {conteudo.fonte}
      </p>
      <TelaConteudoShell variant="lei" className="space-y-3">
        {offsets.map(({ inicio, fim }, idx) => (
          <p
            key={idx}
            className="revelar-item text-[15px] leading-relaxed text-foreground"
            style={{ "--i": idx } as CSSProperties}
          >
            {renderTrechoComGrifos(texto, inicio, fim, grifos)}
          </p>
        ))}
      </TelaConteudoShell>
    </div>
  );
}
