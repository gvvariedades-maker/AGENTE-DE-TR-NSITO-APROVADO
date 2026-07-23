import assert from "node:assert/strict";
import { diagnoseFromPassoAPassoPure } from "../src/lib/diagnostics/diagnose-from-passo";

const PASSO = [
  "1. Leia o comando.",
  "2. A erra por numero_vizinho (20 em vez de 30); C erra por gravidade; D erra por regra_excecao.",
  "3. B está correta.",
];

function testAcertoSemDiagnostico() {
  const d = diagnoseFromPassoAPassoPure("B", PASSO, true);
  assert.equal(d.source, "none");
  assert.equal(d.mechanismSlug, null);
  assert.equal(d.feedbackSummary, null);
}

function testFallbackNumeroVizinho() {
  const d = diagnoseFromPassoAPassoPure("A", PASSO, false);
  assert.equal(d.source, "fallback");
  assert.equal(d.mechanismSlug, "numero_vizinho");
  assert.equal(d.misconceptionCode, "mech_numero_vizinho");
  assert.equal(d.errorType, "pegadinha_idecan");
  assert.match(d.feedbackSummary ?? "", /número vizinho/i);
}

function testFallbackGravidade() {
  const d = diagnoseFromPassoAPassoPure("C", PASSO, false);
  assert.equal(d.mechanismSlug, "gravidade");
  assert.match(d.feedbackSummary ?? "", /Gravidade/i);
}

function testSemPasso2() {
  const d = diagnoseFromPassoAPassoPure("A", ["1. Só isso."], false);
  assert.equal(d.source, "none");
  assert.equal(d.mechanismSlug, null);
}

function main() {
  testAcertoSemDiagnostico();
  testFallbackNumeroVizinho();
  testFallbackGravidade();
  testSemPasso2();
  console.log("ok: diagnose-attempt");
}

main();
