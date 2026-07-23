/**
 * Retrofit editorial LT: contexto limpo, ouro lei2, estudo_reverso max 3.
 *
 * Uso: npx tsx scripts/retrofit-lt-editorial.ts [--write] [arquivo|pasta...]
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const SLUG_LABELS: Record<string, string> = {
  numero_vizinho: "número vizinho",
  competencia_snt: "competência SNT",
  gravidade: "classificação errada",
  regra_excecao: "regra × exceção",
  termo_unico: "termo inventado",
};

const ART_REF = /\bart\.\s*[\dºª]+(?:\s*,\s*§\s*[\dº]+)?/gi;
const PAR_REF = /§\s*[\dº]+/g;

type Tela = {
  id: string;
  tipo?: string;
  conteudo?: {
    texto?: string;
    destaques?: string[];
    colunas?: string[];
    linhas?: string[][];
    trechos_grifados?: Array<{ inicio: number; fim: number; texto_grifado?: string }>;
  };
};

type Questao = Record<string, unknown> & {
  comentario?: { passo_a_passo?: string[]; estudo_reverso?: string[] };
  meta?: { isca_por_alternativa?: Partial<Record<"A" | "B" | "D", string>> };
  estudo_reverso_visual_completo?: {
    telas?: Tela[];
    meta?: {
      eixos_legais?: string[];
      isca_por_alternativa?: Partial<Record<"A" | "B" | "D", string>>;
    };
  };
};

function limparContextoTexto(texto: string): string {
  let t = texto;
  for (const [slug, label] of Object.entries(SLUG_LABELS)) {
    t = t.replaceAll(slug, label);
  }
  t = t.replace(ART_REF, "dispositivo legal");
  t = t.replace(PAR_REF, "parágrafo");
  // Remove análise "erra por" — pertence à tela distratores
  t = t.replace(/\b[ABCD]\s*—[^:\n]+:\s*(regra|termo|competência|número|troca)[^\n]*/gi, "");
  t = t.replace(/\n{2,}/g, "\n").trim();
  return t;
}

function limparDestaques(destaques: string[]): string[] {
  return destaques
    .map((d) => limparContextoTexto(d))
    .filter((d) => d.length > 0 && !/^dispositivo legal$/i.test(d));
}

function fixContextoTelas(
  telas: Tela[],
  iscas?: Partial<Record<"A" | "B" | "D", string>>,
): number {
  let n = 0;
  for (const tela of telas) {
    if (tela.id !== "contexto" || tela.conteudo?.texto == null) continue;
    let texto = limparContextoTexto(tela.conteudo.texto);
    if (iscas) {
      for (const letra of ["A", "B", "D"] as const) {
        if (iscas[letra] && !new RegExp(`\\b${letra}\\b`).test(texto)) {
          texto += `\n${letra} — ${iscas[letra]}`;
          n++;
        }
      }
    }
    if (texto !== tela.conteudo.texto) {
      tela.conteudo.texto = texto;
      n++;
    }
    if (tela.conteudo.destaques) {
      const dest = limparDestaques(tela.conteudo.destaques);
      if (JSON.stringify(dest) !== JSON.stringify(tela.conteudo.destaques)) {
        tela.conteudo.destaques = dest;
        n++;
      }
    }
  }
  return n;
}

function fixOuroLei2(telas: Tela[]): number {
  const leiTelas = telas.filter(
    (t) => t.id.startsWith("lei") || t.tipo === "trecho_legal",
  );
  if (leiTelas.length < 2) return 0;
  const hasLei2 = telas.some((t) => ["eixo2", "hierarquia", "lei2"].includes(t.id));
  if (hasLei2) return 0;
  const segunda = leiTelas[1]!;
  if (segunda.id !== "lei2") {
    segunda.id = "lei2";
    return 1;
  }
  return 0;
}

function fixDistratoresSlugs(telas: Tela[], passo2: string): number {
  const dist = telas.find((t) => t.id === "distratores");
  if (!dist?.conteudo?.linhas?.length) return 0;
  const linhas = dist.conteudo.linhas;
  let n = 0;
  const novas = linhas.map((linha) => {
    if (linha.length < 2) return linha;
    const col0 = linha[0] ?? "";
    const hasSlug = Object.keys(SLUG_LABELS).some((s) => col0.includes(s));
    if (hasSlug) return linha;
    // Tentar extrair letra e mecanismo do passo2
    const letraMatch = col0.match(/\b([ABCD])\b/);
    const letra = letraMatch?.[1];
    if (!letra) return linha;
    const clausula = passo2
      .split(";")
      .find((c) => new RegExp(`\\b${letra}\\b`).test(c));
    if (!clausula) return linha;
    const slug = Object.keys(SLUG_LABELS).find((s) => clausula.includes(s));
    if (!slug) return linha;
    n++;
    return [`${letra} — ${slug}`, linha[1] ?? ""];
  });
  if (n > 0) dist.conteudo.linhas = novas;
  return n;
}

function fixEstudoReverso(q: Questao): number {
  const er = q.comentario?.estudo_reverso;
  if (!er || er.length <= 3) return 0;
  q.comentario!.estudo_reverso = er.slice(0, 3);
  return 1;
}

function fixGrifosMax3(telas: Tela[]): number {
  let n = 0;
  for (const tela of telas) {
    const grifos = tela.conteudo?.trechos_grifados;
    if (!grifos || grifos.length <= 3) continue;
    tela.conteudo!.trechos_grifados = grifos.slice(0, 3);
    n++;
  }
  return n;
}

function processarQuestao(q: Questao): number {
  let n = 0;
  n += fixEstudoReverso(q);
  const v2 = q.estudo_reverso_visual_completo;
  if (v2?.telas) {
    const iscas = v2.meta?.isca_por_alternativa ?? q.meta?.isca_por_alternativa;
    n += fixContextoTelas(v2.telas, iscas);
    n += fixOuroLei2(v2.telas);
    n += fixGrifosMax3(v2.telas);
    const passo2 = q.comentario?.passo_a_passo?.[1] ?? "";
    n += fixDistratoresSlugs(v2.telas, passo2);
  }
  return n;
}

async function coletarJson(root: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(root, { withFileTypes: true });
  for (const e of entries) {
    const p = join(root, e.name);
    if (e.isDirectory()) {
      if (e.name.startsWith("_")) continue;
      out.push(...(await coletarJson(p)));
    } else if (e.isFile() && /^lote-\d+\.json$/.test(e.name)) {
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
      : [join(process.cwd(), "content/questoes/legislacao_transito")];

  const files: string[] = [];
  for (const r of roots) {
    try {
      files.push(...(await coletarJson(r)));
    } catch {
      files.push(r);
    }
  }

  let total = 0;
  for (const f of files.sort()) total += await processarArquivo(f, write);
  console.log(`\nretrofit:lt-editorial — ${total} ajuste(s) ${write ? "gravados" : "simulados"}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
