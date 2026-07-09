import { existsSync } from "node:fs";
import { config } from "dotenv";
import { eq, sql } from "drizzle-orm";
import { closeScriptDb, scriptDb } from "./script-db";
import { questions, topics } from "../src/lib/db/schema";
import { resolveDatabaseUrl } from "../src/lib/db/resolve-database-url";

if (existsSync(".env.local")) config({ path: ".env.local" });
process.env.DATABASE_PORT = process.env.DATABASE_PORT ?? "6543";

async function main() {
  const url = resolveDatabaseUrl();
  console.log("Porta resolvida:", new URL(url).port);

  const topicCount = await scriptDb
    .select({ n: sql<number>`count(*)::int` })
    .from(topics)
    .where(eq(topics.disciplina, "legislacao_transito"));

  const withQuestions = await scriptDb.execute<{
    slug: string;
    n: number;
  }>(sql`
    SELECT t.nome AS slug, count(q.id)::int AS n
    FROM topics t
    LEFT JOIN questions q ON q.topic_id = t.id
    WHERE t.disciplina = 'legislacao_transito'
    GROUP BY t.nome
    HAVING count(q.id) > 0
    ORDER BY count(q.id) DESC
  `);

  console.log("Tópicos legislacao_transito:", topicCount[0]?.n ?? 0);
  console.log("Microtópicos com questões:", withQuestions.length);
  console.table(withQuestions);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => closeScriptDb());
