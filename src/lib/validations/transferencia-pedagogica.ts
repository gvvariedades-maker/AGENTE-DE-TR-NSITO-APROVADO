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

/** Meta de questões reais IDECAN (Tec) — campos extras além da transferência pedagógica. */
export const metaQuestaoRealSchema = metaTransferenciaCamposSchema.extend({
  origem: z.literal("real_idecan").optional(),
  nivel_escolaridade: z.string().optional(),
  fonte_arquivo: z.string().optional(),
  tec_id: z.string().optional(),
});

export const metaQuestaoSchema = metaQuestaoRealSchema.optional();

export function isTransferenciaLegacyMode(): boolean {
  return process.env.TRANSFERENCIA_LEGACY === "1";
}

export function resolveMetaTransferencia(q: {
  meta?: (MetaTransferenciaCampos & { origem?: string }) | null;
  estudo_reverso_visual_completo?: {
    meta?: MetaTransferenciaCampos | null;
  } | null;
}): (MetaTransferenciaCampos & { origem?: string }) | undefined {
  const base = q.meta;
  const aula = q.estudo_reverso_visual_completo?.meta;
  if (!base && !aula) return undefined;
  return {
    ...base,
    ...aula,
    // Campos de identidade/eficácia ficam na meta da questão (não no bloco da aula).
    origem: base?.origem,
    padrao_familia: base?.padrao_familia ?? aula?.padrao_familia,
    pegadinha_em_uma_frase:
      base?.pegadinha_em_uma_frase ?? aula?.pegadinha_em_uma_frase,
    isca_por_alternativa: base?.isca_por_alternativa ?? aula?.isca_por_alternativa,
    eixos_legais: base?.eixos_legais ?? aula?.eixos_legais,
    eixos_mecanismo: base?.eixos_mecanismo ?? aula?.eixos_mecanismo,
    eficacia_pos_aula: base?.eficacia_pos_aula ?? aula?.eficacia_pos_aula,
    near_transfer: aula?.near_transfer ?? base?.near_transfer,
    far_transfer: aula?.far_transfer ?? base?.far_transfer,
    o_que_nao_muda: aula?.o_que_nao_muda ?? base?.o_que_nao_muda,
    eixo_vizinho: aula?.eixo_vizinho ?? base?.eixo_vizinho,
  };
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
  meta?: MetaTransferenciaCampos & { origem?: string };
  telas?: MaceteTelaLike[];
}

function exigeTransferenciaObrigatoria(input: TransferenciaPedagogicaInput): boolean {
  if (isTransferenciaLegacyMode()) return false;
  if (input.meta?.origem === "real_idecan") return true;
  return input.dificuldade >= DIFICULDADE_MINIMA_BANCO;
}

/**
 * Gate T1–T4: transferência obrigatória em questões nível 4+ (banco)
 * e em todas as questões reais IDECAN (`meta.origem === "real_idecan"`),
 * independentemente da dificuldade.
 * Modo legado: TRANSFERENCIA_LEGACY=1 ou --legacy-transferencia no validate:lote.
 */
export function validarTransferenciaPedagogica(
  input: TransferenciaPedagogicaInput,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): void {
  if (!exigeTransferenciaObrigatoria(input)) return;

  const meta = input.meta;
  const metaPath = [...pathPrefix, "meta"];
  const isReal = meta?.origem === "real_idecan";
  const motivo = isReal
    ? "obrigatório em questão real_idecan (paridade aula inédita) — use --legacy-transferencia para lotes legados"
    : "obrigatório (dificuldade ≥ 4) — use --legacy-transferencia para lotes legados";

  if (!meta?.near_transfer?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `meta.near_transfer ${motivo}`,
      path: [...metaPath, "near_transfer"],
    });
  }
  if (!meta?.far_transfer?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `meta.far_transfer ${motivo}`,
      path: [...metaPath, "far_transfer"],
    });
  }
  if (!meta?.o_que_nao_muda?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `meta.o_que_nao_muda ${motivo}`,
      path: [...metaPath, "o_que_nao_muda"],
    });
  }

  if (isReal) {
    if (!meta?.padrao_familia?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "meta.padrao_familia obrigatório em real_idecan (família A–D do hub v3)",
        path: [...metaPath, "padrao_familia"],
      });
    }
    if (!meta?.isca_por_alternativa || Object.keys(meta.isca_por_alternativa).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "meta.isca_por_alternativa obrigatório em real_idecan (isca por cada errada)",
        path: [...metaPath, "isca_por_alternativa"],
      });
    }
    if (!meta?.eficacia_pos_aula || meta.eficacia_pos_aula.length !== 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'meta.eficacia_pos_aula obrigatório em real_idecan — use ["E1","E2","E3"]',
        path: [...metaPath, "eficacia_pos_aula"],
      });
    }
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
