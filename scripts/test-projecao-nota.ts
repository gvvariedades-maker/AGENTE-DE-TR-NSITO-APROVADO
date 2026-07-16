import assert from "node:assert/strict";
import {
  META_NOTA_ALVO,
  montarIndiceChegada,
  montarProjecaoNota,
} from "../src/lib/projecao-nota";
import { montarPlanoProvaResumo } from "../src/lib/plano-prova-calc";
import { criarContagemDominio, registrarNivelDominio } from "../src/lib/dominio-topico";
import { DISCIPLINAS } from "../src/types";

function disciplinasUniforme(taxa: number) {
  return DISCIPLINAS.map((disciplina) => ({
    disciplina,
    tentativas: 100,
    acertos: Math.round(100 * taxa),
  }));
}

function testProjecaoGap90() {
  const proj = montarProjecaoNota({
    disciplinas: disciplinasUniforme(0.5),
    disciplinasEmRisco: [],
    espelhoMedia: null,
    espelhoQuantidade: 0,
  });
  assert.ok(proj.notaProjetada > 0);
  assert.equal(proj.gapPara90, Math.max(0, META_NOTA_ALVO - proj.notaProjetada));
  assert.ok(proj.gapPara50 === 0 || proj.notaProjetada < 50);
}

function testBlendEspelho() {
  const soTentativas = montarProjecaoNota({
    disciplinas: disciplinasUniforme(0.4),
    disciplinasEmRisco: [],
    espelhoMedia: null,
    espelhoQuantidade: 0,
  });
  const comEspelho = montarProjecaoNota({
    disciplinas: disciplinasUniforme(0.4),
    disciplinasEmRisco: [],
    espelhoMedia: 72,
    espelhoQuantidade: 2,
  });
  assert.ok(comEspelho.pesoEspelho > 0);
  assert.notEqual(comEspelho.notaProjetada, soTentativas.notaProjetada);
}

function testIndiceQuatroSinais() {
  const plano = montarPlanoProvaResumo({
    dias: 30,
    topicosTotal: 100,
    topicosVistos: 60,
    coberturaEditalPct: 60,
    revisoesHoje: 5,
    memoriaAindaFrescas: 10,
    espelhoMedia: 55,
    espelhoQuantidade: 1,
    hasData: true,
  });
  const dominio = criarContagemDominio();
  registrarNivelDominio(dominio, "dominado");
  registrarNivelDominio(dominio, "formando");
  const proj = montarProjecaoNota({
    disciplinas: disciplinasUniforme(0.55),
    disciplinasEmRisco: [{ disciplina: "informatica" }],
    espelhoMedia: 55,
    espelhoQuantidade: 1,
  });
  const indice = montarIndiceChegada({
    plano,
    projecao: proj,
    dominioGlobal: dominio,
    disciplinasEmRisco: 1,
  });
  assert.equal(indice.sinais.length, 4);
  assert.ok(indice.sinais.some((s) => s.id === "dominio"));
  assert.ok(indice.sinais.some((s) => s.id === "ritmo"));
  assert.ok(indice.sinais.some((s) => s.id === "espelho"));
  assert.ok(indice.sinais.some((s) => s.id === "sobrevivencia"));
  assert.ok(indice.resumo.includes("Projeção"));
}

testProjecaoGap90();
testBlendEspelho();
testIndiceQuatroSinais();
console.log("test:projecao-nota — OK");
