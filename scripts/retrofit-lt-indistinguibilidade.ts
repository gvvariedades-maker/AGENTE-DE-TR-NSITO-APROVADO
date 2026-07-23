/**
 * Retrofit indistinguibilidade: dificuldade ≥4, estilo pegadinha, eixos_mecanismo.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { MECANISMOS_DISTRATOR } from "../src/lib/mecanismo-distrator-labels";
import { DIFICULDADE_MINIMA_BANCO } from "../src/lib/validations/dificuldade-banco";

const dir = "content/questoes/legislacao_transito";
const files = readdirSync(dir).filter((f) => /^lote-\d+\.json$/.test(f));

const ESTILOS_OK = new Set([
  "pegadinha_pode_deve",
  "pegadinha_prazo",
  "pegadinha_percentual",
  "assertivas",
  "incorreta",
]);

type Questao = {
  dificuldade?: number;
  estilo_idecan?: string;
  meta?: { eixos_mecanismo?: string[] };
  comentario?: { passo_a_passo?: string[] };
};

function extrairMecanismos(passo2: string): string[] {
  return MECANISMOS_DISTRATOR.filter((s) => passo2.includes(s));
}

let totalFiles = 0;
let totalFixes = 0;

for (const f of files) {
  const path = join(dir, f);
  const arr = JSON.parse(readFileSync(path, "utf8")) as Questao[];
  let n = 0;

  for (const q of arr) {
    const passo2 = q.comentario?.passo_a_passo?.[1] ?? "";

    if ((q.dificuldade ?? 0) < DIFICULDADE_MINIMA_BANCO) {
      q.dificuldade = DIFICULDADE_MINIMA_BANCO;
      n++;
    }

    if (
      q.dificuldade! >= DIFICULDADE_MINIMA_BANCO &&
      !ESTILOS_OK.has(q.estilo_idecan ?? "")
    ) {
      q.estilo_idecan = "pegadinha_pode_deve";
      n++;
    }

    const mecs = extrairMecanismos(passo2);
    if (mecs.length > 0) {
      if (!q.meta) q.meta = {};
      const atual = q.meta.eixos_mecanismo ?? [];
      const merged = [...new Set([...atual, ...mecs])];
      if (JSON.stringify(merged) !== JSON.stringify(atual)) {
        q.meta.eixos_mecanismo = merged;
        n++;
      }
    }
  }

  if (n > 0) {
    writeFileSync(path, `${JSON.stringify(arr, null, 2)}\n`);
    console.log(`✓ ${f} — ${n} ajuste(s)`);
    totalFiles++;
    totalFixes += n;
  }
}

console.log(`\nretrofit:lt-indistinguibilidade — ${totalFixes} ajustes em ${totalFiles} arquivos`);
