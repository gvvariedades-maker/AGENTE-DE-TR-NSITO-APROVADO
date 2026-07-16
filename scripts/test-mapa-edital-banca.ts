import assert from "node:assert/strict";
import {
  MAPA_EDITAL_BANCA,
  MAPA_EDITAL_BANCA_POR_SLUG,
  calcularRoiBase,
  disciplinasPorRoi,
  getMapaTopicoBanca,
  prioridadeBancaDisciplina,
  prioridadeBancaTopico,
} from "../src/lib/tutor/mapa-edital-banca";
import { SIMULADO_ESPELHO_DISTRIBUICAO } from "../src/types";

function testMapaCompleto() {
  assert.ok(MAPA_EDITAL_BANCA.length > 100);
  assert.equal(MAPA_EDITAL_BANCA.length, MAPA_EDITAL_BANCA_POR_SLUG.size);
  for (const entry of MAPA_EDITAL_BANCA) {
    assert.equal(entry.pesoProva, SIMULADO_ESPELHO_DISTRIBUICAO[entry.disciplina]);
    assert.equal(entry.roiBase, calcularRoiBase(entry.pesoProva, entry.prioridadeBanca));
    assert.ok(entry.prioridadeBanca >= 1 && entry.prioridadeBanca <= 5);
  }
}

function testPrioridadeDisciplinas() {
  assert.equal(prioridadeBancaDisciplina("legislacao_transito"), 5);
  assert.equal(prioridadeBancaDisciplina("informatica"), 5);
  assert.equal(prioridadeBancaDisciplina("historia_cg_pb"), 5);
  assert.equal(prioridadeBancaDisciplina("portugues"), 3);

  const ranking = disciplinasPorRoi();
  assert.equal(ranking[0].disciplina, "legislacao_transito");
  assert.ok(ranking[0].roiBase >= ranking[ranking.length - 1].roiBase);
}

function testPrioridadeTopicos() {
  const infracoes = getMapaTopicoBanca("CTB_infracoes");
  assert.ok(infracoes);
  assert.ok(infracoes.prioridadeBanca >= 4);

  const freeFlow = getMapaTopicoBanca("CONTRAN_1013_free_flow");
  assert.ok(freeFlow);
  assert.equal(freeFlow.prioridadeBanca, 5);

  const baixa = prioridadeBancaTopico("portugues", 1, "portugues_4_1", false);
  assert.ok(baixa <= 4);
}

function run() {
  testMapaCompleto();
  testPrioridadeDisciplinas();
  testPrioridadeTopicos();
  console.log("test:mapa-edital-banca — OK (3 suites)");
}

run();
