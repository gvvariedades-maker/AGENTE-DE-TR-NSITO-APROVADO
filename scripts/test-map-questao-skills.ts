/**
 * Unit tests — mapeamento questão → skills (Fase 2, sem DB).
 */
import assert from "node:assert/strict";
import {
  FINE_SKILLS_LT,
  MECHANISM_SKILL_CODE,
  TRANSFER_LEVELS,
} from "../src/lib/skills/catalog";
import {
  inferPilotTransferLevel,
  mapQuestaoToSkillLinks,
  matchFineSkills,
} from "../src/lib/skills/map-questao-skills";

assert.ok(FINE_SKILLS_LT.length >= 3, "catálogo fino mínimo");
assert.ok(TRANSFER_LEVELS.includes("T1"));
assert.equal(MECHANISM_SKILL_CODE.competencia_snt, "CTB_cluster_snt_competencias");
assert.equal(MECHANISM_SKILL_CODE.gravidade, "CTB_cluster_infracoes_gravidade");

const primaryOnly = mapQuestaoToSkillLinks(
  { topico: "CTB_infracoes", dificuldade: 3 },
  { includeSecondary: false, pilotTransfer: false },
);
assert.equal(primaryOnly.length, 1);
assert.equal(primaryOnly[0]?.role, "primary");
assert.equal(primaryOnly[0]?.skillCode, "CTB_infracoes");
assert.equal(primaryOnly[0]?.transferLevel, "T1");

const withFine = matchFineSkills({
  topico: "CTB_penalidades",
  eixosLegais: ["CTB_art_261_caput"],
  tags: ["EAR"],
});
assert.ok(
  withFine.some((f) => f.code === "CTB_cluster_ear_pontuacao"),
  "EAR/art.261 deve mapear cluster",
);

const withSnt = matchFineSkills({
  topico: "CTB_snt_competencias",
  eixosLegais: ["CTB_art_24_II"],
});
assert.ok(withSnt.some((f) => f.code === "CTB_cluster_snt_competencias"));

const pilotLinks = mapQuestaoToSkillLinks(
  {
    topico: "CTB_penalidades",
    dificuldade: 4,
    eixosLegais: ["CTB_art_259"],
    hasNearTransfer: true,
    hasFarTransfer: true,
  },
  { includeSecondary: true, pilotTransfer: true },
);
assert.ok(pilotLinks.some((l) => l.role === "primary"));
assert.ok(
  pilotLinks.some(
    (l) =>
      l.role === "secondary" && l.skillCode === "CTB_cluster_infracoes_gravidade",
  ),
);
assert.equal(inferPilotTransferLevel({ topico: "x", dificuldade: 2 }), "T0");
assert.equal(
  inferPilotTransferLevel({
    topico: "x",
    dificuldade: 5,
    hasFarTransfer: true,
  }),
  "T3",
);
assert.equal(
  inferPilotTransferLevel({
    topico: "x",
    dificuldade: 4,
    hasNearTransfer: true,
  }),
  "T2",
);

console.log("ok: test-map-questao-skills");
