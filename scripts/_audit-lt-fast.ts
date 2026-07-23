/**
 * Fast audit: schema + ouro gate for all legislacao_transito lotes.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { questoesImportFileSchema } from "../src/lib/validations/questao";
import { isNivelLote007Ouro } from "../src/lib/validations/estudo-reverso-visual";

const dir = "content/questoes/legislacao_transito";
const files = readdirSync(dir)
  .filter((f) => /^lote-\d+\.json$/.test(f))
  .sort((a, b) => parseInt(a.match(/\d+/)![0]) - parseInt(b.match(/\d+/)![0]));

const pass: string[] = [];
const fail: Array<{ f: string; reason: string; detail: string }> = [];

for (const f of files) {
  const raw = JSON.parse(readFileSync(join(dir, f), "utf8")) as unknown;
  const arr = Array.isArray(raw) ? raw : [raw];
  const parsed = questoesImportFileSchema.safeParse(arr);
  if (!parsed.success) {
    const detail =
      parsed.error.issues[0]?.message ??
      parsed.error.flatten().fieldErrors["0"]?.[0] ??
      "schema";
    fail.push({ f, reason: "schema", detail });
    continue;
  }
  let ouroFail = false;
  for (const q of parsed.data) {
    if (!isNivelLote007Ouro(q)) {
      ouroFail = true;
      break;
    }
  }
  if (ouroFail) {
    fail.push({ f, reason: "ouro", detail: "fora gate lote-007 ouro" });
  } else {
    pass.push(f);
  }
}

console.log(JSON.stringify({ total: files.length, pass: pass.length, fail: fail.length, passList: pass, failList: fail }, null, 2));
