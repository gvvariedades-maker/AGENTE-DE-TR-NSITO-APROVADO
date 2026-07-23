import assert from "node:assert/strict";
import {
  calibrationDelta,
  computeEvidenceWeight,
  DELAYED_EVIDENCE_MS,
} from "../src/lib/mastery/evidence-weight";
import {
  computeMasteryProbability,
  resolveMasteryState,
  MASTERED_MIN_SCORE,
} from "../src/lib/mastery/mastery-state";
import { decidirDominioTopico } from "../src/lib/mastery/topic-dominio-policy";

function testEvidenceNovelDelayedStrong() {
  const w = computeEvidenceWeight({
    acertou: true,
    exposureCount: 0,
    msSinceLastEvidence: null,
    transferLevel: "T2",
    mode: "simulado",
    confidence: 3,
  });
  assert.equal(w.isNovel, true);
  assert.equal(w.isDelayed, true);
  assert.equal(w.sign, 1);
  assert.ok(w.weight >= 0.7);
}

function testEvidenceAssistedWeak() {
  const w = computeEvidenceWeight({
    acertou: true,
    exposureCount: 3,
    msSinceLastEvidence: 5 * 60 * 1000,
    transferLevel: "T0",
    hintUsed: true,
    mode: "estudo",
    confidence: 1,
  });
  assert.equal(w.isNovel, false);
  assert.equal(w.isDelayed, false);
  assert.ok(w.weight < 0.3);
}

function testEvidenceErrorNegative() {
  const w = computeEvidenceWeight({
    acertou: false,
    exposureCount: 0,
    msSinceLastEvidence: DELAYED_EVIDENCE_MS,
    transferLevel: "T1",
    mode: "estudo",
    confidence: 3,
  });
  assert.equal(w.sign, -1);
  assert.ok(w.signedWeight < 0);
}

function testCalibrationHighConfError() {
  const d = calibrationDelta(false, 3, 1);
  assert.ok(d < -0.2);
}

function testCalibrationHighConfCorrect() {
  const d = calibrationDelta(true, 3, 1);
  assert.ok(d > 0);
}

function testMasteryProbability() {
  assert.equal(
    computeMasteryProbability({
      recallScore: 0.8,
      transferScore: 0.9,
      calibrationScore: 1,
    }),
    0.8,
  );
  assert.ok(
    computeMasteryProbability({
      recallScore: 0.8,
      transferScore: 0.9,
      calibrationScore: 0.5,
    }) < MASTERED_MIN_SCORE,
  );
}

function testStateUnseen() {
  assert.equal(
    resolveMasteryState({
      recallScore: 0,
      transferScore: 0,
      calibrationScore: 0.5,
      novelCorrectCount: 0,
      delayedCorrectCount: 0,
      highConfidenceErrorCount: 0,
      hasEvidence: false,
      hasRecentHighConfError: false,
    }),
    "unseen",
  );
}

function testStateMastered() {
  assert.equal(
    resolveMasteryState({
      recallScore: 0.8,
      transferScore: 0.8,
      calibrationScore: 0.9,
      novelCorrectCount: 2,
      delayedCorrectCount: 1,
      highConfidenceErrorCount: 0,
      hasEvidence: true,
      hasRecentHighConfError: false,
    }),
    "mastered",
  );
}

function testStateAtRisk() {
  assert.equal(
    resolveMasteryState({
      recallScore: 0.8,
      transferScore: 0.8,
      calibrationScore: 0.4,
      novelCorrectCount: 2,
      delayedCorrectCount: 1,
      highConfidenceErrorCount: 1,
      hasEvidence: true,
      hasRecentHighConfError: true,
      previousState: "mastered",
    }),
    "at_risk",
  );
}

function testStateLearningWithoutNovel() {
  assert.equal(
    resolveMasteryState({
      recallScore: 0.8,
      transferScore: 0.8,
      calibrationScore: 0.9,
      novelCorrectCount: 1,
      delayedCorrectCount: 1,
      highConfidenceErrorCount: 0,
      hasEvidence: true,
      hasRecentHighConfError: false,
    }),
    "consolidating",
  );
}

function testDominioFallbackLegado() {
  assert.equal(
    decidirDominioTopico({
      coverageMeetsThreshold: false,
      aggregate: null,
      legadoDominado: true,
    }),
    true,
  );
  assert.equal(
    decidirDominioTopico({
      coverageMeetsThreshold: false,
      aggregate: null,
      legadoDominado: false,
    }),
    false,
  );
}

function testDominioMasteryAggregate() {
  assert.equal(
    decidirDominioTopico({
      coverageMeetsThreshold: true,
      aggregate: {
        skillCount: 2,
        masteredCount: 1,
        minProbability: 0.4,
        majorityMastered: true,
        minAboveThreshold: false,
        states: ["mastered", "learning"],
      },
      legadoDominado: true,
    }),
    true,
  );
  assert.equal(
    decidirDominioTopico({
      coverageMeetsThreshold: true,
      aggregate: {
        skillCount: 1,
        masteredCount: 0,
        minProbability: 0.2,
        majorityMastered: false,
        minAboveThreshold: false,
        states: ["learning"],
      },
      legadoDominado: true,
    }),
    false,
    "com cobertura skill, legado não salva domínio",
  );
}

function main() {
  testEvidenceNovelDelayedStrong();
  testEvidenceAssistedWeak();
  testEvidenceErrorNegative();
  testCalibrationHighConfError();
  testCalibrationHighConfCorrect();
  testMasteryProbability();
  testStateUnseen();
  testStateMastered();
  testStateAtRisk();
  testStateLearningWithoutNovel();
  testDominioFallbackLegado();
  testDominioMasteryAggregate();
  console.log("ok: mastery-engine");
}

main();
