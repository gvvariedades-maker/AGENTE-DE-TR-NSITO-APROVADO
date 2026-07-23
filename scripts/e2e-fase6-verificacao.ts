/**
 * E2E Fase 6 — verificação com DB real (local/Supabase).
 */
import { config } from "dotenv";
import { existsSync } from "node:fs";

if (existsSync(".env.local")) {
  config({ path: ".env.local" });
} else {
  config();
}

async function main() {
  const { sql, eq } = await import("drizzle-orm");
  const { db } = await import("../src/lib/db");
  const { attempts, studySessions } = await import("../src/lib/db/schema");
  const { buscarIdsPraticaPontuados } = await import("../src/lib/motor-ata");
  const { getPainelDominioEvidencias } = await import(
    "../src/lib/mastery/painel-dominio-evidencias"
  );
  const { gerarMissaoPosSimulado, MODO_MISSAO_CORRETIVA } = await import(
    "../src/lib/missao/missao-pos-simulado"
  );
  type Disciplina = import("../src/types").Disciplina;
  type RespostaSimuladoItem = import("../src/lib/simulado-nota").RespostaSimuladoItem;

  console.log("e2e:fase6 — início\n");

  const [userRow] = await db
    .select({ userId: attempts.userId })
    .from(attempts)
    .limit(1);
  const userId = userRow?.userId;
  if (!userId) {
    console.warn("⚠ Sem usuário com attempts — só smoke puro possível.");
    return;
  }
  console.log(`✓ Usuário de teste: ${userId.slice(0, 8)}…`);

  const painel = await getPainelDominioEvidencias(userId);
  console.log(
    `✓ Painel domínio: hasData=${painel.hasData} skills=${painel.totalSkills} mastered=${painel.masteredCount} at_risk=${painel.atRiskCount}`,
  );

  const idsMotor = await buscarIdsPraticaPontuados(userId, 5, {
    fase: "consolidacao",
  });
  console.log(
    `✓ Motor ATA (5 ids): ${idsMotor.length} questão(ões)${idsMotor.length > 0 ? ` — ex: ${idsMotor[0].slice(0, 8)}…` : ""}`,
  );

  const respostaRows = await db.execute<{
    question_id: string;
    disciplina: Disciplina;
    acertou: boolean;
    resposta: string;
  }>(sql`
    SELECT DISTINCT ON (a.question_id)
      a.question_id,
      t.disciplina,
      a.acertou,
      a.resposta
    FROM attempts a
    INNER JOIN questions q ON q.id = a.question_id
    INNER JOIN topics t ON t.id = q.topic_id
    WHERE a.user_id = ${userId}::uuid
    ORDER BY a.question_id, a.created_at DESC
    LIMIT 60
  `);

  const respostas: RespostaSimuladoItem[] = respostaRows.map((r) => ({
    questionId: r.question_id,
    disciplina: r.disciplina,
    acertou: r.acertou,
    resposta: r.resposta,
  }));

  if (respostas.length === 0) {
    console.warn("⚠ Sem respostas amostra — missão corretiva não testada.");
    return;
  }

  const missao = await gerarMissaoPosSimulado(userId, respostas);
  console.log(
    `✓ Missão corretiva: ${missao.questionIds.length}/${missao.meta} ids session=${missao.sessionId?.slice(0, 8) ?? "—"}…`,
  );
  console.log(`  href: ${missao.href}`);

  if (missao.sessionId) {
    const [sess] = await db
      .select({ modo: studySessions.modo })
      .from(studySessions)
      .where(eq(studySessions.id, missao.sessionId))
      .limit(1);
    if (sess?.modo !== MODO_MISSAO_CORRETIVA) {
      throw new Error(
        `modo sessão esperado ${MODO_MISSAO_CORRETIVA}, got ${sess?.modo}`,
      );
    }
    await db.delete(studySessions).where(eq(studySessions.id, missao.sessionId));
    console.log("✓ Sessão corretiva de teste removida (cleanup)");
  }

  const masteryTable = await db.execute<{ n: number }>(sql`
    SELECT count(*)::int AS n FROM user_skill_mastery WHERE user_id = ${userId}::uuid
  `);
  console.log(`✓ user_skill_mastery rows: ${masteryTable[0]?.n ?? 0}`);

  console.log("\ne2e:fase6 — OK");
}

main().catch((err) => {
  console.error("e2e:fase6 — FALHOU");
  console.error(err);
  process.exit(1);
});
