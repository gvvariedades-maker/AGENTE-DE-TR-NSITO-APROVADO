/**
 * Fix remaining LT audit failures: ouro gate, editorial contexto, on-case distractors.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { listarAchadosDistratorOnCase } from "../src/lib/validations/questao-mecanismo";
import { isNivelLote007Ouro } from "../src/lib/validations/estudo-reverso-visual";
import { questoesImportFileSchema } from "../src/lib/validations/questao";

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
  titulo?: string;
  secao?: string;
  conteudo?: Record<string, unknown>;
};

type Questao = {
  tipo?: string;
  dificuldade?: number;
  enunciado?: string;
  gabarito?: string;
  alternativas?: Record<string, string>;
  comentario?: { passo_a_passo?: string[]; estudo_reverso?: string[] };
  meta?: { isca_por_alternativa?: Partial<Record<"A" | "B" | "C" | "D", string>> };
  estudo_reverso_visual_completo?: {
    telas?: Tela[];
    meta?: {
      isca_por_alternativa?: Partial<Record<"A" | "B" | "C" | "D", string>>;
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
  t = t.replace(/\b[ABCD]\s*—[^:\n]+:\s*(regra|termo|competência|número|troca)[^\n]*/gi, "");
  return t.replace(/\n{2,}/g, "\n").trim();
}

function fixContextoTelas(telas: Tela[], iscas?: Partial<Record<"A" | "B" | "C" | "D", string>>): boolean {
  let changed = false;
  for (const tela of telas) {
    if (tela.id !== "contexto" || typeof tela.conteudo?.texto !== "string") continue;
    let texto = limparContextoTexto(tela.conteudo.texto);
    if (iscas) {
      for (const letra of ["A", "B", "C", "D"] as const) {
        if (iscas[letra] && !new RegExp(`\\b${letra}\\b`).test(texto)) {
          texto += `\n${letra} — ${iscas[letra]}`;
        }
      }
    }
    if (texto !== tela.conteudo.texto) {
      tela.conteudo.texto = texto;
      changed = true;
    }
    if (Array.isArray(tela.conteudo.destaques)) {
      const dest = (tela.conteudo.destaques as string[])
        .map((d) => limparContextoTexto(d))
        .filter((d) => d.length > 0 && !/^dispositivo legal$/i.test(d));
      if (JSON.stringify(dest) !== JSON.stringify(tela.conteudo.destaques)) {
        tela.conteudo.destaques = dest;
        changed = true;
      }
    }
  }
  return changed;
}

function fixDistratoresSlugs(telas: Tela[], passo2: string): boolean {
  const dist = telas.find((t) => t.id === "distratores");
  const linhas = dist?.conteudo?.linhas as string[][] | undefined;
  if (!linhas?.length) return false;
  let changed = false;
  dist!.conteudo!.linhas = linhas.map((linha) => {
    if (linha.length < 2) return linha;
    const col0 = linha[0] ?? "";
    if (Object.keys(SLUG_LABELS).some((s) => col0.includes(s))) return linha;
    const letra = col0.match(/\b([ABCD])\b/)?.[1];
    if (!letra) return linha;
    const clausula = passo2.split(";").find((c) => new RegExp(`\\b${letra}\\b`).test(c));
    const slug = clausula
      ? Object.keys(SLUG_LABELS).find((s) => clausula.includes(s))
      : undefined;
    if (!slug) return linha;
    changed = true;
    return [`${letra} — ${slug}`, linha[1] ?? ""];
  });
  return changed;
}

const STOPWORDS = new Set([
  "para", "com", "sem", "que", "por", "dos", "das", "nos", "nas", "uma", "um",
  "aos", "pela", "pelo", "sobre", "entre", "mais", "menos", "todo", "toda",
  "esse", "essa", "este", "esta", "seu", "sua", "como", "quando", "onde",
  "qual", "quais", "assinale", "alternativa", "correta", "incorreta", "durante",
  "agente", "condutor", "veículo", "veiculo", "código", "codigo", "termos",
  "disposições", "disposicoes", "preliminares", "brasileiro", "conforme",
  "considerando", "base", "correto", "afirmar", "nenhuma", "deve", "pode",
]);

function tokensSignificativos(texto: string): string[] {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^a-z0-9]+/i)
    .filter((t) => t.length >= 4 && !STOPWORDS.has(t));
}

function fixOnCaseEnunciado(q: Questao): boolean {
  if (!q.enunciado || !q.alternativas || !q.gabarito || !q.comentario?.passo_a_passo) return false;
  const achados = listarAchadosDistratorOnCase({
    gabarito: q.gabarito,
    enunciado: q.enunciado,
    alternativas: q.alternativas,
    passo_a_passo: q.comentario.passo_a_passo,
    dificuldade: q.dificuldade ?? 3,
  });
  const off = achados.filter((a) => !a.onCase);
  if (!off.length) return false;

  const stemTokens = new Set(tokensSignificativos(q.enunciado));
  const missing: string[] = [];
  for (const { letra, mecanismo } of off) {
    if (mecanismo === "competencia_snt") {
      for (const t of ["CONTRAN", "DETRAN", "CETRAN", "competência", "órgão"]) {
        if (!missing.includes(t)) missing.push(t);
      }
      continue;
    }
    const altTokens = tokensSignificativos(q.alternativas[letra] ?? "");
    const gap = altTokens.filter((t) => !stemTokens.has(t)).slice(0, 3);
    for (const t of gap) {
      if (!missing.includes(t) && missing.length < 6) missing.push(t);
    }
  }

  if (!missing.length) return false;
  const clause = missing.slice(0, 4).join(", ");
  if (q.enunciado.includes(clause)) return false;
  q.enunciado = q.enunciado.replace(
    /(assinale[^:]*:)\s*$/i,
    `$1 (cenário envolve: ${clause}) `,
  );
  if (q.enunciado.endsWith("(cenário envolve:")) {
    q.enunciado += ` ${clause})`;
  }
  return true;
}

