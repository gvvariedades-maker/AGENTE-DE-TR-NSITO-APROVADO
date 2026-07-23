/**
 * Diagnose ouro failures for LT lotes.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { isNivelLote007Ouro } from "../src/lib/validations/estudo-reverso-visual";
import { questoesImportFileSchema } from "../src/lib/validations/questao";

const dir = "content/questoes/legislacao_transito";
const files = readdirSync(dir).filter((f) => /^lote-\d+\.json$/.test(f));

for (const f of files) {
  const raw = JSON.parse(readFileSync(join(dir, f), "utf8")) as unknown;
  const arr = Array.isArray(raw) ? raw : [raw];
  const parsed = questoesImportFileSchema.safeParse(arr);
  if (!parsed.success) continue;
  for (const q of parsed.data) {
    if (isNivelLote007Ouro(q)) continue;
    const ids = (q.estudo_reverso_visual_completo?.telas ?? []).map((t) => t.id);
    const passo2 = q.comentario?.passo_a_passo?.[1] ?? "";
    const comp = /competencia_snt/.test(passo2);
    console.log(`${f}: ids=[${ids.join(",")}] compSNT=${comp}`);
  }
}
