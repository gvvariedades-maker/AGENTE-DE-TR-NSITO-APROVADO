import assert from "node:assert/strict";
import {
  isHighConfidenceError,
  isLowConfidenceCorrect,
  resolveFsrsRating,
  resolveRatingPolicy,
} from "../src/lib/srs/rating-policy";

function testErroSempreAgain() {
  assert.equal(resolveFsrsRating({ acertou: false, confidence: 1 }), 1);
  assert.equal(resolveFsrsRating({ acertou: false, confidence: 3 }), 1);
  assert.equal(
    resolveRatingPolicy({ acertou: false, confidence: 3 }).fsrsRating,
    1,
  );
}

function testAcertoDuvidaHard() {
  const r = resolveRatingPolicy({ acertou: true, confidence: 1 });
  assert.equal(r.confidence, 1);
  assert.equal(r.fsrsRating, 2);
}

function testAcertoCertezaEasy() {
  const r = resolveRatingPolicy({ acertou: true, confidence: 3 });
  assert.equal(r.confidence, 3);
  assert.equal(r.fsrsRating, 4);
}

function testFlagsCalibracao() {
  assert.equal(isHighConfidenceError(false, 3), true);
  assert.equal(isHighConfidenceError(false, 1), false);
  assert.equal(isHighConfidenceError(true, 3), false);
  assert.equal(isLowConfidenceCorrect(true, 1), true);
  assert.equal(isLowConfidenceCorrect(true, 3), false);
  assert.equal(isLowConfidenceCorrect(false, 1), false);
}

function main() {
  testErroSempreAgain();
  testAcertoDuvidaHard();
  testAcertoCertezaEasy();
  testFlagsCalibracao();
  console.log("ok: rating-policy");
}

main();
