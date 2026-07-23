/**
 * Mapeamento puro questão → skills (sem DB).
 * Usado por bootstrap-skills e validate-skill-coverage.
 */
import {
  FINE_SKILLS_LT,
  type FineSkillDef,
  type SkillRole,
  type TransferLevel,
} from "./catalog";

export interface QuestaoSkillInput {
  topico: string;
  dificuldade?: number;
  tags?: string[];
  eixosLegais?: string[];
  fundamentoSlug?: string;
  hasNearTransfer?: boolean;
  hasFarTransfer?: boolean;
}

export interface MappedSkillLink {
  skillCode: string;
  role: SkillRole;
  weight: number;
  transferLevel: TransferLevel;
}

function normalizeTag(t: string): string {
  return t
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_");
}

function eixoMatchesPrefix(eixo: string, prefix: string): boolean {
  return eixo === prefix || eixo.startsWith(`${prefix}_`) || eixo.startsWith(prefix);
}

/**
 * Skills secundárias a partir de eixos_legais / tags / fundamento.
 */
export function matchFineSkills(
  input: QuestaoSkillInput,
  fineCatalog: readonly FineSkillDef[] = FINE_SKILLS_LT,
): FineSkillDef[] {
  const eixos = [
    ...(input.eixosLegais ?? []),
    ...(input.fundamentoSlug ? [input.fundamentoSlug] : []),
  ];
  const tags = new Set((input.tags ?? []).map(normalizeTag));
  const matched: FineSkillDef[] = [];

  for (const fine of fineCatalog) {
    const byPrefix = fine.slugPrefixes.some((p) =>
      eixos.some((e) => eixoMatchesPrefix(e, p)),
    );
    const byTag = (fine.tags ?? []).some((t) => tags.has(normalizeTag(t)));
    if (byPrefix || byTag) {
      matched.push(fine);
    }
  }
  return matched;
}

/**
 * Nível de transferência para o piloto (curadoria leve).
 * Restante do catálogo fica em T1 (default).
 */
export function inferPilotTransferLevel(
  input: QuestaoSkillInput,
): TransferLevel {
  const d = input.dificuldade ?? 3;
  if (d <= 2) return "T0";
  if (d >= 5 && input.hasFarTransfer) return "T3";
  if (d >= 4 && (input.hasNearTransfer || input.hasFarTransfer)) return "T2";
  return "T1";
}

/**
 * Links mínimos: primary = topico; secondary = clusters finos (opcional piloto).
 */
export function mapQuestaoToSkillLinks(
  input: QuestaoSkillInput,
  options: { includeSecondary: boolean; pilotTransfer: boolean } = {
    includeSecondary: false,
    pilotTransfer: false,
  },
): MappedSkillLink[] {
  const transferLevel = options.pilotTransfer
    ? inferPilotTransferLevel(input)
    : ("T1" as TransferLevel);

  const links: MappedSkillLink[] = [
    {
      skillCode: input.topico,
      role: "primary",
      weight: 1,
      transferLevel,
    },
  ];

  if (!options.includeSecondary) return links;

  const primaryCode = input.topico;
  for (const fine of matchFineSkills(input)) {
    if (fine.code === primaryCode) continue;
    links.push({
      skillCode: fine.code,
      role: "secondary",
      weight: 0.5,
      transferLevel,
    });
  }

  return links;
}
