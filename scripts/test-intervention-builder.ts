import assert from "node:assert/strict";
import {
  buildInterventionScreens,
  enforceMaxConsecutiveExpository,
  applyInterventionToVisual,
} from "../src/lib/tutor/intervention-builder";
import { evaluateNoviceGate } from "../src/lib/tutor/novice-gate";
import { resolveAdaptiveLesson } from "../src/lib/tutor/resolve-adaptive-lesson";
import { parsePedagogyConfig } from "../src/lib/tutor/pedagogy-config";
import type { EstudoReversoVisual } from "../src/types/estudo-reverso-visual";

const visualFixture: EstudoReversoVisual = {
  versao: 2,
  arquetipo: "comparacao",
  duracao_estimada_seg: 300,
  fundamento_slug: "CTB_art_215_II",
  macete_visual: "R-1 = CEDER",
  links_fonte: [],
  telas: [
    {
      id: "contexto",
      titulo: "Diagnóstico",
      secao: "diagnostico",
      tipo: "texto_destaque",
      conteudo: { texto: "diag" },
    },
    {
      id: "mapa",
      titulo: "Mapa",
      secao: "mapa",
      tipo: "texto_destaque",
      conteudo: { texto: "mapa" },
    },
    {
      id: "contraste",
      titulo: "Contraste",
      secao: "contraste",
      tipo: "texto_destaque",
      conteudo: { texto: "contraste" },
    },
    {
      id: "distratores",
      titulo: "Distratores",
      secao: "distratores",
      tipo: "texto_destaque",
      conteudo: { texto: "distratores" },
    },
    {
      id: "lei",
      titulo: "Lei",
      secao: "lei",
      tipo: "texto_destaque",
      conteudo: { texto: "lei" },
    },
    {
      id: "recall",
      titulo: "Recall",
      secao: "recall",
      tipo: "texto_destaque",
      conteudo: { texto: "recall" },
    },
    {
      id: "macete",
      titulo: "Macete",
      secao: "macete",
      tipo: "texto_destaque",
      conteudo: { texto: "macete" },
    },
  ],
};

function testFastConfirmationCurto() {
  const r = buildInterventionScreens({
    visual: visualFixture,
    path: "fast_confirmation",
    pedagogy: {},
  });
  assert.equal(r.fullTrail, false);
  assert.ok(r.telas.length <= 3);
  assert.ok(r.screenIds.includes("macete") || r.screenIds.includes("recall"));
}

function testGuidedFullTrail() {
  const r = buildInterventionScreens({
    visual: visualFixture,
    path: "guided_learning",
    pedagogy: {},
  });
  assert.equal(r.fullTrail, true);
  assert.equal(r.telas.length, visualFixture.telas.length);
}

function testPathsExplicitos() {
  const r = buildInterventionScreens({
    visual: visualFixture,
    path: "uncertain_correct",
    pedagogy: {
      paths: { uncertain_correct: ["contraste", "macete"] },
    },
  });
  assert.deepEqual(r.screenIds, ["contraste", "macete"]);
}

function testMaxExpository() {
  const long = enforceMaxConsecutiveExpository(visualFixture.telas.slice(0, 5));
  let streak = 0;
  let maxStreak = 0;
  for (const t of long) {
    if (
      t.secao &&
      ["diagnostico", "mapa", "contraste", "distratores", "lei"].includes(
        t.secao,
      )
    ) {
      streak += 1;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 0;
    }
  }
  assert.ok(maxStreak <= 2);
}

function testNoviceGate() {
  const map = new Map();
  assert.equal(
    evaluateNoviceGate({
      prerequisiteSkillCodes: ["CTB_preferencia"],
      masteryByCode: map,
    }),
    true,
  );
  map.set("CTB_preferencia", {
    skillCode: "CTB_preferencia",
    state: "learning" as const,
    novelCorrectCount: 1,
  });
  assert.equal(
    evaluateNoviceGate({
      prerequisiteSkillCodes: ["CTB_preferencia"],
      masteryByCode: map,
    }),
    false,
  );
}

function testResolveSemPedagogyLegado() {
  const plan = resolveAdaptiveLesson({
    visual: visualFixture,
    pedagogy: null,
    acertou: true,
    confidence: 3,
  });
  assert.equal(plan.adaptive, false);
  assert.equal(plan.visual.telas.length, visualFixture.telas.length);
}

function testResolveComPedagogyFast() {
  const plan = resolveAdaptiveLesson({
    visual: visualFixture,
    pedagogy: { skillCodes: ["CTB_preferencia"] },
    acertou: true,
    confidence: 3,
    masteryUpdates: [
      {
        skillId: "s1",
        skillCode: "CTB_preferencia",
        role: "primary",
        state: "mastered",
        recallScore: 0.9,
        transferScore: 0.85,
        calibrationScore: 0.9,
        masteryProbability: 0.85,
        novelCorrectCount: 3,
        delayedCorrectCount: 2,
        highConfidenceErrorCount: 0,
      },
    ],
  });
  assert.equal(plan.adaptive, true);
  assert.equal(plan.path, "fast_confirmation");
  assert.ok(plan.visual.telas.length < visualFixture.telas.length);
}

function testParsePedagogy() {
  const cfg = parsePedagogyConfig({
    skill_codes: ["A"],
    prerequisite_skill_codes: ["B"],
    paths: { fast_confirmation: ["macete"] },
  });
  assert.ok(cfg);
  assert.deepEqual(cfg?.skillCodes, ["A"]);
  assert.deepEqual(cfg?.prerequisiteSkillCodes, ["B"]);
  assert.deepEqual(cfg?.paths?.fast_confirmation, ["macete"]);
}

function testApplyVisual() {
  const subset = visualFixture.telas.slice(-2);
  const v = applyInterventionToVisual(visualFixture, subset);
  assert.equal(v.telas.length, 2);
  assert.equal(v.versao, 2);
}

function main() {
  testFastConfirmationCurto();
  testGuidedFullTrail();
  testPathsExplicitos();
  testMaxExpository();
  testNoviceGate();
  testResolveSemPedagogyLegado();
  testResolveComPedagogyFast();
  testParsePedagogy();
  testApplyVisual();
  console.log("ok: intervention-builder");
}

main();
