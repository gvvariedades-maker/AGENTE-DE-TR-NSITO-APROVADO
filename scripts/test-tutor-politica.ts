import assert from "node:assert/strict";
import { montarPlanoProvaResumo } from "../src/lib/plano-prova-calc";
import { carregarTutorContexto } from "../src/lib/tutor/contexto";
import { CALIBRACAO_PADRAO } from "../src/lib/tutor/calibracao";
import {
  decidirMetaQuestoes,
  decidirMix,
  decidirTipoMissao,
  escolherDisciplinaFoco,
  montarTiposSemana,
  precisaEspelho,
  priorizarDisciplinas,
} from "../src/lib/tutor/politica";
import { DISCIPLINAS } from "../src/types";

function ctxBase(
  overrides: Partial<ReturnType<typeof carregarTutorContexto>> = {},
) {
  const plano = montarPlanoProvaResumo({
    dias: 30,
    topicosTotal: 200,
    topicosVistos: 80,
    coberturaEditalPct: 40,
    revisoesHoje: 3,
    memoriaAindaFrescas: 10,
    espelhoMedia: null,
    espelhoQuantidade: 0,
    hasData: true,
  });
  return {
    ...carregarTutorContexto({ plano }),
    ...overrides,
  };
}

function testEspelhoAbaixo50() {
  const ctx = ctxBase({
    espelho: {
      janela: 3,
      quantidade: 1,
      ultimo: { nota: 45, createdAt: new Date() },
      media: 45,
      melhor: 45,
    },
    diasParaProva: 25,
  });
  assert.ok(precisaEspelho(ctx));
  const tipos = montarTiposSemana(ctx);
  assert.ok(tipos.includes("espelho"));
}

function testSoInformaticaEmRisco() {
  const ctx = ctxBase({
    plano: montarPlanoProvaResumo({
      dias: 30,
      topicosTotal: 200,
      topicosVistos: 180,
      coberturaEditalPct: 85,
      revisoesHoje: 2,
      memoriaAindaFrescas: 5,
      espelhoMedia: 70,
      espelhoQuantidade: 1,
      hasData: true,
    }),
    disciplinasEmRisco: [
      { disciplina: "informatica", pontos: 0, minimo: 1 },
    ],
    disciplinas: DISCIPLINAS.map((disciplina) => ({
      disciplina,
      coberturaPct:
        disciplina === "informatica"
          ? 5
          : disciplina === "legislacao_transito"
            ? 90
            : 70,
    })),
  });
  assert.equal(escolherDisciplinaFoco(ctx), "informatica");
  const prior = priorizarDisciplinas(ctx);
  assert.equal(prior[0].disciplina, "informatica");
}

/** Risco de mínimo vence a regra cobertura edital < 50% → CTB. */
function testRiscoMinimoVenceCoberturaBaixa() {
  const ctx = ctxBase({
    plano: montarPlanoProvaResumo({
      dias: 45,
      topicosTotal: 81,
      topicosVistos: 18,
      coberturaEditalPct: 22,
      revisoesHoje: 1,
      memoriaAindaFrescas: 14,
      espelhoMedia: 0.5,
      espelhoQuantidade: 2,
      hasData: true,
    }),
    disciplinasEmRisco: [
      { disciplina: "portugues", pontos: 0, minimo: 1 },
    ],
    disciplinas: DISCIPLINAS.map((disciplina) => ({
      disciplina,
      coberturaPct: disciplina === "portugues" ? 10 : 30,
    })),
  });
  assert.equal(escolherDisciplinaFoco(ctx), "portugues");
}

function testSemRiscoCoberturaBaixaPriorizaCtb() {
  const ctx = ctxBase({
    plano: montarPlanoProvaResumo({
      dias: 45,
      topicosTotal: 81,
      topicosVistos: 18,
      coberturaEditalPct: 22,
      revisoesHoje: 1,
      memoriaAindaFrescas: 14,
      espelhoMedia: 70,
      espelhoQuantidade: 1,
      hasData: true,
    }),
    disciplinasEmRisco: [],
  });
  assert.equal(escolherDisciplinaFoco(ctx), "legislacao_transito");
}

function testRevisoesDominantesSemanaFinal() {
  const ctx = ctxBase({
    fase: "semana_final",
    plano: montarPlanoProvaResumo({
      dias: 5,
      topicosTotal: 200,
      topicosVistos: 195,
      coberturaEditalPct: 97,
      revisoesHoje: 12,
      memoriaAindaFrescas: 8,
      espelhoMedia: 75,
      espelhoQuantidade: 2,
      hasData: true,
    }),
    revisoesHoje: 12,
  });
  const meta = decidirMetaQuestoes(ctx);
  const mix = decidirMix(ctx, meta, 0);
  const tipo = decidirTipoMissao(ctx, mix, meta);
  assert.ok(
    tipo === "revisoes" || mix.revisoes / meta >= 0.7,
    "semana final com SRS alto deve priorizar revisões",
  );
}

function testSrsAltoLimitaNovas() {
  const ctx = ctxBase({ revisoesHoje: 15 });
  const mix = decidirMix(ctx, 20, 0);
  assert.ok(mix.revisoes >= 8);
  assert.ok(mix.novas <= 12);
}

function testCapacidadeCalibrada() {
  const ctx = ctxBase();
  const padrao = decidirMetaQuestoes(ctx);
  const calibrado = decidirMetaQuestoes({
    ...ctx,
    calibracao: { ...CALIBRACAO_PADRAO, capacidadeQuestoes: 28 },
  });
  assert.ok(calibrado >= padrao);
  assert.ok(calibrado <= 30);
}

testEspelhoAbaixo50();
testSoInformaticaEmRisco();
testRiscoMinimoVenceCoberturaBaixa();
testSemRiscoCoberturaBaixaPriorizaCtb();
testRevisoesDominantesSemanaFinal();
testSrsAltoLimitaNovas();
testCapacidadeCalibrada();
console.log("test:tutor-politica — OK");
