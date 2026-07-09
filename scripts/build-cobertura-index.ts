/**
 * Gera content/questoes/_index/cobertura.json a partir de todos os lotes.
 *
 * Uso: npm run index:questoes
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  buildCoberturaIndex,
  COBERTURA_INDEX_PATH,
  resumoCoberturaPorTopico,
} from "../src/lib/questoes-cobertura";

async function main() {
  const root = process.cwd();
  const contentDir = join(root, "content", "questoes");
  const index = await buildCoberturaIndex(contentDir);
  const outPath = join(root, COBERTURA_INDEX_PATH);

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(index, null, 2)}\n`, "utf-8");

  console.log(`✓ Índice de cobertura — ${index.total} questões`);
  console.log(`  → ${COBERTURA_INDEX_PATH}`);

  const infracoes = resumoCoberturaPorTopico(index, "CTB_infracoes");
  if (Object.keys(infracoes).length > 0) {
    console.log("\n  CTB_infracoes (eixos ocupados):");
    for (const e of infracoes.CTB_infracoes?.eixos ?? []) {
      console.log(`    · ${e}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
