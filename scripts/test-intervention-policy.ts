import assert from "node:assert/strict";
import { selectIntervention } from "../src/lib/tutor/intervention-policy";

function testNoviceSemprePrerequisite() {
  const r = selectIntervention({
    acertou: true,
    confidence: 3,
    hasMisconception: false,
    isNovice: true,
    primaryMasteryState: "mastered",
    primaryMasteryProbability: 0.9,
  });
  assert.equal(r.path, "prerequisite_repair");
}

function testErroComMisconception() {
  const r = selectIntervention({
    acertou: false,
    confidence: 3,
    hasMisconception: true,
    isNovice: false,
  });
  assert.equal(r.path, "misconception_repair");
}

function testErroSemMisconception() {
  const r = selectIntervention({
    acertou: false,
    confidence: 1,
    hasMisconception: false,
    isNovice: false,
  });
  assert.equal(r.path, "guided_learning");
}

function testAcertoDuvida() {
  const r = selectIntervention({
    acertou: true,
    confidence: 1,
    hasMisconception: false,
    isNovice: false,
    primaryMasteryState: "learning",
    primaryMasteryProbability: 0.3,
  });
  assert.equal(r.path, "uncertain_correct");
}

function testAcertoConfianteMasteryAlto() {
  const r = selectIntervention({
    acertou: true,
    confidence: 3,
    hasMisconception: false,
    isNovice: false,
    primaryMasteryState: "mastered",
    primaryMasteryProbability: 0.85,
  });
  assert.equal(r.path, "fast_confirmation");
}

function testAcertoConfianteConsolidando() {
  const r = selectIntervention({
    acertou: true,
    confidence: 3,
    hasMisconception: false,
    isNovice: false,
    primaryMasteryState: "consolidating",
    primaryMasteryProbability: 0.6,
  });
  assert.equal(r.path, "transfer_challenge");
}

function testAcertoInicialGuiado() {
  const r = selectIntervention({
    acertou: true,
    confidence: 3,
    hasMisconception: false,
    isNovice: false,
    primaryMasteryState: "learning",
    primaryMasteryProbability: 0.2,
  });
  assert.equal(r.path, "guided_learning");
}

function main() {
  testNoviceSemprePrerequisite();
  testErroComMisconception();
  testErroSemMisconception();
  testAcertoDuvida();
  testAcertoConfianteMasteryAlto();
  testAcertoConfianteConsolidando();
  testAcertoInicialGuiado();
  console.log("ok: intervention-policy");
}

main();
