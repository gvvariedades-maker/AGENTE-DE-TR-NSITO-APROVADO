/**
 * Cruza cobertura.json com mapa de clusters CTB/CONTRAN.
 *
 * Uso: npm run check:ctb-cobertura
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  buildCtbChecklist,
  CTB_CHECKLIST_PATH,
  formatChecklistTerminal,
  type CtbChecklistIndex,
} from "../src/lib/ctb-checklist-cobertura";
import { COBERTURA_INDEX_PATH, type CoberturaIndex } from "../src/lib/questoes-cobertura";

async function main() {
  const root = process.cwd();
  const coberturaPath = join(root, COBERTURA_INDEX_PATH);

  let coberturaRaw: string;
  try {
    coberturaRaw = await readFile(coberturaPath, "utf-8");
  } catch {
    console.error(`✗ ${COBERTURA_INDEX_PATH} não encontrado. Rode: npm run index:questoes`);
    process.exit(1);
  }

  const cobertura = JSON.parse(coberturaRaw) as CoberturaIndex;
  const checklist = buildCtbChecklist(cobertura);
  const outPath = join(root, CTB_CHECKLIST_PATH);

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(checklist, null, 2)}\n`, "utf-8");

  console.log(formatChecklistTerminal(checklist));
  console.log("");
  console.log(`✓ Checklist gerado → ${CTB_CHECKLIST_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
