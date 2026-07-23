import { z } from "zod";
import { INTERVENTION_PATHS } from "@/types/pedagogy";

const pedagogyAlternativeDiagnosticSchema = z
  .object({
    misconceptionCode: z.string().optional(),
    misconception_code: z.string().optional(),
    mechanismSlug: z.string().optional(),
    mechanism_slug: z.string().optional(),
    errorType: z.string().optional(),
    error_type: z.string().optional(),
  })
  .passthrough();

const interventionPathSchema = z.enum(INTERVENTION_PATHS);

/** Schema opcional para seed — `pedagogy` / `pedagogy_json`. */
export const pedagogyConfigSchema = z
  .object({
    skillCodes: z.array(z.string()).optional(),
    skill_codes: z.array(z.string()).optional(),
    alternativeDiagnostics: z
      .record(z.string(), pedagogyAlternativeDiagnosticSchema)
      .optional(),
    alternative_diagnostics: z
      .record(z.string(), pedagogyAlternativeDiagnosticSchema)
      .optional(),
    paths: z.record(interventionPathSchema, z.array(z.string().min(1))).optional(),
    noviceIntro: z.array(z.string()).optional(),
    novice_intro: z.array(z.string()).optional(),
    prerequisiteSkillCodes: z.array(z.string()).optional(),
    prerequisite_skill_codes: z.array(z.string()).optional(),
  })
  .passthrough();

export type PedagogyConfigInput = z.infer<typeof pedagogyConfigSchema>;
