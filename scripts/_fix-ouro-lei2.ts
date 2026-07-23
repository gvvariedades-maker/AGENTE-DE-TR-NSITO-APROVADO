/**
 * Fix ouro gate: rename 2nd trecho_legal screen to lei2 when missing.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isNivelLote007Ouro } from "../src/lib/validations/estudo-reverso-visual";
import { questoesImportFileSchema } from "../src/lib/validations/questao";

const dir = "content/questoes/legislacao_transito";
const files = readdirSync(dir).filter((f) => /^lote-\d+\.json$/.test(f));

let fixed = 0;
for (const f of files) {
  const path = join(dir, f);
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  const arr = Array.isArray(raw) ? raw : [raw];
  let changed = false;
  for (const q of arr) {
    if (isNivelLote007Ouro(q)) continue;
    const telas = q.estudo_reverso_visual_completo?.telas;
    if (!telas) continue;
    const leiTelas = telas.filter(
      (t: { id: string; tipo?: string }) =>
        t.id.startsWith("lei") || t.tipo === "trecho_legal",
    );
    if (leiTelas.length < 2) continue;
    const hasLei2 = telas.some((t: { id: string }) =>
      ["eixo2", "hierarquia", "lei2"].includes(t.id),
    );
    if (hasLei2) continue;
    const segunda = leiTelas[1];
    if (segunda && segunda.id !== "lei2") {
      segunda.id = "lei2";
      changed = true;
    }
  }
  if (changed) {
    writeFileSync(path, `${JSON.stringify(arr, null, 2)}\n`);
    const parsed = questoesImportFileSchema.safeParse(arr);
    const ok = parsed.success && arr.every((q) => isNivelLote007Ouro(q));
    console.log(`${f}: lei2 renamed → ouro ${ok ? "OK" : "still fail"}`);
    fixed++;
  }
}
console.log(`\nFixed ${fixed} files`);
