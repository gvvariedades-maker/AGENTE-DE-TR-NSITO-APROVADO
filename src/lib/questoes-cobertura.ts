import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { MECANISMOS_DISTRATOR } from "@/lib/validations/estudo-reverso-visual";
import { obterPasso2Mecanismos } from "@/lib/validations/questao-mecanismo";
import type { QuestaoSeedInput } from "@/lib/validations/questao";

/** Máximo de questões com o mesmo `topico` por arquivo de lote (skill examinador-idecan). */
export const MAX_QUESTOES_POR_TOPICO_LOTE = 3;

/** Similaridade Jaccard ≥ este valor → aviso. */
export const SIMILARIDADE_AVISO = 0.8;

/** Similaridade Jaccard ≥ este valor → erro. */
export const SIMILARIDADE_ERRO = 0.92;

export interface QuestaoCoberturaEntry {
  lote: string;
  indice_lote: number;
  disciplina: string;
  topico: string;
  fundamento_slug: string;
  estilo_idecan: string | null;
  chave_eixo: string;
  dispositivos: string[];
  tags: string[];
  mecanismos: string[];
  enunciado_fingerprint: string;
  enunciado_preview: string;
}

export interface CoberturaIndex {
  gerado_em: string;
  total: number;
  questoes: QuestaoCoberturaEntry[];
}

export interface CoberturaIssue {
  nivel: "erro" | "aviso";
  codigo: string;
  mensagem: string;
  questao_indice: number;
  conflito_com?: string;
}

type QuestaoLike = Pick<
  QuestaoSeedInput,
  | "disciplina"
  | "topico"
  | "estilo_idecan"
  | "enunciado"
  | "tags"
  | "comentario"
  | "estudo_reverso_visual"
  | "estudo_reverso_visual_completo"
> & {
  fundamento_slug?: string;
};

