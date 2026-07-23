/**
 * Seleciona subset de telas v2 conforme path de intervenção.
 * Máx. 2 telas expositivas seguidas nos subsets (não na trilha completa).
 */

import type { EstudoReversoVisual, Secao, TelaVisual } from "@/types/estudo-reverso-visual";
import {
  isFullTrailPath,
  type InterventionPath,
  type PedagogyConfig,
} from "@/types/pedagogy";

/** Seções expositivas (CLT) — recall/macete não contam. */
export const EXPOSITORY_SECTIONS: ReadonlySet<Secao> = new Set([
  "diagnostico",
  "mapa",
  "contraste",
  "distratores",
  "metodo",
  "lei",
  "conceito",
]);

/** Preferência de seções quando `pedagogy.paths[path]` está ausente. */
export const PATH_SECTION_PREFS: Record<InterventionPath, readonly Secao[]> = {
  fast_confirmation: ["macete", "recall"],
  uncertain_correct: ["contraste", "diagnostico", "macete"],
  guided_learning: [],
  misconception_repair: [
    "diagnostico",
    "contraste",
    "distratores",
    "lei",
    "macete",
  ],
  transfer_challenge: ["contraste", "recall", "macete"],
  prerequisite_repair: ["mapa", "conceito", "metodo", "lei", "macete"],
};

export const MAX_CONSECUTIVE_EXPOSITORY = 2;

export type BuildInterventionInput = {
  visual: EstudoReversoVisual;
  path: InterventionPath;
  pedagogy?: PedagogyConfig | null;
};

export type BuildInterventionResult = {
  path: InterventionPath;
  /** Telas na ordem do player. */
  telas: TelaVisual[];
  /** true = nenhuma filtragem (aula completa). */
  fullTrail: boolean;
  screenIds: string[];
};

function isExpository(tela: TelaVisual): boolean {
  return Boolean(tela.secao && EXPOSITORY_SECTIONS.has(tela.secao));
}

/**
 * Remove a 3ª+ tela expositiva consecutiva, preservando ordem relativa.
 */
export function enforceMaxConsecutiveExpository(
  telas: TelaVisual[],
  max = MAX_CONSECUTIVE_EXPOSITORY,
): TelaVisual[] {
  const out: TelaVisual[] = [];
  let streak = 0;
  for (const tela of telas) {
    if (isExpository(tela)) {
      streak += 1;
      if (streak > max) continue;
    } else {
      streak = 0;
    }
    out.push(tela);
  }
  return out.length > 0 ? out : telas.slice(0, 1);
}

function telasByIds(
  all: TelaVisual[],
  ids: string[],
): TelaVisual[] {
  const byId = new Map(all.map((t) => [t.id, t]));
  const out: TelaVisual[] = [];
  for (const id of ids) {
    const t = byId.get(id);
    if (t) out.push(t);
  }
  return out;
}

function pickBySections(
  all: TelaVisual[],
  sections: readonly Secao[],
): TelaVisual[] {
  if (sections.length === 0) return [...all];

  const wanted = new Set(sections);
  const picked: TelaVisual[] = [];
  const seen = new Set<string>();

  for (const secao of sections) {
    for (const t of all) {
      if (t.secao === secao && !seen.has(t.id)) {
        picked.push(t);
        seen.add(t.id);
      }
    }
  }

  // Fallback: se nada casou, tenta por id igual ao nome da seção
  if (picked.length === 0) {
    for (const secao of sections) {
      for (const t of all) {
        if (t.id === secao && !seen.has(t.id)) {
          picked.push(t);
          seen.add(t.id);
        }
      }
    }
  }

  // Ainda vazio → última tela (macete/fechamento) ou primeira
  if (picked.length === 0) {
    const macete = all.find((t) => t.secao === "macete" || t.id === "macete");
    return macete ? [macete] : all.slice(-1);
  }

  // Garante fechamento com macete se o path o pediu e ainda não entrou
  if (wanted.has("macete") && !picked.some((t) => t.secao === "macete" || t.id === "macete")) {
    const macete = all.find((t) => t.secao === "macete" || t.id === "macete");
    if (macete) picked.push(macete);
  }

  return picked;
}

/**
 * Constrói subset de telas para o path.
 * Paths full-trail (guided / misconception / prerequisite) usam todas as telas
 * (com noviceIntro prependido se houver), sem truncar exposição.
 */
export function buildInterventionScreens(
  input: BuildInterventionInput,
): BuildInterventionResult {
  const { visual, path, pedagogy } = input;
  const all = visual.telas;

  if (all.length === 0) {
    return { path, telas: [], fullTrail: true, screenIds: [] };
  }

  const explicit = pedagogy?.paths?.[path];
  let selected: TelaVisual[];
  let fullTrail = false;

  if (explicit && explicit.length > 0) {
    selected = telasByIds(all, explicit);
    if (selected.length === 0) selected = [...all];
    fullTrail = selected.length === all.length;
  } else if (isFullTrailPath(path)) {
    selected = [...all];
    fullTrail = true;
  } else {
    selected = pickBySections(all, PATH_SECTION_PREFS[path]);
    fullTrail = selected.length === all.length;
  }

  // Novice intro: prepend IDs configurados (sem duplicar)
  if (
    path === "prerequisite_repair" &&
    pedagogy?.noviceIntro &&
    pedagogy.noviceIntro.length > 0
  ) {
    const intro = telasByIds(all, pedagogy.noviceIntro);
    const seen = new Set(intro.map((t) => t.id));
    selected = [...intro, ...selected.filter((t) => !seen.has(t.id))];
  }

  if (!fullTrail) {
    selected = enforceMaxConsecutiveExpository(selected);
  }

  // Nunca devolver vazio se havia telas
  if (selected.length === 0) {
    selected = all.slice(-1);
  }

  return {
    path,
    telas: selected,
    fullTrail,
    screenIds: selected.map((t) => t.id),
  };
}

/** Clona o visual com subset de telas (preserva meta do pacote). */
export function applyInterventionToVisual(
  visual: EstudoReversoVisual,
  telas: TelaVisual[],
): EstudoReversoVisual {
  return {
    ...visual,
    telas,
    duracao_estimada_seg: Math.max(
      30,
      Math.round(
        (visual.duracao_estimada_seg * telas.length) /
          Math.max(1, visual.telas.length),
      ),
    ),
  };
}
