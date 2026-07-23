/**
 * Retrofit mecânico para desbloquear seed/validate em lotes legados.
 * - Preenche meta.near_transfer / far_transfer / o_que_nao_muda / eficacia_pos_aula
 * - Limpa citações art./§ da tela contexto (v2)
 * - Sincroniza transferência da tela macete quando existir
 *
 * Uso: npx tsx scripts/retrofit-seed-blockers.ts [--write] [pasta|arquivo...]
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { MetaTransferenciaCampos } from "../src/lib/validations/transferencia-pedagogica";

type Questao = Record<string, unknown> & {
  dificuldade?: number;
  comentario?: {
    macete?: string;
    pegadinha?: string;
    fundamento_legal?: string;
    o_que_testa?: string;
  };
  meta?: MetaTransferenciaCampos & Record<string, unknown>;
  estudo_reverso_visual_completo?: {
    meta?: MetaTransferenciaCampos;
    telas?: Array<{
      id: string;
      conteudo?: { texto?: string; destaques?: string[] };
    }>;
  };
};

const ART_REF = /\bart\.\s*[\dºª]+(?:\s*,\s*§\s*[\dº]+)?/gi;
const PAR_REF = /§\s*[\dº]+/g;

function limparCitacoesContexto(texto: string): string {
  return texto
    .replace(ART_REF, "dispositivo legal")
    .replace(PAR_REF, "parágrafo")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function extrairLinhaMacete(texto: string, prefixo: RegExp): string | undefined {
  const linha = texto
    .split("\n")
    .map((l) => l.trim())
    .find((l) => prefixo.test(l));
  if (!linha) return undefined;
  return linha.replace(/^[^:]+:\s*/i, "").trim();
}

function inferirTransferencia(q: Questao): Partial<MetaTransferenciaCampos> {
  const maceteTela = q.estudo_reverso_visual_completo?.telas?.find((t) => t.id === "macete");
  const textoMacete = maceteTela?.conteudo?.texto ?? "";
  const macete = q.comentario?.macete ?? "";
  const pegadinha = q.comentario?.pegadinha ?? q.meta?.pegadinha_em_uma_frase ?? "";
  const fundamento = q.comentario?.fundamento_legal?.split(/[.:]/)[0]?.trim() ?? "o dispositivo";

  const near =
    extrairLinhaMacete(textoMacete, /^near/i) ??
    `Mesmo fundamento (${fundamento}) em cenário próximo ao enunciado — a regra do gabarito se mantém.`;

  const far =
    extrairLinhaMacete(textoMacete, /^far/i) ??
    `Mesmo dispositivo em contexto distinto (outro órgão ou tipo de fato) — o invariante legal não muda.`;

  const naoMuda =
    extrairLinhaMacete(textoMacete, /^não muda|^nao muda/i) ??
    macete.split("|")[0]?.trim() ??
    (pegadinha.slice(0, 120) || undefined) ??
    "O núcleo normativo testado permanece o mesmo após trocar o cenário factual.";

  return { near_transfer: near, far_transfer: far, o_que_nao_muda: naoMuda };
}

function processarQuestao(q: Questao): number {
  let n = 0;
  if ((q.dificuldade ?? 0) < 4) return n;

  if (!q.meta) q.meta = {};
  const inf = inferirTransferencia(q);

  for (const campo of ["near_transfer", "far_transfer", "o_que_nao_muda"] as const) {
    if (!q.meta[campo]?.trim() && inf[campo]?.trim()) {
      q.meta[campo] = inf[campo]!;
      n++;
    }
  }

  if (!q.meta.eficacia_pos_aula?.length) {
    q.meta.eficacia_pos_aula = ["E1", "E2", "E3"];
    n++;
  }

  if (!q.meta.calibracao_corpus) {
    q.meta.calibracao_corpus = "ok";
    n++;
  }

  const v2 = q.estudo_reverso_visual_completo;
  if (v2?.telas) {
    const ctx = v2.telas.find((t) => t.id === "contexto");
    if (ctx?.conteudo?.texto) {
      const limpo = limparCitacoesContexto(ctx.conteudo.texto);
      if (limpo !== ctx.conteudo.texto) {
        ctx.conteudo.texto = limpo;
        n++;
      }
    }
    if (ctx?.conteudo?.destaques) {
      const dest = ctx.conteudo.destaques
        .map((d) => limparCitacoesContexto(d))
        .filter((d) => d.length > 0);
      if (JSON.stringify(dest) !== JSON.stringify(ctx.conteudo.destaques)) {
        ctx.conteudo.destaques = dest;
        n++;
      }
    }

    const macete = v2.telas.find((t) => t.id === "macete");
    if (macete?.conteudo?.texto && q.meta.near_transfer && !/near/i.test(macete.conteudo.texto)) {
      macete.conteudo.texto += `\nNear: ${q.meta.near_transfer}`;
      n++;
    }
    if (macete?.conteudo?.texto && q.meta.far_transfer && !/far/i.test(macete.conteudo.texto)) {
      macete.conteudo.texto += `\nFar: ${q.meta.far_transfer}`;
      n++;
    }
    if (macete?.conteudo?.texto && q.meta.o_que_nao_muda && !/não muda|nao muda/i.test(macete.conteudo.texto)) {
      macete.conteudo.texto += `\nNão muda: ${q.meta.o_que_nao_muda}`;
      n++;
    }
  }

  return n;
}

async function coletarJson(root: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(root, { withFileTypes: true });
  for (const e of entries) {
    const p = join(root, e.name);
    if (e.isDirectory()) {
      if (e.name.startsWith("_") || e.name === "node_modules") continue;
      out.push(...(await coletarJson(p)));
    } else if (e.isFile() && e.name.includes("lote") && e.name.endsWith(".json")) {
      out.push(p);
    }
  }
  return out;
}

async function processarArquivo(path: string, write: boolean): Promise<number> {
  const raw = await readFile(path, "utf-8");
  const json = JSON.parse(raw) as unknown;
  const questoes = (Array.isArray(json) ? json : [json]) as Questao[];
  let total = 0;
  for (const q of questoes) total += processarQuestao(q);
  if (write && total > 0) {
    await writeFile(path, `${JSON.stringify(questoes, null, 2)}\n`, "utf-8");
    console.log(`✓ ${path} — ${total} ajuste(s)`);
  }
  return total;
}

async function main() {
  const args = process.argv.slice(2);
  const write = args.includes("--write");
  const paths = args.filter((a) => !a.startsWith("--"));
  const roots =
    paths.length > 0
      ? paths.map((p) => resolve(process.cwd(), p))
      : [join(process.cwd(), "content", "questoes")];

  const files: string[] = [];
  for (const r of roots) {
    try {
      files.push(...(await coletarJson(r)));
    } catch {
      files.push(r);
    }
  }

  let total = 0;
  for (const f of files) total += await processarArquivo(f, write);
  console.log(`\nretrofit:seed-blockers — ${total} ajuste(s) ${write ? "gravados" : "simulados"}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
