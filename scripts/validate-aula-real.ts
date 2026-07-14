/**
 * Gate de paridade aula REAL × inédita.
 *
 * Uso:
 *   npm run validate:aula-real -- content/questoes-reais/.../lote-NNN.json
 *   AULA_REAL_LEGACY=1  ou  --legacy-aula-real
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { questoesImportFileSchema } from "../src/lib/validations/questao";

function isLegacy(): boolean {
  return process.env.AULA_REAL_LEGACY === "1";
}

function isTelaContraste(tela: {
  id?: string;
  secao?: string;
  titulo?: string;
  tipo?: string;
}): boolean {
  if (tela.tipo !== "comparacao") return false;
  const id = (tela.id ?? "").toLowerCase();
  const secao = (tela.secao ?? "").toLowerCase();
  const titulo = (tela.titulo ?? "").toLowerCase();
  if (id === "distratores" || secao === "distratores" || titulo.includes("distrator")) {
    return false;
  }
  return (
    id === "contraste" ||
    secao === "contraste" ||
    titulo.includes("contraste") ||
    titulo.includes("crença") ||
    titulo.includes("crenca") ||
    titulo.includes("armadilha")
  );
}

function colunasParecemCrencaLei(colunas: [string, string]): boolean {
  const e = colunas[0].toLowerCase();
  const d = colunas[1].toLowerCase();
  const blob = `${e} ${d}`;
  // "Alternativa ✗" sozinho NÃO conta como crença (anti-exemplo ouro).
  if (/^alternativa\b/.test(e.trim()) && !e.includes("cren") && !e.includes("pensa")) {
    return false;
  }
  const temCrenca =
    blob.includes("crença") ||
    blob.includes("crenca") ||
    blob.includes("pensa") ||
    blob.includes("isca") ||
    blob.includes("troca") ||
    blob.includes("armadilha") ||
    (colunas[0].includes("✗") && !/^alternativa\b/i.test(e.trim()));
  const temLei =
    blob.includes("lei") ||
    blob.includes("correto") ||
    blob.includes("certo") ||
    colunas[1].includes("✓");
  return temCrenca && temLei;
}

function colunasSaoAtribuicaoOrgao(colunas: [string, string]): boolean {
  const e = colunas[0].toLowerCase();
  const d = colunas[1].toLowerCase();
  if (e.includes("cren") || e.includes("pensa") || e.includes("troca") || e.includes("isca")) {
    return false;
  }
  const esquerdaLista =
    e.includes("alternativa") || e.includes("atribui") || e.includes("ação");
  const direitaOrgao =
    d.includes("órgão") ||
    d.includes("orgao") ||
    d.includes("contran") ||
    d.includes("cetran") ||
    d.includes("jari");
  return esquerdaLista && direitaOrgao;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--legacy-aula-real")) {
    process.env.AULA_REAL_LEGACY = "1";
  }
  const filePath = args.find((a) => !a.startsWith("--"));

  if (!filePath) {
    console.error(
      "Uso: npm run validate:aula-real -- <arquivo.json> [--legacy-aula-real]",
    );
    process.exit(1);
  }

  if (isLegacy()) {
    console.log(`⚠ validate:aula-real — legado ativo (${filePath}); pulando gates rígidos\n`);
    process.exit(0);
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

  const erros: string[] = [];
  let checadas = 0;

  for (let i = 0; i < parsed.data.length; i++) {
    const q = parsed.data[i]!;
    if (q.meta?.origem !== "real_idecan") continue;
    checadas++;
    const n = i + 1;
    const tec = q.meta.tec_id ? ` tec=${q.meta.tec_id}` : "";
    const completo = q.estudo_reverso_visual_completo;
    const telas = completo.telas;

    if (telas.length < 7 || telas.length > 11) {
      erros.push(`Q${n}${tec}: completo tem ${telas.length} telas (exigido 7–11)`);
    }

    const contraste = telas.find((t) => isTelaContraste(t));
    if (!contraste || contraste.tipo !== "comparacao") {
      erros.push(`Q${n}${tec}: falta tela contraste (comparacao crença × lei)`);
    } else {
      const cols = contraste.conteudo.colunas;
      if (!colunasParecemCrencaLei(cols)) {
        erros.push(
          `Q${n}${tec}: contraste colunas "${cols[0]}" | "${cols[1]}" — use Crença ✗ × Lei ✓ (ou Troca/Armadilha × correto)`,
        );
      }
      if (colunasSaoAtribuicaoOrgao(cols)) {
        erros.push(
          `Q${n}${tec}: contraste parece "atribuição → órgão" — reprovado (anti-exemplo ouro). Reescreva como crença falsa × lei.`,
        );
      }
    }

    const macete = telas.find((t) => t.id === "macete" || t.secao === "macete");
    if (!macete || macete.tipo !== "texto_destaque") {
      erros.push(`Q${n}${tec}: falta tela macete`);
    } else {
      const texto = macete.conteudo.texto.toLowerCase();
      if (!/near/i.test(texto)) {
        erros.push(`Q${n}${tec}: macete sem "Near"`);
      }
      if (!/far/i.test(texto)) {
        erros.push(`Q${n}${tec}: macete sem "Far"`);
      }
      if (!/n[aã]o muda/i.test(texto)) {
        erros.push(`Q${n}${tec}: macete sem "Não muda"`);
      }
    }

    for (const t of telas) {
      if (/\bstem\b/i.test(t.titulo)) {
        erros.push(`Q${n}${tec}: tela "${t.id}" título com jargão "stem"`);
      }
    }

    if (!q.meta.padrao_familia?.trim()) {
      erros.push(`Q${n}${tec}: meta.padrao_familia ausente`);
    }
    if (!q.meta.eficacia_pos_aula || q.meta.eficacia_pos_aula.length !== 3) {
      erros.push(`Q${n}${tec}: meta.eficacia_pos_aula incompleto`);
    }
    if (!q.meta.isca_por_alternativa || Object.keys(q.meta.isca_por_alternativa).length === 0) {
      erros.push(`Q${n}${tec}: meta.isca_por_alternativa ausente`);
    }
  }

  if (checadas === 0) {
    console.log(
      `ℹ validate:aula-real — nenhuma questão real_idecan em ${filePath} (ok)\n`,
    );
    process.exit(0);
  }

  if (erros.length > 0) {
    console.error(`❌ validate:aula-real — ${filePath} (${checadas} real(is))\n`);
    for (const e of erros) console.error(`  • ${e}`);
    console.error(
      `\nCorrija ou use --legacy-aula-real (só lotes antigos). Ouro: content/questoes-reais/_ouro/real-aula-nota-10.md\n`,
    );
    process.exit(1);
  }

  console.log(
    `✓ validate:aula-real — ${filePath}: ${checadas} real(is) com paridade aula OK\n`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
