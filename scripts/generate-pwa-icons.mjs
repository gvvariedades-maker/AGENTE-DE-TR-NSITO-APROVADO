#!/usr/bin/env node
/**
 * Gera ícones PNG para PWA (192, 512, apple-touch 180).
 * Uso: node scripts/generate-pwa-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "..", "public");

function iconSvg(size) {
  const r = Math.round(size * 0.1875);
  const cx = size / 2;
  const coneTop = size * 0.22;
  const coneBase = size * 0.62;
  const coneW = size * 0.28;
  const stripe = size * 0.045;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#F58220"/>
  <polygon points="${cx},${coneTop} ${cx + coneW},${coneBase} ${cx - coneW},${coneBase}" fill="#FFFFFF"/>
  <rect x="${cx - stripe}" y="${coneTop + size * 0.12}" width="${stripe * 2}" height="${size * 0.08}" fill="#F58220" transform="rotate(0 ${cx} ${coneTop + size * 0.16})"/>
  <rect x="${cx - stripe}" y="${coneTop + size * 0.24}" width="${stripe * 2}" height="${size * 0.08}" fill="#F58220"/>
  <rect x="${cx - size * 0.09}" y="${coneBase}" width="${size * 0.18}" height="${size * 0.1}" rx="${size * 0.02}" fill="#FFFFFF"/>
</svg>`;
}

async function writePng(name, size) {
  const out = path.join(publicDir, name);
  await sharp(Buffer.from(iconSvg(size))).resize(size, size).png().toFile(out);
  console.log(`OK ${name} (${size}x${size})`);
}

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

await writePng("icon-192.png", 192);
await writePng("icon-512.png", 512);
await writePng("apple-touch-icon.png", 180);
await writePng("favicon-32.png", 32);
