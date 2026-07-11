/**
 * Calcula offsets de grifo por indexOf.
 *
 * Uso:
 *   npm run grifo:offsets -- "um ano" "A validade da Permissão..."
 *   npm run grifo:offsets -- --json "um ano" "texto completo"
 *   npm run grifo:offsets -- --occurrence 1 "ano" "texto com ano repetido"
 */
import { buildGrifoFromSubstring } from "../src/lib/grifo-offsets";

function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const occIdx = args.indexOf("--occurrence");
  const occurrence =
    occIdx >= 0 ? Number.parseInt(args[occIdx + 1] ?? "", 10) : undefined;
  const filtered = args.filter(
    (a, i) =>
      a !== "--json" &&
      a !== "--occurrence" &&
      (occIdx < 0 || i !== occIdx + 1),
  );

  if (filtered.length < 2) {
    console.error(
      'Uso: npm run grifo:offsets -- [--json] [--occurrence N] "<substring>" "<texto>"',
    );
    process.exit(1);
  }

  const substring = filtered[0]!;
  const texto = filtered.slice(1).join(" ");

  try {
    const grifo = buildGrifoFromSubstring(texto, substring, "motivo", occurrence);
    if (json) {
      console.log(JSON.stringify(grifo, null, 2));
    } else {
      console.log(`substring: "${substring}"`);
      console.log(`inicio: ${grifo.inicio}`);
      console.log(`fim: ${grifo.fim}`);
      console.log(`texto_grifado: "${grifo.texto_grifado}"`);
      console.log(`slice check: "${texto.slice(grifo.inicio, grifo.fim)}"`);
    }
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
