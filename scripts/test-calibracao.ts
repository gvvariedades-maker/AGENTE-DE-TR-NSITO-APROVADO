import assert from "node:assert/strict";
import {
  CALIBRACAO_PADRAO,
  recalcularCalibracao,
} from "../src/lib/tutor/calibracao";

function testCapacidadeSobeAposMetasCumpridas() {
  const historico = [
    { data: "2026-07-10", metaQuestoes: 20, questoesFeitas: 22 },
    { data: "2026-07-11", metaQuestoes: 20, questoesFeitas: 25 },
    { data: "2026-07-12", metaQuestoes: 20, questoesFeitas: 21 },
    { data: "2026-07-13", metaQuestoes: 20, questoesFeitas: 24 },
  ];
  const nova = recalcularCalibracao({
    atual: CALIBRACAO_PADRAO,
    historico,
    fase: "consolidacao",
    espelhoMedia: 65,
    disciplinasEmRisco: [],
  });
  assert.ok(nova.capacidadeQuestoes > CALIBRACAO_PADRAO.capacidadeQuestoes);
}

function testCapacidadeDesceMetaCronicaFalha() {
  const historico = [
    { data: "2026-07-10", metaQuestoes: 20, questoesFeitas: 5 },
    { data: "2026-07-11", metaQuestoes: 20, questoesFeitas: 3 },
    { data: "2026-07-12", metaQuestoes: 20, questoesFeitas: 8 },
    { data: "2026-07-13", metaQuestoes: 20, questoesFeitas: 4 },
  ];
  const nova = recalcularCalibracao({
    atual: { ...CALIBRACAO_PADRAO, capacidadeQuestoes: 22 },
    historico,
    fase: "consolidacao",
    espelhoMedia: 55,
    disciplinasEmRisco: [],
  });
  assert.ok(nova.capacidadeQuestoes < 22);
  assert.ok(nova.biasRevisao > 0);
}

function testBoostDisciplinaEmRisco() {
  const nova = recalcularCalibracao({
    atual: CALIBRACAO_PADRAO,
    historico: [],
    fase: "aperto",
    espelhoMedia: 60,
    disciplinasEmRisco: ["informatica"],
  });
  assert.ok((nova.boostDisciplinas.informatica ?? 1) > 1);
}

testCapacidadeSobeAposMetasCumpridas();
testCapacidadeDesceMetaCronicaFalha();
testBoostDisciplinaEmRisco();
console.log("test:calibracao — OK");
