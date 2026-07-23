import {
  isInterventionPath,
  type InterventionPath,
  type PedagogyAlternativeDiagnostic,
  type PedagogyConfig,
} from "@/types/pedagogy";

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out = value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  return out.length > 0 ? out : undefined;
}

function parseAlternativeDiagnostics(
  raw: unknown,
): Record<string, PedagogyAlternativeDiagnostic> | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: Record<string, PedagogyAlternativeDiagnostic> = {};
  for (const [letra, entry] of Object.entries(raw)) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const e = entry as Record<string, unknown>;
    out[letra.toUpperCase()] = {
      misconceptionCode:
        typeof e.misconceptionCode === "string"
          ? e.misconceptionCode
          : typeof e.misconception_code === "string"
            ? e.misconception_code
            : undefined,
      mechanismSlug:
        typeof e.mechanismSlug === "string"
          ? e.mechanismSlug
          : typeof e.mechanism_slug === "string"
            ? e.mechanism_slug
            : undefined,
      errorType:
        typeof e.errorType === "string"
          ? e.errorType
          : typeof e.error_type === "string"
            ? e.error_type
            : undefined,
    };
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function parsePaths(
  raw: unknown,
): Partial<Record<InterventionPath, string[]>> | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: Partial<Record<InterventionPath, string[]>> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!isInterventionPath(key)) continue;
    const ids = asStringArray(value);
    if (ids) out[key] = ids;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Parse seguro de `pedagogy_json`. Retorna null se ausente/inválido
 * (player deve abrir aula completa).
 */
export function parsePedagogyConfig(raw: unknown): PedagogyConfig | null {
  if (raw == null) return null;
  if (typeof raw !== "object" || Array.isArray(raw)) return null;

  const obj = raw as Record<string, unknown>;
  const config: PedagogyConfig = {
    skillCodes: asStringArray(obj.skillCodes ?? obj.skill_codes),
    alternativeDiagnostics: parseAlternativeDiagnostics(
      obj.alternativeDiagnostics ?? obj.alternative_diagnostics,
    ),
    paths: parsePaths(obj.paths),
    noviceIntro: asStringArray(obj.noviceIntro ?? obj.novice_intro),
    prerequisiteSkillCodes: asStringArray(
      obj.prerequisiteSkillCodes ?? obj.prerequisite_skill_codes,
    ),
  };

  return config;
}
