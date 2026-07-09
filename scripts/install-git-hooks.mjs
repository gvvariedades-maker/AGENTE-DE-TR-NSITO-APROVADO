#!/usr/bin/env node
/**
 * Instala pre-commit que roda validate:lote em JSON staged de content/questoes/.
 * Uso: npm run setup:git-hooks
 */
import { chmodSync, copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const hooksDir = join(root, ".git", "hooks");
const source = join(root, "scripts", "git-hooks", "pre-commit");
const target = join(hooksDir, "pre-commit");

if (!existsSync(join(root, ".git"))) {
  console.error("❌ Repositório git não encontrado — rode na raiz do projeto.");
  process.exit(1);
}

if (!existsSync(source)) {
  console.error(`❌ Hook fonte ausente: ${source}`);
  process.exit(1);
}

mkdirSync(hooksDir, { recursive: true });
copyFileSync(source, target);
chmodSync(target, 0o755);

console.log("✓ Git hook instalado: .git/hooks/pre-commit");
console.log("  Valida content/questoes/**/*.json staged com npm run validate:lote");
