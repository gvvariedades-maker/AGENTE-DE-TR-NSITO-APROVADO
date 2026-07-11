/**
 * Preview humano dos grifos legais — rede de segurança antes do seed.
 *
 * Uso:
 *   npm run preview:grifos -- content/questoes/legislacao_transito/lote-090.json
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  formatarPreviewGrifo,
  validarGrifosTrechoLegal,
  type GrifoInput,
} from "../src/lib/grifo-offsets";
import { questoesImportFileSchema } from "../src/lib/validations/questao";
import type { TelaVisual } from "../src/types/estudo-reverso-visual";

function coletarTelasLegais(questao: {
  estudo_reverso_visual?: { telas: TelaVisual[] } | null;
  estudo_reverso_visual_completo?: { telas: TelaVisual[] } | null;
}): Array<{ label: string; tela: TelaVisual }> {
  const out: Array<{ label: string; tela: TelaVisual }> = [];
  const v1 = questao.estudo_reverso_visual?.telas ?? [];
  const v2 = questao.estudo_reverso_visual_completo?.telas ?? [];

  for (const tela of v1) {
    if (tela.tipo === "trecho_legal") {
      out.push({ label: "v1", tela });
    }
  }
  for (const tela of v2) {
    if (tela.tipo === "trecho_legal") {
      out.push({ label: "v2", tela });
    }
  }
  return out;
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Uso: npm run preview:grifos -- <arquivo.json>");
    process.exit(1);
  }

  const absolute = resolve(process.cwd(), filePath);
  const raw = await readFile(absolute, "utf-8");
  const json = JSON.parse(raw) as unknown;
  const questoesInput = Array.isArray(json) ? json : [json];
  const parsed = questoesImportFileSchema.safeParse(questoesInput);

  if (!parsed.success) {
    console.error(`❌ Schema inválido em ${filePath}`);
    console.error(parsed.error.flatten());
    process.exit(1);
  }

  let erros = 0;
  console.log(`\n🔍 preview:grifos — ${filePath}\n`);

  for (const [i, q] of parsed.data.entries()) {
    const telas = coletarTelasLegais(q);
    if (telas.length === 0) continue;

    console.log(`── Q${i + 1} [${q.topico}] ──`);

    for (const { label, tela } of telas) {
      if (tela.tipo !== "trecho_legal") continue;
      const texto = tela.conteudo.texto;
      const grifos = (tela.conteudo.trechos_grifados ?? []) as GrifoInput[];

      console.log(`[${label}/${tela.id}] ${tela.conteudo.fonte}`);

      if (grifos.length === 0) {
        console.log("  (sem grifos)\n");
        continue;
      }

      const errosGrifo = validarGrifosTrechoLegal(texto, grifos, {
        telaId: tela.id,
        legacyGrifos: false,
      });

      for (const g of grifos) {
        console.log(formatarPreviewGrifo(texto, g));
      }

      for (const e of errosGrifo) {
        erros++;
        console.error(`  ❌ ${e.mensagem}`);
      }
      console.log("");
    }
  }

  if (erros > 0) {
    console.error(`preview:grifos: ${erros} erro(s) de grifo`);
    process.exit(1);
  }

  console.log("✅ preview:grifos — todos os grifos OK\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
