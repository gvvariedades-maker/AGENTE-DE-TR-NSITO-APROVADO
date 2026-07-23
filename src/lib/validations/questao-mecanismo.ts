import { z } from "zod";
import { MECANISMOS_DISTRATOR } from "@/lib/validations/estudo-reverso-visual";

export function obterPasso2Mecanismos(passo_a_passo: string[]): string | null {
  const numerado = passo_a_passo.find((p) => /^2\./.test(p.trim()));
  if (numerado) return numerado;
  return passo_a_passo[1] ?? null;
}

const STOPWORDS = new Set([
  "para",
  "com",
  "sem",
  "que",
  "por",
  "dos",
  "das",
  "nos",
  "nas",
  "uma",
  "um",
  "aos",
  "pelo",
  "pela",
  "sobre",
  "entre",
  "após",
  "apos",
  "mais",
  "menos",
  "todo",
  "toda",
  "todos",
  "todas",
  "esse",
  "essa",
  "este",
  "esta",
  "seu",
  "sua",
  "seus",
  "suas",
  "como",
  "quando",
  "onde",
  "qual",
  "quais",
  "considerando",
  "assinale",
  "alternativa",
  "correta",
  "incorreta",
  "durante",
  "sobre",
  "agente",
  "condutor",
  "veículo",
  "veiculo",
]);

const TOKENS_COMPETENCIA = [
  "contran",
  "senatran",
  "detran",
  "órgão",
  "orgao",
  "competência",
  "competencia",
  "união",
  "uniao",
  "executivo",
  "normatiza",
  "regulamenta",
  "procedimento",
];

function tokensSignificativos(texto: string): string[] {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^a-z0-9]+/i)
    .filter((t) => t.length >= 4 && !STOPWORDS.has(t));
}

/** Extrai o slug IDECAN associado à letra no passo 2 (ex.: "A erra por numero_vizinho"). */
export function passo2MecanismoPorLetra(
  passo2: string,
  letra: string,
): string | null {
  const clausulas = passo2.split(";").map((c) => c.trim());
  const clausula =
    clausulas.find((c) => new RegExp(`\\b${letra}\\b`).test(c)) ??
    (passo2.includes(letra) ? passo2 : null);
  if (!clausula) return null;
  return MECANISMOS_DISTRATOR.find((s) => clausula.includes(s)) ?? null;
}

function stemTemTokenCompetencia(enunciado: string): boolean {
  const norm = enunciado
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  return TOKENS_COMPETENCIA.some((t) => norm.includes(t));
}

function alternativaOnCase(
  enunciado: string,
  alternativa: string,
  mecanismo: string | null,
): boolean {
  if (mecanismo === "competencia_snt") {
    return stemTemTokenCompetencia(enunciado);
  }

  const stemTokens = new Set(tokensSignificativos(enunciado));
  const altTokens = tokensSignificativos(alternativa);
  const overlap = altTokens.filter((t) => stemTokens.has(t));
  return overlap.length >= 2;
}

/** Cada distrator deve derivar do cenário do enunciado (on-case). */
export function validarDistratorOnCase(
  gabarito: string,
  enunciado: string,
  alternativas: Record<string, string>,
  passo_a_passo: string[],
  dificuldade: number,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = ["comentario", "passo_a_passo"],
  opts?: { origem?: string },
) {
  if (opts?.origem === "real_idecan") return;

  const passo2 = obterPasso2Mecanismos(passo_a_passo);
  if (!passo2?.trim()) return;

  const erradas = Object.keys(alternativas).filter((l) => l !== gabarito);
  const bloqueante = dificuldade >= 4;

  for (const letra of erradas) {
    const mecanismo = passo2MecanismoPorLetra(passo2, letra);
    if (!alternativaOnCase(enunciado, alternativas[letra] ?? "", mecanismo)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: bloqueante
          ? `Alternativa ${letra} não é on-case: distrator deve derivar do enunciado${
              mecanismo === "competencia_snt"
                ? " (competencia_snt exige órgão/competência no stem)"
                : ""
            }`
          : `Aviso C6: alternativa ${letra} pode estar off-case`,
        path: pathPrefix,
      });
    }
  }
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

/** Heurística exportada para validate-indistinguibilidade (C6 / B4). */
export function listarAchadosDistratorOnCase(input: {
  gabarito: string;
  enunciado: string;
  alternativas: Record<string, string>;
  passo_a_passo: string[];
  dificuldade: number;
}): Array<{ letra: string; mecanismo: string | null; onCase: boolean }> {
  const passo2 = obterPasso2Mecanismos(input.passo_a_passo) ?? "";
  const erradas = Object.keys(input.alternativas).filter(
    (l) => l !== input.gabarito,
  );
  return erradas.map((letra) => {
    const mecanismo = passo2MecanismoPorLetra(passo2, letra);
    return {
      letra,
      mecanismo,
      onCase: alternativaOnCase(
        input.enunciado,
        input.alternativas[letra] ?? "",
        mecanismo,
      ),
    };
  });
}
