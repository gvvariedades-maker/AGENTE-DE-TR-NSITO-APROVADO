/**
 * Gate único de lote — encadeia validadores de questão ouro.
 * Em path content/questoes-reais/, inclui validate:aula-real (paridade aula).
 */
import { spawnSync } from "node:child_process";
import { relative, resolve } from "node:path";

const VALIDADORES_BASE = [
  "validate:questoes",
  "validate:cobertura",
  "validate:indistinguibilidade",
  "validate:estudo-reverso-visual",
  "preview:grifos",
] as const;

function main() {
  const args = process.argv.slice(2);
  const skipCitacoes = args.includes("--skip-citacoes");
  const legacyGrifos = args.includes("--legacy-grifos");
  const legacyTransferencia = args.includes("--legacy-transferencia");
  const legacyAulaReal = args.includes("--legacy-aula-real");
  const filePath = args.find((a) => !a.startsWith("--"));

  if (!filePath) {
    console.error(
      "Uso: npm run validate:lote -- <arquivo.json> [--skip-citacoes] [--legacy-grifos] [--legacy-transferencia] [--legacy-aula-real]",
    );
    process.exit(1);
  }

  if (legacyGrifos) {
    process.env.GRIFO_LEGACY = "1";
  }
  if (legacyTransferencia) {
    process.env.TRANSFERENCIA_LEGACY = "1";
  }
  if (legacyAulaReal) {
    process.env.AULA_REAL_LEGACY = "1";
  }

  const absolute = resolve(process.cwd(), filePath);
  const relativePath = relative(process.cwd(), absolute);
  const isReais = /questoes-reais[/\\]/.test(relativePath.replace(/\\/g, "/"));

  const validadores: string[] = [...VALIDADORES_BASE];
  if (isReais) {
    validadores.push("validate:aula-real");
  }

  let falhas = 0;
  console.log(`\n🔒 validate:lote — ${filePath}\n`);

  for (const script of validadores) {
    console.log(`── ${script} ──`);
    const npmArgs = ["run", script, "--", relativePath];
    if (skipCitacoes) npmArgs.push("--skip-citacoes");
    if (legacyGrifos) npmArgs.push("--legacy-grifos");
    if (legacyTransferencia) npmArgs.push("--legacy-transferencia");
    if (legacyAulaReal) npmArgs.push("--legacy-aula-real");

    const result = spawnSync("npm", npmArgs, {
      cwd: process.cwd(),
      stdio: "inherit",
      env: process.env,
      shell: process.platform === "win32",
    });

    if (result.status !== 0) {
      falhas++;
      console.error(`\n❌ ${script} falhou para ${filePath}\n`);
    } else {
      console.log(`\n✓ ${script} OK\n`);
    }
  }

  if (falhas > 0) {
    console.error(`validate:lote: ${falhas}/${validadores.length} validador(es) falharam`);
    process.exit(1);
  }

  console.log(`✅ validate:lote — ${filePath} passou nos ${validadores.length} gates\n`);
}

main();
