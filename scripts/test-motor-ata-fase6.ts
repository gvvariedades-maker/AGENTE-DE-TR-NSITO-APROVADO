import assert from "node:assert/strict";
import {
  scoreMasteryGap,
  scoreHighConfidenceErrorRisk,
  scoreTransferPending,
  scoreForgettingRisk,
  valorAtividadeCorretiva,
  PESOS_EVIDENCIA_FASE,
  MISSAO_POS_SIMULADO_META,
} from "../src/lib/motor-ata-terms";
import { rankCandidatosMissaoCorretiva } from "../src/lib/missao/rank-missao-corretiva";
import { retrievability } from "../src/lib/srs";

function testMasteryGap() {
  const peso = PESOS_EVIDENCIA_FASE.consolidacao.masteryGap;
  assert.equal(scoreMasteryGap({ masteryProbability: null }, peso), 0);
  assert.equal(scoreMasteryGap({ masteryProbability: 1 }, peso), 0);
  assert.equal(
    scoreMasteryGap({ masteryProbability: 0 }, peso),
    peso,
  );
  assert.ok(
    scoreMasteryGap({ masteryProbability: 0.5 }, peso) === Math.round(0.5 * peso),
  );
}

function testHighConf() {
  const peso = PESOS_EVIDENCIA_FASE.consolidacao.highConfidenceError;
  assert.equal(
    scoreHighConfidenceErrorRisk(
      { highConfidenceErrorCount: 0 },
      peso,
    ),
    0,
  );
  assert.equal(
    scoreHighConfidenceErrorRisk(
      { highConfidenceErrorCount: 0, recentHighConfErrorOnQuestion: true },
      peso,
    ),
    peso,
  );
  assert.equal(
    scoreHighConfidenceErrorRisk(
      { highConfidenceErrorCount: 0, state: "at_risk" },
      peso,
    ),
    Math.round(peso * 0.9),
  );
}

function testTransferPending() {
  const peso = PESOS_EVIDENCIA_FASE.consolidacao.transferPending;
  assert.equal(
    scoreTransferPending(
      { recallScore: null, transferScore: null },
      peso,
    ),
    0,
  );
  assert.equal(
    scoreTransferPending(
      { recallScore: 0.8, transferScore: 0.3 },
      peso,
    ),
    Math.round(0.5 * peso),
  );
  assert.equal(
    scoreTransferPending(
      { recallScore: 0.5, transferScore: 0.5, isTransferPool: true },
      peso,
    ),
    peso,
  );
}

function testForgettingRisk() {
  const peso = PESOS_EVIDENCIA_FASE.consolidacao.forgettingRisk;
  assert.equal(
    scoreForgettingRisk({ elapsedDays: null, stability: 10 }, peso),
    0,
  );
  const r = retrievability(10, 10);
  const expected = Math.round((1 - r) * peso);
  assert.equal(
    scoreForgettingRisk({ elapsedDays: 10, stability: 10 }, peso),
    expected,
  );
}

function testValorCorretivaLtErroAntesPortugues() {
  const lt = valorAtividadeCorretiva({
    pesoEditalFrac: 30 / 60,
    pontosPorAcerto: 2,
    errouNoSimulado: true,
    masteryProbability: 0.2,
    highConfError: true,
    transferPending: false,
    forgettingRisk01: 0.3,
  });
  const port = valorAtividadeCorretiva({
    pesoEditalFrac: 8 / 60,
    pontosPorAcerto: 1,
    errouNoSimulado: false,
    masteryProbability: 0.8,
    highConfError: false,
    transferPending: false,
    forgettingRisk01: 0,
  });
  assert.ok(lt > port, `LT erro (${lt}) deve superar português ok (${port})`);
}

function testRankMissaoMeta14() {
  const candidatos = Array.from({ length: 20 }, (_, i) => ({
    questionId: `q-${String(i).padStart(2, "0")}`,
    disciplina:
      i < 10
        ? ("legislacao_transito" as const)
        : ("portugues" as const),
    errouNoSimulado: i < 5,
    masteryProbability: i * 0.05,
    highConfError: i === 0,
    transferPending: false,
    forgettingRisk01: 0.1,
  }));
  const ranked = rankCandidatosMissaoCorretiva(
    candidatos,
    MISSAO_POS_SIMULADO_META,
  );
  assert.equal(ranked.length, MISSAO_POS_SIMULADO_META);
  assert.ok(ranked[0].valor >= ranked[ranked.length - 1].valor);
  assert.equal(ranked[0].questionId, "q-00");
}

function testRankDedup() {
  const ranked = rankCandidatosMissaoCorretiva(
    [
      {
        questionId: "a",
        disciplina: "legislacao_transito",
        errouNoSimulado: true,
        masteryProbability: 0,
        highConfError: true,
        transferPending: false,
        forgettingRisk01: 1,
      },
      {
        questionId: "a",
        disciplina: "legislacao_transito",
        errouNoSimulado: true,
        masteryProbability: 0,
        highConfError: true,
        transferPending: false,
        forgettingRisk01: 1,
      },
    ],
    5,
  );
  assert.equal(ranked.length, 1);
}

function main() {
  testMasteryGap();
  testHighConf();
  testTransferPending();
  testForgettingRisk();
  testValorCorretivaLtErroAntesPortugues();
  testRankMissaoMeta14();
  testRankDedup();
  console.log("ok — motor-ata fase 6 / missão corretiva");
}

main();
