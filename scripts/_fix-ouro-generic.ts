/**
 * Generic ouro gate fixes: nucleo→fluxo, mapa→hierarquia when compSNT.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isNivelLote007Ouro } from "../src/lib/validations/estudo-reverso-visual";
import { questoesImportFileSchema } from "../src/lib/validations/questao";

const FILES = ["lote-003.json", "lote-048.json", "lote-059.json", "lote-086.json"];
const dir = "content/questoes/legislacao_transito";

for (const f of FILES) {
  const arr = JSON.parse(readFileSync(join(dir, f), "utf8")) as Array<{
    comentario?: { passo_a_passo?: string[] };
    estudo_reverso_visual_completo?: { telas?: Array<{ id: string; titulo?: string }> };
  }>;
  let changed = false;

  for (const q of arr) {
    const telas = q.estudo_reverso_visual_completo?.telas;
    if (!telas) continue;
    const passo2 = q.comentario?.passo_a_passo?.[1] ?? "";
    const compSNT = /competencia_snt/.test(passo2);
    const ids = new Set(telas.map((t) => t.id));

    const temFluxo =
      ids.has("fluxo") ||
      ids.has("gradacao") ||
      (compSNT && ids.has("diagrama"));
    if (!temFluxo) {
      const nucleo = telas.find((t) => t.id === "nucleo");
      if (nucleo) {
        nucleo.id = "fluxo";
        changed = true;
      }
    }

    if (compSNT && !ids.has("hierarquia") && !ids.has("diagrama")) {
      const candidato =
        telas.find((t) => t.id === "mapa") ??
        telas.find((t) => t.id === "escopo") ??
        telas.find((t) => t.id === "historico");
      if (candidato) {
        candidato.id = "hierarquia";
        changed = true;
      }
    }
  }

  if (changed) {
    writeFileSync(join(dir, f), `${JSON.stringify(arr, null, 2)}\n`);
    const ok =
      questoesImportFileSchema.safeParse(arr).success &&
      arr.every((q) => isNivelLote007Ouro(q as never));
    console.log(`${f}: ouro ${ok ? "OK" : "FAIL"}`);
  }
}
