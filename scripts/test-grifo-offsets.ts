/**
 * Smoke tests para src/lib/grifo-offsets.ts
 * Uso: npx tsx scripts/test-grifo-offsets.ts
 */
import {
  buildGrifoFromSubstring,
  validarGrifosTrechoLegal,
  validarLimitesPalavra,
} from "../src/lib/grifo-offsets";

let falhas = 0;

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    falhas++;
  } else {
    console.log(`OK: ${msg}`);
  }
}

const lei2 =
  "A validade da Permissão para Dirigir é de um ano, contado da data de sua expedição.";
const gUmAno = buildGrifoFromSubstring(lei2, "um ano", "mapa — um ano, não dois");
assert(gUmAno.inicio === 42, "lei2: um ano em 42");
assert(gUmAno.fim === 48, "lei2: fim 48");
assert(gUmAno.texto_grifado === "um ano", "lei2: texto_grifado");

const lei1 =
  "Além dos condutores com Autorização para Conduzir Ciclomotor, apenas os habilitados na categoria A estão aptos a conduzirem ciclomotores.";
const gAcc = buildGrifoFromSubstring(
  lei1,
  "Além dos condutores com Autorização para Conduzir Ciclomotor",
  "contraste",
);
const gCatA = buildGrifoFromSubstring(
  lei1,
  "apenas os habilitados na categoria A estão aptos",
  "distratores",
);
assert(
  validarLimitesPalavra(lei1, gAcc.inicio, gAcc.fim) === null,
  "lei1 grifo ACC sem corte",
);
assert(
  validarLimitesPalavra(lei1, gCatA.inicio, gCatA.fim) === null,
  "lei1 grifo cat A sem corte",
);

const errosOk = validarGrifosTrechoLegal(lei2, [gUmAno]);
assert(errosOk.length === 0, "G3 passa com texto_grifado correto");

const errosCorte = validarGrifosTrechoLegal(lei2, [
  { inicio: 27, fim: 35, motivo: "errado", texto_grifado: "a Dirigi" },
]);
assert(errosCorte.some((e) => e.codigo === "G2"), "G2 detecta corte em 27:35");

const errosG3 = validarGrifosTrechoLegal(lei2, [
  { inicio: 42, fim: 48, motivo: "errado", texto_grifado: "dois anos" },
]);
assert(errosG3.some((e) => e.codigo === "G3"), "G3 detecta slice divergente");

if (falhas > 0) {
  console.error(`\n${falhas} teste(s) falharam`);
  process.exit(1);
}
console.log("\nTodos os testes de grifo passaram.");
