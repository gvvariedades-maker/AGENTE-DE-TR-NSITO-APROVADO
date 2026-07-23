/**
 * Batch validate legislacao_transito lotes — one-off audit script.
 */
import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const dir = "content/questoes/legislacao_transito";
const files = readdirSync(dir)
  .filter((f) => /^lote-\d+\.json$/.test(f))
  .sort((a, b) => parseInt(a.match(/\d+/)![0]) - parseInt(b.match(/\d+/)![0]));

const pass: string[] = [];
const fail: Array<{ f: string; gates: string[]; hint: string }> = [];

for (const f of files) {
  const fp = join(dir, f);
  process.stderr.write(`Checking ${f}...\n`);
  try {
    execSync(`npx tsx scripts/validate-lote.ts "${fp}"`, {
      stdio: "pipe",
      timeout: 120_000,
    });
    pass.push(f);
  } catch (e: unknown) {
    const err = e as { stdout?: Buffer; stderr?: Buffer };
    const out = (err.stdout?.toString() ?? "") + (err.stderr?.toString() ?? "");
    const gates: string[] = [];
    const gateNames = [
      "validate:questoes",
      "validate:cobertura",
      "validate:indistinguibilidade",
      "validate:estudo-reverso-visual",
      "preview:grifos",
    ];
    for (const g of gateNames) {
      const idx = out.indexOf(g);
      if (idx >= 0) {
        const slice = out.slice(idx, idx + 500);
        if (slice.includes("FALHOU") || slice.includes("❌")) gates.push(g.replace("validate:", ""));
      }
    }
    const errLines = out
      .split("\n")
      .filter(
        (l) =>
          l.includes("❌") ||
          l.includes("ERRO") ||
          l.includes("error") ||
          l.includes("FALHOU") ||
          l.includes("falhou")
      )
      .slice(-3)
      .join(" | ");
    fail.push({
      f,
      gates: gates.length ? gates : ["unknown"],
      hint: errLines.slice(0, 300),
    });
  }
}

console.log("\n=== RESUMO ===");
console.log("TOTAL:", files.length);
console.log("PASS:", pass.length);
console.log("FAIL:", fail.length);
console.log("\n=== FALHAS ===");
for (const x of fail) {
  console.log(`${x.f} [${x.gates.join(",")}] ${x.hint}`);
}

// JSON para pós-processamento
import { writeFileSync } from "node:fs";
writeFileSync(
  ".tmp-lt-validate-full.json",
  JSON.stringify({ total: files.length, pass: pass.length, fail: fail.length, passList: pass, failList: fail }, null, 2),
);
