#!/usr/bin/env node
/**
 * Normaliza nomes mojibake, deduplica arquivos e move PDFs soltos em conteúdo/.
 * Uso: node scripts/consolidar-conteudo.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projeto = path.resolve(__dirname, "..");

function acharConteudoDir() {
  for (const entry of fs.readdirSync(projeto, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.toLowerCase().includes("conte")) continue;
    const p = path.join(projeto, entry.name);
    if (fs.existsSync(path.join(p, "FONTES.md"))) return p;
  }
  throw new Error("Pasta conteúdo/ não encontrada");
}

const MOJIBAKE_FIXES = [
  ["RESOLUÃ‡ÃƒO", "RESOLUÇÃO"],
  ["ResoluÃ§Ã£o", "Resolução"],
  ["RetificaÃ§Ã£o", "Retificação"],
  ["conteÃºdo", "conteúdo"],
  ["programÃ¡tico", "programático"],
  ["LegislaÃ§Ã£o", "Legislação"],
  ["legislaÃ§Ã£o", "legislação"],
  ["questÃµes", "questões"],
  ["questÃµes", "questões"],
  ["resoluÃ§Ãµes", "resoluções"],
  ["resoluÃ§Ãµes", "resoluções"],
  ["TrÃ¢nsito", "Trânsito"],
  ["prorrogaÃ§Ã£o", "prorrogação"],
  ["inscriÃ§Ãµes", "inscrições"],
  ["especÃ­fico", "específico"],
  ["especÃfico", "específico"],
  ["MARÃ‡O", "MARÇO"],
  ["NÂº", "Nº"],
  ["DEZEMBRO", "DEZEMBRO"],
  ["JULHO", "JULHO"],
];

function normalizarNome(nome) {
  let out = nome;
  for (const [bad, good] of MOJIBAKE_FIXES) {
    out = out.split(bad).join(good);
  }
  return out;
}

function extrairNumeroResolucao(nome) {
  const m = nome.match(/(\d{1,4})/);
  return m ? m[1].replace(/^0+/, "") || m[1] : null;
}

function listarArquivos(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listarArquivos(full));
    else out.push(full);
  }
  return out;
}

const CANONICAL_DIRS = {
  edital: "edital",
  "historia-cg-pb": "historia-cg-pb",
  "legislacao federal": "legislação federal",
  municipal: "municipal",
  "questoes reais": "questões reais",
  "resolucoes contran": "resoluções CONTRAN",
  senatran: "senatran",
};

function canonicalDirName(name) {
  const fixed = normalizarNome(name);
  const ascii = fixed
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return CANONICAL_DIRS[ascii] ?? fixed;
}

function mesclarPastasDuplicadas(baseDir) {
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  const grupos = new Map();

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const canon = canonicalDirName(entry.name);
    if (!grupos.has(canon)) grupos.set(canon, []);
    grupos.get(canon).push(entry.name);
  }

  for (const [canon, nomes] of grupos) {
    if (nomes.length <= 1 && nomes[0] === canon) continue;

    const destDir = path.join(baseDir, canon);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    for (const nome of nomes) {
      if (nome === canon) continue;
      const srcDir = path.join(baseDir, nome);
      for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
        const src = path.join(srcDir, entry.name);
        const destName = normalizarNome(entry.name);
        const dest = path.join(destDir, destName);
        if (fs.existsSync(dest)) {
          const srcSize = fs.statSync(src).size;
          const destSize = fs.statSync(dest).size;
          if (srcSize > destSize) {
            fs.unlinkSync(dest);
            fs.renameSync(src, dest);
            log.movidos.push({ de: path.join(nome, entry.name), para: path.join(canon, destName), substituiu: true });
          } else {
            fs.unlinkSync(src);
            log.removidos.push({ arquivo: path.join(nome, entry.name), motivo: "duplicata em pasta mojibake" });
          }
        } else {
          fs.renameSync(src, dest);
          log.movidos.push({ de: path.join(nome, entry.name), para: path.join(canon, destName) });
        }
      }
      fs.rmdirSync(srcDir);
      log.removidos.push({ arquivo: nome + "/", motivo: "pasta duplicada mojibake" });
    }
  }
}

const base = acharConteudoDir();
const contranDir = path.join(base, "resoluções CONTRAN");
const log = { renomeados: [], removidos: [], movidos: [] };

// 0) Mesclar pastas duplicadas por encoding
mesclarPastasDuplicadas(base);

// 1) Mover PDFs CONTRAN soltos na raiz de conteúdo/
for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  if (!/RESOLU/i.test(entry.name) || !entry.name.endsWith(".pdf")) continue;
  const dest = path.join(contranDir, normalizarNome(entry.name));
  const src = path.join(base, entry.name);
  if (!fs.existsSync(dest)) {
    fs.renameSync(src, dest);
    log.movidos.push({ de: entry.name, para: path.relative(base, dest) });
  } else {
    fs.unlinkSync(src);
    log.removidos.push({ arquivo: entry.name, motivo: "duplicata na raiz" });
  }
}

// 2) Renomear arquivos com mojibake (bottom-up para não quebrar paths)
const todos = listarArquivos(base).sort((a, b) => b.length - a.length);
for (const full of todos) {
  const dir = path.dirname(full);
  const nome = path.basename(full);
  const novoNome = normalizarNome(nome);
  if (novoNome === nome) continue;

  const dest = path.join(dir, novoNome);
  if (fs.existsSync(dest)) {
    const srcSize = fs.statSync(full).size;
    const destSize = fs.statSync(dest).size;
    if (srcSize > destSize) {
      fs.unlinkSync(dest);
      fs.renameSync(full, dest);
      log.renomeados.push({ de: nome, para: novoNome, substituiu: true });
    } else {
      fs.unlinkSync(full);
      log.removidos.push({ arquivo: nome, motivo: "duplicata mojibake menor" });
    }
  } else {
    fs.renameSync(full, dest);
    log.renomeados.push({ de: nome, para: novoNome });
  }
}

// 3) Deduplicar resoluções CONTRAN pelo número (manter maior arquivo)
const porNumero = new Map();
for (const entry of fs.readdirSync(contranDir, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  const num = extrairNumeroResolucao(entry.name);
  if (!num || entry.name.includes("IDECAN")) continue;
  const full = path.join(contranDir, entry.name);
  const size = fs.statSync(full).size;
  const prev = porNumero.get(num);
  if (!prev || size > prev.size) {
    if (prev) {
      fs.unlinkSync(prev.path);
      log.removidos.push({ arquivo: prev.name, motivo: `duplicata res. ${num}` });
    }
    porNumero.set(num, { path: full, name: entry.name, size });
  } else {
    fs.unlinkSync(full);
    log.removidos.push({ arquivo: entry.name, motivo: `duplicata res. ${num}` });
  }
}

const relatorio = path.join(base, "consolidacao-relatorio.json");
fs.writeFileSync(relatorio, JSON.stringify({ quando: new Date().toISOString(), ...log }, null, 2));

console.log(`Consolidado em ${base}`);
console.log(`  Renomeados: ${log.renomeados.length}`);
console.log(`  Removidos:  ${log.removidos.length}`);
console.log(`  Movidos:    ${log.movidos.length}`);
console.log(`  Relatório:  ${relatorio}`);
