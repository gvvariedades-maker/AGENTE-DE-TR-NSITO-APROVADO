/**
 * Retrofit em massa: preenche texto_grifado e audita G2/G3.
 *
 * Uso:
 *   npm run retrofit:grifos -- content/questoes/legislacao_transito/lote-048.json
 *   npm run retrofit:grifos -- --write content/questoes/legislacao_transito/
 *   npm run retrofit:grifos -- --write --fix-boundaries content/questoes/
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  isWordBoundaryAt,
  validarGrifosTrechoLegal,
  type GrifoInput,
} from "../src/lib/grifo-offsets";
import type { TelaVisual } from "../src/types/estudo-reverso-visual";

interface Relatorio {
  arquivo: string;
  grifosAtualizados: number;
  errosG2: string[];
  errosG3: string[];
}

function expandirAteWordBoundary(
  texto: string,
  inicio: number,
  fim: number,
): { inicio: number; fim: number } | null {
  let i = inicio;
  let f = fim;
  let guard = 0;
  while (!isWordBoundaryAt(texto, i) && i > 0 && guard++ < 20) i--;
  guard = 0;
  while (!isWordBoundaryAt(texto, f) && f < texto.length && guard++ < 20) f++;
  const slice = texto.slice(i, f);
  if (texto.indexOf(slice) !== texto.lastIndexOf(slice)) return null;
  return { inicio: i, fim: f };
}

function processarTelas(
  telas: TelaVisual[],
  fixBoundaries: boolean,
): { telas: TelaVisual[]; atualizados: number; errosG2: string[]; errosG3: string[] } {
  let atualizados = 0;
  const errosG2: string[] = [];
  const errosG3: string[] = [];

  const novas = telas.map((tela) => {
    if (tela.tipo !== "trecho_legal") return tela;
    const texto = tela.conteudo.texto;
    const grifos = [...(tela.conteudo.trechos_grifados ?? [])] as GrifoInput[];

    for (const g of grifos) {
      if (!g.texto_grifado?.trim()) {
        g.texto_grifado = texto.slice(g.inicio, g.fim);
        atualizados++;
      }
      if (fixBoundaries) {
        const exp = expandirAteWordBoundary(texto, g.inicio, g.fim);
        if (exp) {
          g.inicio = exp.inicio;
          g.fim = exp.fim;
          g.texto_grifado = texto.slice(g.inicio, g.fim);
          atualizados++;
        }
      }
    }

    for (const e of validarGrifosTrechoLegal(texto, grifos, { telaId: tela.id })) {
      if (e.codigo === "G2") errosG2.push(e.mensagem);
      if (e.codigo === "G3" || e.codigo === "G3_missing") errosG3.push(e.mensagem);
    }

    return {
      ...tela,
      conteudo: { ...tela.conteudo, trechos_grifados: grifos },
    };
  });

  return { telas: novas, atualizados, errosG2, errosG3 };
}

async function processarArquivo(
  path: string,
  write: boolean,
  fixBoundaries: boolean,
): Promise<Relatorio | null> {
  const raw = await readFile(path, "utf-8");
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }

  const questoes = Array.isArray(json) ? json : [json];
  if (!questoes.length || typeof questoes[0] !== "object") return null;

  let grifosAtualizados = 0;
  const errosG2: string[] = [];
  const errosG3: string[] = [];
  let alterou = false;

  for (const q of questoes as Array<Record<string, unknown>>) {
    for (const campo of ["estudo_reverso_visual", "estudo_reverso_visual_completo"] as const) {
      const visual = q[campo] as { telas?: TelaVisual[] } | undefined;
      if (!visual?.telas) continue;
      const r = processarTelas(visual.telas, fixBoundaries);
      visual.telas = r.telas;
      grifosAtualizados += r.atualizados;
      errosG2.push(...r.errosG2);
      errosG3.push(...r.errosG3);
      if (r.atualizados > 0) alterou = true;
    }
  }

  if (write && alterou) {
    await writeFile(path, `${JSON.stringify(questoes, null, 2)}\n`, "utf-8");
  }

  return { arquivo: path, grifosAtualizados, errosG2, errosG3 };
}

async function coletarJsonFiles(root: string): Promise<string[]> {
  const st = await readdir(root, { withFileTypes: true });
  const files: string[] = [];
  for (const ent of st) {
    const p = join(root, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "_index" || ent.name === "node_modules") continue;
      files.push(...(await coletarJsonFiles(p)));
    } else if (ent.isFile() && ent.name.endsWith(".json")) {
      files.push(p);
    }
  }
  return files;
}

async function main() {
  const args = process.argv.slice(2);
  const write = args.includes("--write");
  const fixBoundaries = args.includes("--fix-boundaries");
  const paths = args.filter((a) => !a.startsWith("--"));

  if (paths.length === 0) {
    console.error(
      "Uso: npm run retrofit:grifos -- [--write] [--fix-boundaries] <arquivo.json|pasta>",
    );
    process.exit(1);
  }

  const files: string[] = [];
  for (const p of paths) {
    const abs = resolve(process.cwd(), p);
    try {
      const st = await readdir(abs);
      if (st) files.push(...(await coletarJsonFiles(abs)));
    } catch {
      files.push(abs);
    }
  }

  let totalGrifos = 0;
  let arquivosComErro = 0;

  for (const file of files) {
    const rel = await processarArquivo(file, write, fixBoundaries);
    if (!rel) continue;
    totalGrifos += rel.grifosAtualizados;
    if (rel.errosG2.length || rel.errosG3.length) {
      arquivosComErro++;
      console.log(`\n${rel.arquivo}`);
      if (rel.grifosAtualizados) {
        console.log(`  grifos atualizados: ${rel.grifosAtualizados}`);
      }
      for (const e of rel.errosG2) console.error(`  G2: ${e}`);
      for (const e of rel.errosG3) console.error(`  G3: ${e}`);
    } else if (rel.grifosAtualizados > 0) {
      console.log(`${rel.arquivo}: ${rel.grifosAtualizados} grifo(s) atualizado(s)`);
    }
  }

  console.log(
    `\nretrofit:grifos — ${totalGrifos} grifo(s) ${write ? "gravados" : "simulados"} | ${arquivosComErro} arquivo(s) com pendência G2/G3`,
  );
  if (arquivosComErro > 0 && !write) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
