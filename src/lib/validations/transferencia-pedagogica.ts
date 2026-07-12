import { z } from "zod";
import { DIFICULDADE_MINIMA_BANCO } from "@/lib/validations/dificuldade-banco";

/** Campos de transferência pedagógica (examinador v2.1 / aula v3.4). */
export const metaTransferenciaCamposSchema = z.object({
  padrao_familia: z.string().optional(),
  pegadinha_em_uma_frase: z.string().optional(),
  eixos_legais: z.array(z.string()).optional(),
  eixos_mecanismo: z.array(z.string()).optional(),
  isca_por_alternativa: z.record(z.string(), z.string()).optional(),
  near_transfer: z.string().min(10).optional(),
  far_transfer: z.string().min(10).optional(),
  o_que_nao_muda: z.string().min(10).optional(),
  eixo_vizinho: z.string().min(1).optional(),
  eficacia_pos_aula: z
    .array(z.enum(["E1", "E2", "E3"]))
    .length(3)
    .optional(),
  calibracao_corpus: z.literal("ok").optional(),
});

export type MetaTransferenciaCampos = z.infer<typeof metaTransferenciaCamposSchema>;

export const metaQuestaoSchema = metaTransferenciaCamposSchema.optional();

export function isTransferenciaLegacyMode(): boolean {
  return process.env.TRANSFERENCIA_LEGACY === "1";
}

export function resolveMetaTransferencia(q: {
  meta?: MetaTransferenciaCampos | null;
  estudo_reverso_visual_completo?: { meta?: MetaTransferenciaCampos | null } | null;
}): MetaTransferenciaCampos | undefined {
  return (
    q.estudo_reverso_visual_completo?.meta ??
    q.meta ??
    undefined
  );
}

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Paráfrase: um texto contém o outro ou similaridade por prefixo longo. */
export function transferenciasSaoParafrase(a: string, b: string): boolean {
  const na = normalizar(a);
  const nb = normalizar(b);
  if (na === nb) return true;
  if (na.length >= 20 && nb.length >= 20) {
    if (na.includes(nb) || nb.includes(na)) return true;
    const minLen = Math.min(na.length, nb.length);
    const prefix = na.slice(0, Math.min(40, minLen));
    if (prefix.length >= 20 && nb.startsWith(prefix)) return true;
  }
  return false;
}

function gabaritoRemeteEixoVizinho(comentario: {
  fundamento_legal?: string;
  passo_a_passo?: string[];
  estudo_reverso?: string[];
}): boolean {
  const blob = [
    comentario.fundamento_legal ?? "",
    ...(comentario.passo_a_passo ?? []),
    ...(comentario.estudo_reverso ?? []),
  ].join(" ");
  return /artigo seguinte|procedimento previsto no art/i.test(blob);
}

function textoMacete(telas: MaceteTelaLike[] | undefined): string | undefined {
  if (!telas?.length) return undefined;
  const macete = telas.find(
    (t) => t.id === "macete" || t.secao === "macete",
  );
  if (!macete || macete.tipo !== "texto_destaque") return undefined;
  const conteudo = macete.conteudo as { texto?: string } | undefined;
  return conteudo?.texto;
}

type MaceteTelaLike = {
  id?: string;
  secao?: string;
  tipo?: string;
  conteudo?: unknown;
};

export interface TransferenciaPedagogicaInput {
  dificuldade: number;
  comentario: {
    fundamento_legal: string;
    passo_a_passo?: string[];
    estudo_reverso?: string[];
  };
  meta?: MetaTransferenciaCampos;
  telas?: MaceteTelaLike[];
}

/**
 * Gate T1–T4: transferência obrigatória em questões nível 4+ (banco).
 * Modo legado: TRANSFERENCIA_LEGACY=1 ou --legacy-transferencia no validate:lote.
 */
export function validarTransferenciaPedagogica(
  input: TransferenciaPedagogicaInput,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): void {
  if (input.dificuldade < DIFICULDADE_MINIMA_BANCO) return;
  if (isTransferenciaLegacyMode()) return;

  const meta = input.meta;
  const metaPath = [...pathPrefix, "meta"];

  if (!meta?.near_transfer?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "meta.near_transfer obrigatório (dificuldade ≥ 4) — use --legacy-transferencia para lotes legados",
      path: [...metaPath, "near_transfer"],
    });
  }
  if (!meta?.far_transfer?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "meta.far_transfer obrigatório (dificuldade ≥ 4) — use --legacy-transferencia para lotes legados",
      path: [...metaPath, "far_transfer"],
    });
  }
  if (!meta?.o_que_nao_muda?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "meta.o_que_nao_muda obrigatório (dificuldade ≥ 4) — use --legacy-transferencia para lotes legados",
      path: [...metaPath, "o_que_nao_muda"],
    });
  }

  if (
    meta?.near_transfer &&
    meta?.far_transfer &&
    transferenciasSaoParafrase(meta.near_transfer, meta.far_transfer)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "meta.far_transfer deve ser cenário distinto de near_transfer (gate editorial #18)",
      path: [...metaPath, "far_transfer"],
    });
  }

  if (gabaritoRemeteEixoVizinho(input.comentario) && !meta?.eixo_vizinho?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "meta.eixo_vizinho obrigatório quando o gabarito remete a outro artigo (ex.: artigo seguinte)",
      path: [...metaPath, "eixo_vizinho"],
    });
  }

  const maceteTexto = textoMacete(input.telas);
  if (!maceteTexto) return;

  const t = maceteTexto.toLowerCase();
  const macetePath = [...pathPrefix, "estudo_reverso_visual_completo", "telas"];

  if (meta?.near_transfer && !/near/i.test(t)) {
    const snippet = normalizar(meta.near_transfer).slice(0, 24);
    if (snippet.length < 8 || !normalizar(maceteTexto).includes(snippet)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Tela "macete": deve ecoar near_transfer (ex.: linha "Near:" ou trecho da meta)',
        path: macetePath,
      });
    }
  }

  if (meta?.far_transfer && !/far/i.test(t)) {
    const snippet = normalizar(meta.far_transfer).slice(0, 24);
    if (snippet.length < 8 || !normalizar(maceteTexto).includes(snippet)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Tela "macete": deve ecoar far_transfer (ex.: linha "Far:" ou trecho da meta)',
        path: macetePath,
      });
    }
  }

  if (
    meta?.o_que_nao_muda &&
    !/n[aã]o muda/i.test(t)
  ) {
    const snippet = normalizar(meta.o_que_nao_muda).slice(0, 20);
    if (snippet.length < 8 || !normalizar(maceteTexto).includes(snippet)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Tela "macete": deve ecoar o_que_nao_muda (ex.: linha "Não muda:")',
        path: macetePath,
      });
    }
  }

  if (meta?.eixo_vizinho && !/cadeia|pr[oó]ximo|vizinho|art\.\s*\d/i.test(t)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Tela "macete" ou hierarquia: citar eixo_vizinho (ex.: "Cadeia: próximo = art. X")',
      path: macetePath,
    });
  }
}
