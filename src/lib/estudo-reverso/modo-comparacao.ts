import type { Secao } from "@/types/estudo-reverso-visual";

export type ModoComparacao = "contraste" | "distratores" | "neutro";

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/**
 * Infere o modo visual da comparação a partir das colunas / seção.
 * Semáforo (vermelho×verde) só em contraste/distratores — método/mapa ficam neutros.
 */
export function inferirModoComparacao(
  colA: string,
  colB: string,
  opts: {
    humanizarDistratores?: boolean;
    secao?: Secao;
  } = {},
): ModoComparacao {
  if (opts.humanizarDistratores || opts.secao === "distratores") {
    return "distratores";
  }

  const a = normalizar(colA);
  const b = normalizar(colB);
  const juntos = `${a} ${b}`;

  if (
    opts.secao === "contraste" ||
    /[✗✘x]\s*$/.test(colA.trim()) ||
    /[✓✔]\s*$/.test(colB.trim()) ||
    juntos.includes("pensa") ||
    juntos.includes("crenca") ||
    juntos.includes("confusao") ||
    juntos.includes("pegadinha") ||
    juntos.includes("errada") ||
    (juntos.includes("lei") &&
      (juntos.includes("diz") || juntos.includes("correto")))
  ) {
    return "contraste";
  }

  if (
    a.includes("alternativa") ||
    a.includes("mecanismo") ||
    b.includes("por que") ||
    b.includes("mecanismo")
  ) {
    return "distratores";
  }

  return "neutro";
}
