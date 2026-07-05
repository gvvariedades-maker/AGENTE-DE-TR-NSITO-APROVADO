/**
 * Injeta/atualiza estudo_reverso_visual em lotes JSON.
 * Uso: npx tsx scripts/patch-estudo-reverso-visual.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SNIPPET_DIR = join(
  ROOT,
  "content/questoes/legislacao_transito/_snippets",
);

function loadSnippet(name: string) {
  return JSON.parse(
    readFileSync(join(SNIPPET_DIR, `${name}.json`), "utf8"),
  );
}

const competenciasVisual = loadSnippet("competencias-sttp-visual");

const visualsByTopico: Record<string, unknown> = {
  CTB_snt_competencias: competenciasVisual,
  CTB_sinalizacao: loadSnippet("sinalizacao-art90-visual"),
  CTB_infracoes_semaforo: loadSnippet("semaforo-44a-visual"),
  CTB_infracoes_velocidade: loadSnippet("velocidade-218-visual"),
  CTB_infracoes_cinto: loadSnippet("cinto-167-visual"),
  CTB_infracoes_estacionamento: loadSnippet("estacionamento-181-visual"),
  CTB_processo_administrativo: loadSnippet("auto-280-visual"),
  CTB_circulacao_conduta: loadSnippet("celular-252-visual"),
  CTB_infracoes_velocidade_baixa: loadSnippet("velocidade-219-visual"),
  CTB_engenharia_fiscalizacao: loadSnippet("art93-visual"),
};

function topicoKey(q: {
  topico: string;
  tags?: string[];
  enunciado: string;
}): string {
  if (q.topico === "CTB_infracoes") {
    if (q.tags?.includes("art_44-A") || q.enunciado.includes("Epitácio")) {
      return "CTB_infracoes_semaforo";
    }
    if (q.tags?.includes("art_218")) return "CTB_infracoes_velocidade";
    if (q.tags?.includes("art_167")) return "CTB_infracoes_cinto";
    if (q.tags?.includes("art_181")) return "CTB_infracoes_estacionamento";
    if (q.tags?.includes("art_219")) return "CTB_infracoes_velocidade_baixa";
  }
  return q.topico;
}

function patchLote001() {
  const path = join(ROOT, "content/questoes/legislacao_transito/lote-001.json");
  const questoes = JSON.parse(readFileSync(path, "utf8")) as Array<{
    topico: string;
    tags?: string[];
    enunciado: string;
    estudo_reverso_visual?: unknown;
  }>;

  for (const q of questoes) {
    const key = topicoKey(q);
    const visual = visualsByTopico[key];
    if (visual) q.estudo_reverso_visual = visual;
  }

  writeFileSync(path, `${JSON.stringify(questoes, null, 2)}\n`, "utf8");
  console.log(`Patched lote-001.json (${questoes.length} questões)`);
}

function patchCompetenciasInFile(relPath: string, isArray: boolean) {
  const path = join(ROOT, relPath);
  if (isArray) {
    const questoes = JSON.parse(readFileSync(path, "utf8")) as Array<{
      topico: string;
      estudo_reverso_visual?: unknown;
    }>;
    for (const q of questoes) {
      if (q.topico === "CTB_snt_competencias") {
        q.estudo_reverso_visual = competenciasVisual;
      }
    }
    writeFileSync(path, `${JSON.stringify(questoes, null, 2)}\n`, "utf8");
  } else {
    const q = JSON.parse(readFileSync(path, "utf8")) as {
      estudo_reverso_visual?: unknown;
    };
    q.estudo_reverso_visual = competenciasVisual;
    writeFileSync(path, `${JSON.stringify(q, null, 2)}\n`, "utf8");
  }
  console.log(`Patched ${relPath}`);
}

patchLote001();
patchCompetenciasInFile(
  "content/questoes/legislacao_transito/lote-002.json",
  true,
);
patchCompetenciasInFile(
  ".cursor/skills/estudo-reverso-visual/exemplos-ouro/ctb-competencias-snt.json",
  false,
);
