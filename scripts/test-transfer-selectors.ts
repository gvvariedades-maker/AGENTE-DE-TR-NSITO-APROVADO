import assert from "node:assert/strict";
import {
  isAssessmentPool,
  isHoldoutPool,
  isStudyEligiblePool,
  isSimuladoEligiblePool,
} from "../src/lib/transfer/assessment-pool";
import {
  canReleaseHoldout,
  evaluateHoldoutGate,
  HOLDOUT_RELEASE_MASTERY_PROBABILITY,
} from "../src/lib/transfer/holdout-gate";
import {
  rankTransferFallback,
  relationMatchesKind,
  transferLevelRank,
} from "../src/lib/transfer/rank-fallback";

function testPoolHelpers() {
  assert.equal(isAssessmentPool("learning"), true);
  assert.equal(isAssessmentPool("holdout"), true);
  assert.equal(isAssessmentPool("foo"), false);
  assert.equal(isHoldoutPool("holdout"), true);
  assert.equal(isStudyEligiblePool("learning"), true);
  assert.equal(isStudyEligiblePool("transfer"), true);
  assert.equal(isStudyEligiblePool("holdout"), false);
  assert.equal(isStudyEligiblePool("simulation"), false);
  assert.equal(isSimuladoEligiblePool("simulation"), true);
  assert.equal(isSimuladoEligiblePool("holdout"), false);
}

function testHoldoutGate() {
  assert.equal(
    canReleaseHoldout({
      assessmentPool: "learning",
      primaryMasteryProbability: 0,
    }),
    true,
  );

  const blocked = evaluateHoldoutGate({
    assessmentPool: "holdout",
    primaryMasteryProbability: 0.4,
  });
  assert.equal(blocked.eligible, false);
  assert.equal(blocked.reason, "below_threshold");

  const noSkill = evaluateHoldoutGate({
    assessmentPool: "holdout",
    primaryMasteryProbability: null,
  });
  assert.equal(noSkill.eligible, false);
  assert.equal(noSkill.reason, "no_primary_mastery");

  const released = evaluateHoldoutGate({
    assessmentPool: "holdout",
    primaryMasteryProbability: HOLDOUT_RELEASE_MASTERY_PROBABILITY,
  });
  assert.equal(released.eligible, true);
  assert.equal(released.reason, "released");
}

function testRelationKind() {
  assert.equal(relationMatchesKind("near", 1, "near"), true);
  assert.equal(relationMatchesKind("variant", 1, "near"), true);
  assert.equal(relationMatchesKind("far", 2, "near"), false);
  assert.equal(relationMatchesKind("far", 2, "far"), true);
  assert.equal(relationMatchesKind("near", 3, "far"), true);
  assert.equal(relationMatchesKind("variant", 1, "far"), false);
}

function testRankFallback() {
  assert.equal(transferLevelRank("T3"), 3);
  assert.equal(transferLevelRank("T0"), 0);

  const ranked = rankTransferFallback(
    [
      {
        questionId: "a",
        transferLevel: "T1",
        seen: false,
        samePrimarySkill: true,
      },
      {
        questionId: "b",
        transferLevel: "T3",
        seen: true,
        samePrimarySkill: true,
      },
      {
        questionId: "c",
        transferLevel: "T2",
        seen: false,
        samePrimarySkill: false,
      },
    ],
    "T1",
  );

  // Prefer higher than source + unseen: c (T2 unseen) then b (T3 seen) then a
  assert.equal(ranked[0].questionId, "c");
  assert.equal(ranked[1].questionId, "b");
  assert.equal(ranked[2].questionId, "a");
}

testPoolHelpers();
testHoldoutGate();
testRelationKind();
testRankFallback();

console.log("ok: test-transfer-selectors");
