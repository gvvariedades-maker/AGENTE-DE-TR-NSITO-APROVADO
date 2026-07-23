/**
 * Smoke Fase 6 — Motor ATA terms + ranking missão (puro).
 * Não exige DB.
 */
import assert from "node:assert/strict";
import {
  PESOS_EVIDENCIA_FASE,
  MISSAO_POS_SIMULADO_META,
  scoreMasteryGap,
  scoreHighConfidenceErrorRisk,
  scoreTransferPending,
  scoreForgettingRisk,
} from "../src/lib/motor-ata-terms";
import { rankCandidatosMissaoCorretiva } from "../src/lib/missao/rank-missao-corretiva";

function main() {
  assert.ok(PESOS_EVIDENCIA_FASE.semana_final.highConfidenceError > 400);
  assert.equal(MISSAO_POS_SIMULADO_META, 14);

  const gap = scoreMasteryGap({ masteryProbability: 0.25 }, 200);
  assert.equal(gap, 150);

  const hc = scoreHighConfidenceErrorRisk(
    { highConfidenceErrorCount: 0, recentHighConfErrorOnQuestion: true },
    400,
  );
  assert.equal(hc, 400);

  const tp = scoreTransferPending(
    { recallScore: 0.9, transferScore: 0.4 },
    100,
  );
  assert.equal(tp, 50);

  const fr = scoreForgettingRisk(
    { elapsedDays: 0, stability: 10 },
    100,
  );
  assert.equal(fr, 0);

  const ranked = rankCandidatosMissaoCorretiva(
    [
      {
        questionId: "1",
        disciplina: "legislacao_transito",
        errouNoSimulado: true,
        masteryProbability: 0.1,
        highConfError: true,
        transferPending: true,
        forgettingRisk01: 0.8,
      },
    ],
    14,
  );
  assert.equal(ranked.length, 1);
  assert.ok(ranked[0].valor > 0);

  console.log("smoke:fase6 — ok");
}

main();
