import assert from "node:assert/strict";
import {
  alocarSlotsSessaoAuto,
  calcularDebitoDiario,
  calcularDiasAtraso,
  calcularFase,
  calcularGapEdital,
  calcularSemaforoChegada,
  montarPacoteDia,
  montarPlanoProvaResumo,
  orientacaoFase,
  permitirNovasAleatorias,
  proporcaoRevisoesSessao,
} from "../src/lib/plano-prova-calc";

function testFase() {
  assert.equal(calcularFase(50), "exploracao");
  assert.equal(calcularFase(46), "exploracao");
  assert.equal(calcularFase(45), "consolidacao");
  assert.equal(calcularFase(31), "consolidacao");
  assert.equal(calcularFase(30), "aperto");
  assert.equal(calcularFase(8), "aperto");
  assert.equal(calcularFase(7), "semana_final");
  assert.equal(calcularFase(1), "semana_final");
}

function testDebito() {
  assert.equal(calcularDebitoDiario(90, 30), 3);
  assert.equal(calcularDebitoDiario(200, 10), 15);
  assert.equal(calcularDebitoDiario(0, 30), 0);
  assert.equal(calcularDebitoDiario(50, 5), 10);
}

function testAtraso() {
  assert.equal(calcularDiasAtraso(90, 30, 3), 0);
  assert.equal(calcularDiasAtraso(200, 10, 15), 4);
}

function testChegada() {
  const ok = calcularSemaforoChegada({
    topicosRestantes: 10,
    dias: 30,
    debitoDiario: 3,
    espelhoMedia: 60,
    revisoesHoje: 2,
  });
  assert.equal(ok.zona, "verde");

  const atraso = calcularSemaforoChegada({
    topicosRestantes: 200,
    dias: 10,
    debitoDiario: 15,
    espelhoMedia: 40,
    revisoesHoje: 0,
  });
  assert.equal(atraso.zona, "vermelho");
}

function testPacote() {
  const p = montarPacoteDia({
    fase: "semana_final",
    revisoesHoje: 7,
    debito: 3,
    diasAtraso: 0,
  });
  assert.equal(p.href, "/estudo?modo=revisoes");
  assert.ok(p.revisoes > 0);
  assert.equal(p.erros, 2);
}

function testSlotsMotor() {
  assert.equal(proporcaoRevisoesSessao("exploracao"), 0.3);
  assert.equal(proporcaoRevisoesSessao("consolidacao"), 0.5);
  assert.equal(proporcaoRevisoesSessao("aperto"), 0.7);
  assert.equal(proporcaoRevisoesSessao("semana_final"), 0.85);

  const aperto = alocarSlotsSessaoAuto("aperto", 20);
  assert.equal(aperto.revisoes, 14);
  assert.equal(aperto.erros, 1);
  assert.equal(aperto.pratica, 5);
  assert.ok(aperto.revisoes > aperto.pratica + aperto.erros);

  const final = alocarSlotsSessaoAuto("semana_final", 20);
  assert.equal(final.revisoes, 17);
  assert.equal(final.erros, 2);
  assert.equal(final.pratica, 1);

  assert.equal(permitirNovasAleatorias("semana_final", false), false);
  assert.equal(permitirNovasAleatorias("semana_final", true), true);
  assert.equal(permitirNovasAleatorias("aperto", false), true);
}

function testGapEdital() {
  assert.equal(calcularGapEdital(66, 0), 66);
  assert.equal(calcularGapEdital(10, 40), 40);
  assert.equal(calcularGapEdital(0, 0), 0);

  const plano = montarPlanoProvaResumo({
    dias: 45,
    topicosTotal: 81,
    topicosVistos: 15,
    coberturaEditalPct: 19,
    revisoesHoje: 7,
    memoriaAindaFrescas: 12,
    espelhoMedia: 0.5,
    espelhoQuantidade: 2,
    hasData: true,
    topicosBacklog: 0,
  });
  assert.equal(plano.topicosRestantes, 66);
  assert.equal(plano.gapEdital, 66);
  assert.ok(plano.debitoDiario >= 3);
}

function testOrientacao() {
  assert.ok(orientacaoFase("exploracao").includes("CTB"));
  assert.ok(orientacaoFase("semana_final").includes("simulado"));
}

testFase();
testDebito();
testAtraso();
testChegada();
testPacote();
testSlotsMotor();
testGapEdital();
testOrientacao();

console.log("plano-prova: todos os testes passaram");