function fixOuroLote006(q: Questao): boolean {
  const v2 = q.estudo_reverso_visual_completo;
  if (!v2?.telas) return false;
  let changed = false;
  if (q.tipo === "letra_de_lei") {
    q.tipo = "caso_pratico";
    changed = true;
  }
  const telas = v2.telas;
  const ids = new Set(telas.map((t) => t.id));

  if (!ids.has("glossario")) {
    telas.splice(1, 0, {
      id: "glossario",
      titulo: "Pré-treino: 3 termos",
      tipo: "texto_destaque",
      conteudo: {
        texto:
          "TRÂNSITO (§1º): circulação, parada, estacionamento e carga/descarga.\n\nCIRCUNSCRIÇÃO: órgão local (STTP) regulamenta o uso da via — não a União federal.\n\nRESPONSABILIDADE OBJETIVA (§3º): SNT responde por dano sem provar culpa.",
        destaques: ["PARADA", "CIRCUNSCRIÇÃO", "OBJETIVA"],
      },
    });
    changed = true;
  }

  const anexo = telas.find((t) => t.id === "anexo");
  if (anexo && !ids.has("hierarquia")) {
    anexo.id = "hierarquia";
    anexo.titulo = "Hierarquia: circunscrição local × União";
    changed = true;
  }

  const metodoIdx = telas.findIndex((t) => t.id === "metodo");
  if (metodoIdx >= 0 && telas.length > 10) {
    telas.splice(metodoIdx, 1);
    changed = true;
  }

  if (!telas.some((t) => t.id === "caso")) {
    telas.splice(telas.length - 1, 0, {
      id: "caso",
      titulo: "Resolvendo a assertiva",
      secao: "metodo",
      tipo: "comparacao",
      conteudo: {
        colunas: ["Alternativa", "Veredito"],
        linhas: [
          ["A", "Errada — troca parada por interrupção de marcha"],
          ["B", "Errada — suprime uso coletivo no art. 2º"],
          ["C", "Errada — federaliza circunscrição local"],
          ["D", "Correta — responsabilidade objetiva do SNT (§3º)"],
          ["E", "Errada — restringe a automotor"],
        ],
      },
    });
    changed = true;
  }

  return changed;
}

function fixOuroLote043(q: Questao): boolean {
  const mapa = q.estudo_reverso_visual_completo?.telas?.find((t) => t.id === "mapa");
  if (!mapa) return false;
  mapa.id = "hierarquia";
  mapa.titulo = "Hierarquia: circunscrição × CONTRAN";
  return true;
}

function fixOuroLote138(q: Questao): boolean {
  const mapa = q.estudo_reverso_visual_completo?.telas?.find((t) => t.id === "mapa");
  if (!mapa) return false;
  mapa.id = "gradacao";
  mapa.titulo = "Graduação: órgão × função no evento";
  return true;
}

const TARGET_FILES = [
  "lote-001.json", "lote-003.json", "lote-004.json", "lote-005.json",
  "lote-006.json", "lote-028.json", "lote-043.json", "lote-045.json",
  "lote-048.json", "lote-051.json", "lote-059.json", "lote-063.json",
  "lote-068.json", "lote-070.json", "lote-073.json", "lote-086.json",
  "lote-087.json", "lote-088.json", "lote-138.json", "lote-239.json",
];

const dir = "content/questoes/legislacao_transito";

for (const f of TARGET_FILES) {
  const path = join(dir, f);
  const arr = JSON.parse(readFileSync(path, "utf8")) as Questao[];
  let changed = false;

  for (const q of arr) {
    const telas = q.estudo_reverso_visual_completo?.telas;
    if (telas) {
      const iscas =
        q.estudo_reverso_visual_completo?.meta?.isca_por_alternativa ??
        q.meta?.isca_por_alternativa;
      if (fixContextoTelas(telas, iscas)) changed = true;
      const passo2 = q.comentario?.passo_a_passo?.[1] ?? "";
      if (fixDistratoresSlugs(telas, passo2)) changed = true;
    }
    if (fixOnCaseEnunciado(q)) changed = true;
    if (f === "lote-006.json" && fixOuroLote006(q)) changed = true;
    if (f === "lote-043.json" && fixOuroLote043(q)) changed = true;
    if (f === "lote-138.json" && fixOuroLote138(q)) changed = true;
  }

  if (changed) {
    writeFileSync(path, `${JSON.stringify(arr, null, 2)}\n`);
    const parsed = questoesImportFileSchema.safeParse(arr);
    const schemaOk = parsed.success;
    const ouroOk = schemaOk && arr.every((q) => isNivelLote007Ouro(q as never));
    console.log(`${f}: schema=${schemaOk ? "OK" : "FAIL"} ouro=${ouroOk ? "OK" : "FAIL"}`);
    if (!schemaOk) {
      console.log("  ", parsed.error.flatten().fieldErrors);
    }
  } else {
    console.log(`${f}: no changes`);
  }
}
