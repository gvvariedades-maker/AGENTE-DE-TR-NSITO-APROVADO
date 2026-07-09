import { z } from "zod";
import { MECANISMOS_DISTRATOR } from "@/lib/validations/estudo-reverso-visual";

export function obterPasso2Mecanismos(passo_a_passo: string[]): string | null {
  const numerado = passo_a_passo.find((p) => /^2\./.test(p.trim()));
  if (numerado) return numerado;
  return passo_a_passo[1] ?? null;
}

/** Passo 2 do comentário deve nomear cada errada com slug IDECAN. */
export function validarPasso2Mecanismos(
  gabarito: string,
  alternativas: Record<string, string>,
  passo_a_passo: string[],
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = ["comentario", "passo_a_passo"],
) {
  const passo2 = obterPasso2Mecanismos(passo_a_passo);
  if (!passo2?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "passo_a_passo deve ter passo 2 (ex.: '2. A erra por regra_excecao...') com mecanismos dos distratores",
      path: pathPrefix,
    });
    return;
  }

  const erradas = Object.keys(alternativas).filter((l) => l !== gabarito);
  const clausulas = passo2.split(";").map((c) => c.trim()).filter(Boolean);

  for (const letra of erradas) {
    const clausula =
      clausulas.find((c) => new RegExp(`\\b${letra}\\b`).test(c)) ??
      (passo2.includes(letra) ? passo2 : null);

    if (!clausula) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Passo 2 deve mencionar a alternativa errada ${letra}`,
        path: pathPrefix,
      });
      continue;
    }

    const temSlug = MECANISMOS_DISTRATOR.some((slug) => clausula.includes(slug));
    if (!temSlug) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Passo 2: alternativa ${letra} sem slug de mecanismo (${MECANISMOS_DISTRATOR.join(", ")})`,
        path: pathPrefix,
      });
    }
  }
}