/** Normaliza enunciado para fingerprint (lowercase, sem pontuação extra). */
export function normalizarEnunciado(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** SHA-256 truncado (16 hex) do enunciado normalizado. */
export function fingerprintEnunciado(texto: string): string {
  const norm = normalizarEnunciado(texto);
  return createHash("sha256").update(norm).digest("hex").slice(0, 16);
}

/** Tokens para similaridade Jaccard. */
export function tokensEnunciado(texto: string): Set<string> {
  const norm = normalizarEnunciado(texto);
  const parts = norm.split(" ").filter((t) => t.length > 2);
  return new Set(parts);
}

export function jaccardSimilaridade(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let inter = 0;
  for (const t of a) {
    if (b.has(t)) inter++;
  }
  const uni = a.size + b.size - inter;
  return uni === 0 ? 0 : inter / uni;
}

export function extrairFundamentoSlug(q: QuestaoLike): string {
  if (q.fundamento_slug?.trim()) return q.fundamento_slug.trim();
  const v2 = q.estudo_reverso_visual_completo?.fundamento_slug;
  if (v2?.trim()) return v2.trim();
  const v1 = q.estudo_reverso_visual?.fundamento_slug;
  if (v1?.trim()) return v1.trim();
  return "desconhecido";
}

export function extrairMecanismos(passo_a_passo: string[]): string[] {
  const passo2 = obterPasso2Mecanismos(passo_a_passo) ?? "";
  return MECANISMOS_DISTRATOR.filter((slug) => passo2.includes(slug));
}

export function montarChaveEixo(
  disciplina: string,
  topico: string,
  fundamento_slug: string,
  estilo_idecan: string | null | undefined,
): string {
  return `${disciplina}|${topico}|${fundamento_slug}|${estilo_idecan ?? "_"}`;
}

export function questaoParaEntradaCobertura(
  q: QuestaoLike,
  lote: string,
  indice_lote: number,
): QuestaoCoberturaEntry {
  const fundamento_slug = extrairFundamentoSlug(q);
  const estilo = q.estilo_idecan ?? null;

  return {
    lote,
    indice_lote,
    disciplina: q.disciplina,
    topico: q.topico,
    fundamento_slug,
    estilo_idecan: estilo,
    chave_eixo: montarChaveEixo(q.disciplina, q.topico, fundamento_slug, estilo),
    dispositivos: q.comentario.estudo_reverso ?? [],
    tags: q.tags ?? [],
    mecanismos: extrairMecanismos(q.comentario.passo_a_passo),
    enunciado_fingerprint: fingerprintEnunciado(q.enunciado),
    enunciado_preview: q.enunciado.slice(0, 100).replace(/\s+/g, " "),
  };
}

const IGNORE_LOTE = new Set(["lote-001-exemplo.json"]);

function shouldScanFile(fileName: string): boolean {
  if (!fileName.endsWith(".json")) return false;
  if (IGNORE_LOTE.has(fileName)) return false;
  if (fileName.startsWith("_")) return false;
  return fileName.includes("lote");
}

/** Varre `content/questoes` e monta entradas de cobertura. */
export async function scanCoberturaCorpus(
  contentDir: string,
): Promise<QuestaoCoberturaEntry[]> {
  const entries: QuestaoCoberturaEntry[] = [];

  let disciplinas: string[];
  try {
    disciplinas = await readdir(contentDir);
  } catch {
    return entries;
  }

  for (const disc of disciplinas) {
    if (disc.startsWith("_")) continue;

    const discPath = join(contentDir, disc);
    let files: string[];
    try {
      files = await readdir(discPath);
    } catch {
      continue;
    }

    for (const file of files) {
      if (!shouldScanFile(file)) continue;

      const relLote = relative(contentDir, join(discPath, file)).replace(/\\/g, "/");
      const raw = await readFile(join(discPath, file), "utf-8");
      let json: unknown;
      try {
        json = JSON.parse(raw);
      } catch {
        continue;
      }

      const questoes = Array.isArray(json) ? json : [json];
      for (const [i, q] of questoes.entries()) {
        if (!q || typeof q !== "object") continue;
        const questao = q as QuestaoLike;
        if (!questao.disciplina || !questao.enunciado || !questao.topico) continue;
        if (!questao.comentario) continue;

        entries.push(questaoParaEntradaCobertura(questao, relLote, i));
      }
    }
  }

  return entries;
}

export async function buildCoberturaIndex(contentDir: string): Promise<CoberturaIndex> {
  const questoes = await scanCoberturaCorpus(contentDir);
  return {
    gerado_em: new Date().toISOString(),
    total: questoes.length,
    questoes,
  };
}

/**
 * Valida questões de um lote contra o corpus completo.
 * @param loteRelPath caminho relativo a content/questoes (ex.: legislacao_transito/lote-009.json)
 */
export function validarCoberturaLote(
  questoes: QuestaoLike[],
  loteRelPath: string,
  corpus: QuestaoCoberturaEntry[],
): CoberturaIssue[] {
  const issues: CoberturaIssue[] = [];
  const loteNorm = loteRelPath.replace(/\\/g, "/");

  const novas = questoes.map((q, i) => questaoParaEntradaCobertura(q, loteNorm, i));

  // Máx. por topico no lote
  const porTopico = new Map<string, number>();
  for (const n of novas) {
    porTopico.set(n.topico, (porTopico.get(n.topico) ?? 0) + 1);
  }
  for (const [topico, count] of porTopico) {
    if (count > MAX_QUESTOES_POR_TOPICO_LOTE) {
      issues.push({
        nivel: "erro",
        codigo: "COB_TOPICO_LOTE",
        mensagem: `Lote com ${count} questões no topico "${topico}" (máx. ${MAX_QUESTOES_POR_TOPICO_LOTE})`,
        questao_indice: 0,
      });
    }
  }

  for (const [i, nova] of novas.entries()) {
    // Duplicata exata de enunciado
    const dupFingerprint = corpus.filter(
      (e) =>
        e.enunciado_fingerprint === nova.enunciado_fingerprint &&
        !(e.lote === loteNorm && e.indice_lote === i),
    );
    if (dupFingerprint.length > 0) {
      issues.push({
        nivel: "erro",
        codigo: "COB_ENUNCIADO_DUP",
        mensagem: `Enunciado duplicado (fingerprint ${nova.enunciado_fingerprint})`,
        questao_indice: i,
        conflito_com: dupFingerprint.map((d) => `${d.lote}#Q${d.indice_lote + 1}`).join(", "),
      });
    }

    // Mesmo eixo ouro (fundamento + estilo) em outro lote ou repetido no lote
    const dupEixo = corpus.filter(
      (e) =>
        e.chave_eixo === nova.chave_eixo &&
        !(e.lote === loteNorm && e.indice_lote === i),
    );
    if (dupEixo.length > 0) {
      issues.push({
        nivel: "erro",
        codigo: "COB_EIXO_DUP",
        mensagem: `Eixo já coberto: ${nova.chave_eixo}`,
        questao_indice: i,
        conflito_com: dupEixo.map((d) => `${d.lote}#Q${d.indice_lote + 1}`).join(", "),
      });
    }

  }

  return issues;
}

/** Valida lote com corpus + mapa de enunciados externos para similaridade. */
export function validarCoberturaLoteCompleto(
  questoes: QuestaoLike[],
  loteRelPath: string,
  corpus: QuestaoCoberturaEntry[],
  enunciadosCorpus: Map<string, string>,
): CoberturaIssue[] {
  const issues = validarCoberturaLote(questoes, loteRelPath, corpus);
  const loteNorm = loteRelPath.replace(/\\/g, "/");
  const novas = questoes.map((q, i) => questaoParaEntradaCobertura(q, loteNorm, i));

  for (const [i, nova] of novas.entries()) {
    const tokensNova = tokensEnunciado(questoes[i]!.enunciado);

    for (const e of corpus) {
      if (e.topico !== nova.topico) continue;
      if (e.lote === loteNorm && e.indice_lote === i) continue;

      const key = `${e.lote}#${e.indice_lote}`;
      const enunciadoOutro = enunciadosCorpus.get(key);
      if (!enunciadoOutro) continue;
      if (e.enunciado_fingerprint === nova.enunciado_fingerprint) continue;

      const sim = jaccardSimilaridade(tokensNova, tokensEnunciado(enunciadoOutro));
      if (sim >= SIMILARIDADE_ERRO) {
        issues.push({
          nivel: "erro",
          codigo: "COB_SIMILAR_ALTA",
          mensagem: `Enunciado muito similar (${Math.round(sim * 100)}%) no topico "${nova.topico}"`,
          questao_indice: i,
          conflito_com: `${e.lote}#Q${e.indice_lote + 1}`,
        });
      } else if (sim >= SIMILARIDADE_AVISO) {
        issues.push({
          nivel: "aviso",
          codigo: "COB_SIMILAR_MEDIA",
          mensagem: `Enunciado parecido (${Math.round(sim * 100)}%) no topico "${nova.topico}"`,
          questao_indice: i,
          conflito_com: `${e.lote}#Q${e.indice_lote + 1}`,
        });
      }
    }
  }

  return issues;
}

/** Mapa lote#indice → enunciado para similaridade. */
export async function buildEnunciadosMap(
  contentDir: string,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  for (const disc of await readdir(contentDir).catch(() => [] as string[])) {
    if (disc.startsWith("_")) continue;
    const discPath = join(contentDir, disc);
    let files: string[];
    try {
      files = await readdir(discPath);
    } catch {
      continue;
    }
    for (const file of files) {
      if (!shouldScanFile(file)) continue;
      const relLote = relative(contentDir, join(discPath, file)).replace(/\\/g, "/");
      const raw = await readFile(join(discPath, file), "utf-8");
      let json: unknown;
      try {
        json = JSON.parse(raw);
      } catch {
        continue;
      }
      const questoes = Array.isArray(json) ? json : [json];
      for (const [i, q] of questoes.entries()) {
        if (q && typeof q === "object" && "enunciado" in q && typeof (q as QuestaoLike).enunciado === "string") {
          map.set(`${relLote}#${i}`, (q as QuestaoLike).enunciado);
        }
      }
    }
  }

  return map;
}

export const COBERTURA_INDEX_PATH = "content/questoes/_index/cobertura.json";

/** Agrupa entradas por topico para consulta do Agent. */
export function resumoCoberturaPorTopico(
  index: CoberturaIndex,
  topico?: string,
): Record<string, { count: number; eixos: string[] }> {
  const out: Record<string, { count: number; eixos: string[] }> = {};
  for (const q of index.questoes) {
    if (topico && q.topico !== topico) continue;
    if (!out[q.topico]) out[q.topico] = { count: 0, eixos: [] };
    out[q.topico].count++;
    const label = `${q.fundamento_slug} (${q.estilo_idecan ?? "?"})`;
    if (!out[q.topico].eixos.includes(label)) out[q.topico].eixos.push(label);
  }
  return out;
}
