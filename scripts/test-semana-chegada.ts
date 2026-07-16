import assert from "node:assert/strict";
import {
  alocarMixSemana,
  capacidadeDia,
  escolherFocoDisciplina,
  inserirEspelhoNaSemana,
  metaQuestoesDia,
  montarSemanaChegada,
  precisaEspelhoNaSemana,
  statusMissao,
} from "../src/lib/semana-chegada";
import { montarPlanoProvaResumo } from "../src/lib/plano-prova-calc";
import { DISCIPLINAS } from "../src/types";

const HOJE = new Date("2026-07-16T12:00:00");

function planoBase(overrides: Partial<Parameters<typeof montarPlanoProvaResumo>[0]> = {}) {
  return montarPlanoProvaResumo({
    dias: 30,
    topicosTotal: 200,
    topicosVistos: 80,
    coberturaEditalPct: 40,
    revisoesHoje: 3,
    memoriaAindaFrescas: 10,
    espelhoMedia: null,
    espelhoQuantidade: 0,
    hasData: true,
    ...overrides,
  });
}

function disciplinasCobertura(coberturaPct: number) {
  return DISCIPLINAS.map((disciplina) => ({
    disciplina,
    coberturaPct,
  }));
}

function testCapacidadeDia() {
  assert.ok(capacidadeDia("exploracao") >= 18);
  assert.ok(capacidadeDia("exploracao") <= 22);
  assert.ok(capacidadeDia("consolidacao") >= 20);
  assert.ok(capacidadeDia("consolidacao") <= 25);
  assert.ok(capacidadeDia("aperto") >= 22);
  assert.ok(capacidadeDia("aperto") <= 28);
  assert.ok(capacidadeDia("semana_final") >= 15);
  assert.ok(capacidadeDia("semana_final") <= 20);

  const curta = capacidadeDia("exploracao", 30);
  const longa = capacidadeDia("exploracao", 60);
  assert.ok(longa >= curta);
}

function testMetaQuestoesLimites() {
  const baixo = metaQuestoesDia("exploracao", 1);
  assert.ok(baixo >= 12);

  const alto = metaQuestoesDia("aperto", 20);
  assert.ok(alto <= 30);
}

function testSemanaSeteDias() {
  const plano = planoBase();
  const semana = montarSemanaChegada({
    hoje: HOJE,
    plano,
    atividadeHoje: { questoes: 0 },
    disciplinasEmRisco: [],
    disciplinas: disciplinasCobertura(40),
    espelho: {
      janela: 3,
      quantidade: 0,
      ultimo: null,
      media: null,
      melhor: null,
    },
  });

  assert.equal(semana.missoes.length, 7);
  assert.equal(semana.missoes[0].offset, 0);
  assert.equal(semana.missoes[0].data, "2026-07-16");
  assert.equal(semana.missoes[0].diaSemanaLabel, "Qui");
  assert.equal(semana.missoes[6].offset, 6);
  assert.equal(semana.missoes[6].data, "2026-07-22");
}

function testSemanaFinalRevisoesDominantes() {
  const plano = planoBase({
    dias: 5,
    revisoesHoje: 12,
    topicosVistos: 195,
    coberturaEditalPct: 97,
  });

  const semana = montarSemanaChegada({
    hoje: HOJE,
    plano,
    atividadeHoje: { questoes: 0 },
    disciplinasEmRisco: [],
    disciplinas: disciplinasCobertura(90),
    espelho: {
      janela: 3,
      quantidade: 2,
      ultimo: { nota: 75, createdAt: new Date("2026-07-10") },
      media: 75,
      melhor: 78,
    },
  });

  const estudoOuRevisao = semana.missoes.filter(
    (m) => m.tipo === "estudo" || m.tipo === "revisoes",
  );
  assert.ok(estudoOuRevisao.length >= 4);

  for (const m of estudoOuRevisao) {
    if (m.metaQuestoes <= 0) continue;
    const pct = m.mix.revisoes / m.metaQuestoes;
    const ok = m.tipo === "revisoes" || pct >= 0.7;
    assert.ok(ok, `dia offset ${m.offset} deveria ser revisão dominante`);
  }
}

function testEspelhoQuandoNuncaFez() {
  const plano = planoBase({ espelhoQuantidade: 0 });
  assert.ok(
    precisaEspelhoNaSemana({
      espelhoQuantidade: 0,
      espelhoMedia: null,
      ultimoEspelhoEm: null,
      hoje: HOJE,
      diasParaProva: 30,
    }),
  );

  const semana = montarSemanaChegada({
    hoje: HOJE,
    plano,
    atividadeHoje: { questoes: 0 },
    disciplinasEmRisco: [],
    disciplinas: disciplinasCobertura(40),
    espelho: {
      janela: 3,
      quantidade: 0,
      ultimo: null,
      media: null,
      melhor: null,
    },
  });

  const espelhos = semana.missoes.filter((m) => m.tipo === "espelho");
  assert.equal(espelhos.length, 1);
  assert.equal(espelhos[0].href, "/simulado");
}

function testInserirEspelhoOffset() {
  const tipos = inserirEspelhoNaSemana(
    Array.from({ length: 7 }, () => "estudo" as const),
    {
      espelhoQuantidade: 0,
      espelhoMedia: null,
      ultimoEspelhoEm: null,
      hoje: HOJE,
      diasParaProva: 30,
    },
  );
  assert.equal(tipos.filter((t) => t === "espelho").length, 1);
  assert.equal(tipos[3], "espelho");
}

function testStatusFeito() {
  assert.equal(statusMissao(20, 20, 0), "feito");
  assert.equal(statusMissao(10, 20, 0), "parcial");
  assert.equal(statusMissao(0, 20, 0), "hoje");
  assert.equal(statusMissao(0, 20, 2), "futuro");
}

function testDebitoAltoNaoEstouraTeto() {
  const meta = metaQuestoesDia("aperto", 50);
  assert.ok(meta <= 30);

  const metas = Array.from({ length: 7 }, () => meta);
  const mixes = alocarMixSemana("aperto", 2, 50, metas);
  assert.equal(mixes.length, 7);
  for (let i = 0; i < 7; i++) {
    const total = mixes[i].revisoes + mixes[i].novas + mixes[i].erros;
    assert.ok(total <= meta);
  }
}

function testFocoDisciplina() {
  const ctb = escolherFocoDisciplina({
    coberturaEditalPct: 30,
    disciplinasEmRisco: [],
    disciplinas: disciplinasCobertura(30),
  });
  assert.equal(ctb, "legislacao_transito");

  const comRisco = escolherFocoDisciplina({
    coberturaEditalPct: 80,
    disciplinasEmRisco: [{ disciplina: "informatica" }],
    disciplinas: DISCIPLINAS.map((disciplina) => ({
      disciplina,
      coberturaPct:
        disciplina === "informatica"
          ? 10
          : disciplina === "legislacao_transito"
            ? 95
            : 70,
    })),
  });
  assert.equal(comRisco, "informatica");
}

testCapacidadeDia();
testMetaQuestoesLimites();
testSemanaSeteDias();
testSemanaFinalRevisoesDominantes();
testEspelhoQuandoNuncaFez();
testInserirEspelhoOffset();
testStatusFeito();
testDebitoAltoNaoEstouraTeto();
testFocoDisciplina();

console.log("semana-chegada: todos os testes passaram");
