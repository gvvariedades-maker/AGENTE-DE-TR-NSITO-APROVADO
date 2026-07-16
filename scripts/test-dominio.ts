import assert from "node:assert/strict";
import {
  calcularBacklogDominio,
  classificarDominio,
  classificarDominioAgregado,
  DOMINIO_INTERVALO_MS,
  registrarNivelDominio,
  criarContagemDominio,
} from "../src/lib/dominio-topico";
import { calcularDebitoDiario } from "../src/lib/plano-prova-calc";

const H = DOMINIO_INTERVALO_MS;

function d(ms: number) {
  return new Date(ms);
}

function testNaoVisto() {
  assert.equal(classificarDominio([]), "nao_visto");
  assert.equal(
    classificarDominioAgregado({
      tentativas: 0,
      acertos: 0,
      ultimasDuas: [],
    }),
    "nao_visto",
  );
}

function testAprendendo() {
  assert.equal(
    classificarDominio([{ acertou: false, createdAt: d(0) }]),
    "aprendendo",
  );
  assert.equal(
    classificarDominioAgregado({
      tentativas: 3,
      acertos: 0,
      ultimasDuas: [
        { acertou: false, createdAt: d(100) },
        { acertou: false, createdAt: d(50) },
      ],
    }),
    "aprendendo",
  );
}

function testFormando() {
  assert.equal(
    classificarDominio([{ acertou: true, createdAt: d(0) }]),
    "formando",
  );
  assert.equal(
    classificarDominio([
      { acertou: true, createdAt: d(H + 100) },
      { acertou: false, createdAt: d(100) },
    ]),
    "formando",
  );
  assert.equal(
    classificarDominioAgregado({
      tentativas: 5,
      acertos: 2,
      ultimasDuas: [
        { acertou: false, createdAt: d(500) },
        { acertou: false, createdAt: d(400) },
      ],
    }),
    "formando",
  );
}

function testDominado() {
  assert.equal(
    classificarDominio([
      { acertou: true, createdAt: d(H + 200) },
      { acertou: true, createdAt: d(200) },
    ]),
    "dominado",
  );
  assert.equal(
    classificarDominio([
      { acertou: true, createdAt: d(H) },
      { acertou: true, createdAt: d(0) },
    ]),
    "dominado",
  );
  assert.equal(
    classificarDominio([
      { acertou: true, createdAt: d(H - 1) },
      { acertou: true, createdAt: d(0) },
    ]),
    "formando",
  );
}

function testBacklog() {
  const c = criarContagemDominio();
  registrarNivelDominio(c, "dominado");
  registrarNivelDominio(c, "dominado");
  registrarNivelDominio(c, "formando");
  registrarNivelDominio(c, "nao_visto");
  assert.equal(c.total, 4);
  assert.equal(c.dominado, 2);
  assert.equal(calcularBacklogDominio(c), 2);
}

function testDebitoBacklog() {
  const backlog = 45;
  const dias = 30;
  assert.equal(calcularDebitoDiario(backlog, dias), 3);
  assert.equal(calcularDebitoDiario(200, 10), 15);
}

function run() {
  testNaoVisto();
  testAprendendo();
  testFormando();
  testDominado();
  testBacklog();
  testDebitoBacklog();
  console.log("test:dominio — OK (6 suites)");
}

run();
