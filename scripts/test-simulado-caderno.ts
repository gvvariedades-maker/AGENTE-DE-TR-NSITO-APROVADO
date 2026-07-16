import assert from "node:assert/strict";
import {
  classificarBucket,
  distribuirCotasDificuldade,
  embaralharCaderno,
  montarCadernoEspelho,
  selecionarParaDisciplina,
  type CandidatoCaderno,
} from "../src/lib/simulado-caderno";

function rngFixo(seq: number[]): () => number {
  let i = 0;
  return () => {
    const v = seq[i % seq.length];
    i += 1;
    return v;
  };
}

function candidato(
  id: string,
  overrides: Partial<CandidatoCaderno> = {},
): CandidatoCaderno {
  return {
    id,
    topicId: overrides.topicId ?? `topic-${id}`,
    disciplina: "legislacao_transito",
    dificuldade: overrides.dificuldade ?? 3,
    estiloIdecan: overrides.estiloIdecan ?? null,
    tags: overrides.tags ?? [],
    isReal: overrides.isReal ?? false,
    ...overrides,
  };
}

// --- Cotas de dificuldade ---
for (const [n, esperado] of [
  [4, { facil: 1, medio: 2, dificil: 1 }],
  [5, { facil: 1, medio: 3, dificil: 1 }],
  [30, { facil: 6, medio: 15, dificil: 9 }],
] as const) {
  const c = distribuirCotasDificuldade(n);
  assert.deepEqual(c, esperado, `cotas para n=${n}`);
  assert.equal(c.facil + c.medio + c.dificil, n);
}

assert.equal(classificarBucket(1), "facil");
assert.equal(classificarBucket(3), "medio");
assert.equal(classificarBucket(5), "dificil");

// --- Preferência real dentro do bucket ---
{
  const pool = [
    candidato("i1", { dificuldade: 3, isReal: false }),
    candidato("r1", { dificuldade: 3, isReal: true, topicId: "t2" }),
    candidato("i2", { dificuldade: 3, isReal: false, topicId: "t3" }),
  ];
  const { selecionados } = selecionarParaDisciplina({
    candidatos: pool,
    cotas: { facil: 0, medio: 1, dificil: 0 },
    rng: () => 0.5,
  });
  assert.equal(selecionados.length, 1);
  assert.equal(selecionados[0].id, "r1");
}

// --- Limite por topic_id (máx 2 quando ≥8 topics na disciplina) ---
{
  const pool = [
    ...Array.from({ length: 3 }, (_, i) =>
      candidato(`q${i}`, { dificuldade: 3, topicId: "mesmo-topic" }),
    ),
    ...Array.from({ length: 7 }, (_, i) =>
      candidato(`o${i}`, { dificuldade: 3, topicId: `outro-${i}` }),
    ),
  ];
  const { selecionados } = selecionarParaDisciplina({
    candidatos: pool,
    cotas: { facil: 0, medio: 5, dificil: 0 },
    rng: () => 0.1,
  });
  const noMesmo = selecionados.filter((s) => s.topicId === "mesmo-topic").length;
  assert.equal(noMesmo, 2, "máx 2 por topic com ≥8 topics");
}

// --- Exclusão e fallback LRU ---
{
  const pool = [
    candidato("a", { dificuldade: 3, topicId: "t1" }),
    candidato("b", { dificuldade: 3, topicId: "t2" }),
    candidato("c", { dificuldade: 3, topicId: "t3" }),
  ];
  const excluirIds = new Set(["a", "b"]);
  const lruRank = new Map([
    ["a", 1],
    ["b", 10],
  ]);

  const { selecionados, reusoCount } = selecionarParaDisciplina({
    candidatos: pool,
    cotas: { facil: 0, medio: 2, dificil: 0 },
    excluirIds,
    lruRank,
    rng: () => 0.5,
  });

  assert.equal(selecionados.length, 2);
  const ids = selecionados.map((s) => s.id);
  assert.ok(ids.includes("c"));
  assert.ok(ids.includes("a"), "reuso LRU escolhe a mais antiga (a)");
  assert.equal(reusoCount, 1);
}

// --- Caderno sem IDs duplicados ---
{
  const candidatos = Array.from({ length: 40 }, (_, i) =>
    candidato(`lt-${i}`, {
      dificuldade: i % 5 === 0 ? 2 : i % 3 === 0 ? 4 : 3,
      topicId: `topic-${i % 15}`,
      isReal: i % 4 === 0,
    }),
  );

  const { ids, meta } = montarCadernoEspelho({
    porDisciplina: { legislacao_transito: candidatos },
    excluirIds: new Set(["lt-0", "lt-1"]),
    rng: rngFixo([0.2, 0.5, 0.8]),
  });

  assert.equal(new Set(ids).size, ids.length, "sem duplicatas no caderno");
  assert.ok(ids.length <= 30);
  assert.ok(meta.reaisCount >= 0);
}

// --- Embaralhar preserva tamanho ---
{
  const arr = [1, 2, 3, 4, 5];
  const shuffled = embaralharCaderno(arr, rngFixo([0.9, 0.1, 0.5, 0.3, 0.7]));
  assert.equal(shuffled.length, 5);
  assert.deepEqual([...shuffled].sort(), [1, 2, 3, 4, 5]);
}

console.log("test-simulado-caderno: OK");
