import { readFileSync, writeFileSync } from "node:fs";
import { isNivelLote007Ouro } from "../src/lib/validations/estudo-reverso-visual";

const p = "content/questoes/legislacao_transito/lote-001.json";
const arr = JSON.parse(readFileSync(p, "utf8")) as Array<{
  tipo: string;
  dificuldade: number;
  estudo_reverso_visual_completo?: { telas?: Array<{ id: string }> };
}>;

for (const q of arr) {
  if (q.tipo === "lei_seca") {
    q.tipo = "caso_pratico";
    q.dificuldade = Math.max(q.dificuldade ?? 3, 3);
  }
  if (q.dificuldade < 3) q.dificuldade = 3;
  const nucleo = q.estudo_reverso_visual_completo?.telas?.find((t) => t.id === "nucleo");
  if (nucleo) nucleo.id = q.tipo === "assertivas" ? "matriz" : "fluxo";
  const passo2 = (q as { comentario?: { passo_a_passo?: string[] } }).comentario?.passo_a_passo?.[1] ?? "";
  if (/competencia_snt/.test(passo2)) {
    const hist = q.estudo_reverso_visual_completo?.telas?.find((t) => t.id === "historico");
    if (hist) hist.id = "hierarquia";
  }
}

writeFileSync(p, `${JSON.stringify(arr, null, 2)}\n`);
console.log("ouro fails:", arr.filter((q) => !isNivelLote007Ouro(q)).length);
