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

const base = acharConteudoDir();
const contranDir = path.join(base, "resoluções CONTRAN");
const log = { renomeados: [], removidos: [], movidos: [] };

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
