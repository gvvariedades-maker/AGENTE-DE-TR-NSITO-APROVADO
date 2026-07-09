#!/usr/bin/env tsx
/** Valida só estudo_reverso_visual_completo em espelhos ouro (sem schema de questão). */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { estudoReversoVisualCompletoSchema } from "../../../../src/lib/validations/estudo-reverso-visual";

const file = process.argv[2];
if (!file) {
  console.error("Uso: tsx validate-espelho-v2.ts <arquivo.json>");
  process.exit(1);
}

const json = JSON.parse(readFileSync(resolve(file), "utf-8")) as {
  estudo_reverso_visual_completo?: unknown;
};
const v2 = json.estudo_reverso_visual_completo;
if (!v2) {
  console.error("Sem estudo_reverso_visual_completo");
  process.exit(1);
}

const r = estudoReversoVisualCompletoSchema.safeParse(v2);
if (!r.success) {
  console.error(r.error.flatten());
  process.exit(1);
}
console.log(`✓ v2 OK — ${r.data.telas.length} telas`);
