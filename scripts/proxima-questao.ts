/**
 * Escolhe o próximo tópico a gerar por déficit de demanda (ROI).
 *
 * Uso:
 *   npm run proxima -- legislacao_transito
 *   npm run proxima -- portugues --n 5
 *   npm run proxima -- all
 *   npm run proxima -- legislacao_transito --json
 *   npm run proxima -- legislacao_transito --incluir-saturados
 */
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { Disciplina } from "@/types";
import { ESCOPO_DIFICULDADE_LINHAS } from "@/lib/validations/dificuldade-banco";
import { buildCoberturaIndex } from "../src/lib/questoes-cobertura";
import { EDITAL_TOPICS } from "./edital-topics";
import {
  enriquecerTopico,
  PROVA_SLOTS,
} from "./edital-topics-prioridades";

const DISCIPLINAS: Disciplina[] = [
  "legislacao_transito",
  "portugues",
  "informatica",
  "historia_cg_pb",
  "legislacao_etica_sp",
  "direito_administrativo",
  "direito_constitucional",
];

export interface TopicoRanqueado {
  disciplina: Disciplina;
  slug: string;
  editalRef: string;
  peso: 1 | 2 | 3;
  meta: number;
  familia: "A" | "B" | "C" | "D";
  recente: boolean;
  fonteLegal: string;
  atual: number;
  deficit: number;
  score: number;
  slotProva: number;
}

function parseArgs(argv: string[]) {
  const flags = new Set<string>();
  const pos: string[] = [];
  let n = 1;
  let json = false;
  let incluirSaturados = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--json") {
      json = true;
      flags.add(arg);
    } else if (arg === "--incluir-saturados") {
      incluirSaturados = true;
      flags.add(arg);
    } else if (arg === "--n") {
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        n = Number(next);
        i++;
      }
    } else if (arg.startsWith("--n=")) {
      n = Number(arg.slice(4));
    } else if (!arg.startsWith("--")) {
      pos.push(arg);
    }
  }

  return {
    alvo: pos[0] ?? "",
    n: Number.isFinite(n) && n > 0 ? Math.floor(n) : 1,
    json,
    incluirSaturados,
  };
}

function calcularScore(
  deficit: number,
  peso: number,
  recente: boolean,
  slotProva: number,
  modoGlobal: boolean,
): number {
  const recenciaMult = recente ? 1.5 : 1;
  const base = deficit * peso * recenciaMult;
  if (!modoGlobal) return base;
  return base * (slotProva / 4);
}

export async function ranquearTopicos(
  disciplinaFiltro: string | "all",
  atualPorTopico: Map<string, number>,
  incluirSaturados: boolean,
): Promise<TopicoRanqueado[]> {
  const modoGlobal = disciplinaFiltro === "all";
  const topics = EDITAL_TOPICS.filter(
    (t) => modoGlobal || t.disciplina === disciplinaFiltro,
  );

  const ranking = topics
    .map((raw) => {
      const t = enriquecerTopico(raw);
      const atual = atualPorTopico.get(t.slug) ?? 0;
      const deficit = Math.max(0, t.meta - atual);
      const slotProva = PROVA_SLOTS[t.disciplina] ?? 4;
      const score = calcularScore(deficit, t.peso, t.recente, slotProva, modoGlobal);
      return {
        disciplina: t.disciplina,
        slug: t.slug,
        editalRef: t.editalRef,
        peso: t.peso,
        meta: t.meta,
        familia: t.familia,
        recente: t.recente,
        fonteLegal: t.fonteLegal,
        atual,
        deficit,
        score,
        slotProva,
      };
    })
    .filter((t) => incluirSaturados || t.deficit > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.peso - a.peso ||
        (a.atual === 0 ? -1 : 0) - (b.atual === 0 ? -1 : 0) ||
        b.deficit / b.meta - a.deficit / a.meta ||
        a.editalRef.localeCompare(b.editalRef),
    );

  return ranking;
}

async function proximoNumeroLote(disciplina: string): Promise<number> {
  const discPath = join(process.cwd(), "content", "questoes", disciplina);
  let files: string[];
  try {
    files = await readdir(discPath);
  } catch {
    return 1;
  }

  let max = 0;
  for (const file of files) {
    const m = /^lote-(\d+)\.json$/.exec(file);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max + 1;
}

function formatarLinha(i: number, t: TopicoRanqueado, modoGlobal: boolean): void {
  const lacuna = t.atual === 0 ? "LACUNA" : `${t.atual}/${t.meta}`;
  const prefix = modoGlobal ? `[${t.disciplina}] ` : "";
  console.log(
    `${i + 1}. ${prefix}${t.slug}  [P${t.peso} · ${lacuna} · score ${t.score.toFixed(1)}]`,
  );
  console.log(
    `   família: ${t.familia} · fonte: ${t.fonteLegal}${t.recente ? " · (norma recente)" : ""}`,
  );
}

export function blocoEscopo(t: TopicoRanqueado, loteNnn?: string): string {
  const lote = loteNnn ?? "NNN";
  return [
    `Disciplina: ${t.disciplina}`,
    `topico: ${t.slug}`,
    `Recorte legal: ${t.fonteLegal}`,
    ...ESCOPO_DIFICULDADE_LINHAS,
    `Família sugerida: ${t.familia}`,
    `Gravar em: content/questoes/${t.disciplina}/lote-${lote}.json`,
  ].join("\n");
}

async function main() {
  const { alvo, n, json, incluirSaturados } = parseArgs(process.argv.slice(2));

  if (!alvo) {
    console.error(
      `Uso: npm run proxima -- <disciplina|all> [--n 5] [--json] [--incluir-saturados]\n\nDisciplinas:\n  ${DISCIPLINAS.join("\n  ")}\n  all`,
    );
    process.exit(1);
  }

  const modoGlobal = alvo === "all";
  if (!modoGlobal && !DISCIPLINAS.includes(alvo as Disciplina)) {
    console.error(`Disciplina inválida: "${alvo}"\nUse uma de:\n  ${DISCIPLINAS.join("\n  ")}\n  all`);
    process.exit(1);
  }

  const index = await buildCoberturaIndex(join(process.cwd(), "content", "questoes"));
  const atualPorTopico = new Map<string, number>();
  for (const q of index.questoes) {
    atualPorTopico.set(q.topico, (atualPorTopico.get(q.topico) ?? 0) + 1);
  }

  const ranking = await ranquearTopicos(alvo, atualPorTopico, incluirSaturados);

  if (ranking.length === 0) {
    const label = modoGlobal ? "todas as disciplinas" : alvo;
    console.log(`✅ ${label}: metas atingidas. Use --incluir-saturados para forçar.`);
    return;
  }

  if (json) {
    console.log(JSON.stringify(ranking.slice(0, n), null, 2));
    return;
  }

  const top = ranking.slice(0, n);
  const titulo = modoGlobal ? "todas as disciplinas (peso × déficit × slot prova)" : alvo;
  const totalLabel = modoGlobal
    ? `${index.total} Q no banco`
    : `${index.questoes.filter((q) => q.disciplina === alvo).length} Q em ${alvo}`;

  console.log(`\n▶ Próximo(s) alvo(s) — ${titulo} (${totalLabel})\n`);
  for (const [i, t] of top.entries()) {
    formatarLinha(i, t, modoGlobal);
  }

  const alvo1 = top[0]!;
  const loteNum = String(await proximoNumeroLote(alvo1.disciplina)).padStart(3, "0");

  console.log(`\n── Escopo pronto (colar no prompt curto) ──`);
  console.log(blocoEscopo(alvo1, loteNum));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
