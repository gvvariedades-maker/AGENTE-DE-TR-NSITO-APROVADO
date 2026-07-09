import { existsSync } from "node:fs";
import { config } from "dotenv";
import { eq, sql } from "drizzle-orm";
import { closeScriptDb, scriptDb } from "./script-db";
import { questions, topics } from "../src/lib/db/schema";
import { resolveEstudoReversoVisualCompleto } from "../src/lib/estudo-reverso-visual-fallback";

if (existsSync(".env.local")) config({ path: ".env.local" });
process.env.DATABASE_PORT = process.env.DATABASE_PORT ?? "6543";

async function main() {
  const rows = await scriptDb
    .select({
      id: questions.id,
      enunciado: questions.enunciado,
      v1: questions.estudoReversoVisualJson,
      v2: questions.estudoReversoVisualCompletoJson,
      topico: topics.nome,
    })
    .from(questions)
    .innerJoin(topics, eq(questions.topicId, topics.id));

  let comV2 = 0;
  for (const row of rows) {
    const resolved = resolveEstudoReversoVisualCompleto(row.v2);
    if (resolved) {
      comV2++;
      console.log("V2 OK:", row.topico, "| telas:", resolved.telas.length);
    }
    if (row.enunciado.includes("digitando")) {
      console.log("\n--- art 252 digitando ---");
      console.log("id:", row.id);
      console.log("v2 raw null?", row.v2 == null);
      console.log("v2 resolved:", resolved?.versao, resolved?.telas.length);
    }
  }
  console.log(`\nTotal questões: ${rows.length} | com v2 resolvido: ${comV2}`);
  await closeScriptDb();
}

main().catch(async (e) => {
  console.error(e);
  await closeScriptDb().catch(() => undefined);
  process.exit(1);
});
