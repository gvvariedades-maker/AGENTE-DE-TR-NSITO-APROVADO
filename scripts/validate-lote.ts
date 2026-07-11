/**
 * Gate único de lote — encadeia os 3 validadores de questão ouro.
 */
import { spawnSync } from "node:child_process";
import { relative, resolve } from "node:path";

const VALIDADORES = [
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
  const filePath = args.find((a) => !a.startsWith("--"));

  if (!filePath) {
    console.error(
      "Uso: npm run validate:lote -- <arquivo.json> [--skip-citacoes]",
    );
    process.exit(1);
  }

  const relativePath = relative(process.cwd(), resolve(process.cwd(), filePath));

  let falhas = 0;
  console.log(`\n🔒 validate:lote — ${filePath}\n`);

  for (const script of VALIDADORES) {
    console.log(`── ${script} ──`);
    const npmArgs = ["run", script, "--", relativePath];
    if (skipCitacoes) npmArgs.push("--skip-citacoes");
    if (legacyGrifos) npmArgs.push("--legacy-grifos");

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
    console.error(`validate:lote: ${falhas}/${VALIDADORES.length} validador(es) falharam`);
    process.exit(1);
  }

  console.log(`✅ validate:lote — ${filePath} passou nos ${VALIDADORES.length} gates\n`);
}

main();
