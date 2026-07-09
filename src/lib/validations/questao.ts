import { z } from "zod";
import {
  estudoReversoVisualCompletoSchema,
  estudoReversoVisualSchema,
} from "@/lib/validations/estudo-reverso-visual";
import { validarPasso2Mecanismos } from "@/lib/validations/questao-mecanismo";
import { DISCIPLINAS } from "@/types";

const comentarioSchema = z.object({
  o_que_testa: z.string().min(1),
  fundamento_legal: z.string().min(1),
  passo_a_passo: z.array(z.string()).min(1),
  pegadinha: z.string().min(1),
  macete: z.string().min(1),
  estudo_reverso: z.array(z.string()).min(1),
});

const questaoSeedBaseSchema = z.object({
  disciplina: z.enum(DISCIPLINAS),
  topico: z.string().min(1),
  tipo: z.string().min(1),
  estilo_idecan: z.string().optional(),
  dificuldade: z.number().int().min(1).max(5),
  enunciado: z.string().min(10),
  alternativas: z.record(z.string(), z.string()).refine(
    (alts) => Object.keys(alts).length >= 4,
    "Mínimo de 4 alternativas",
  ),
  gabarito: z.string().min(1),
  comentario: comentarioSchema,
  estudo_reverso_visual: estudoReversoVisualSchema.optional(),
  estudo_reverso_visual_completo: estudoReversoVisualCompletoSchema.optional(),
  /** Dispositivo principal da pegadinha — espelha visual v2; usado no índice de cobertura. */
  fundamento_slug: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
});

const questaoSeedBaseRefine = (
  q: z.infer<typeof questaoSeedBaseSchema>,
  ctx: z.RefinementCtx,
) => {
  if (!(q.gabarito in q.alternativas)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Gabarito deve existir nas alternativas",
      path: ["gabarito"],
    });
  }
  validarPasso2Mecanismos(
    q.gabarito,
    q.alternativas,
    q.comentario.passo_a_passo,
    ctx,
  );
};

/** Schema base — v2 opcional (rascunhos / exemplos parciais). */
export const questaoSeedSchema = questaoSeedBaseSchema.superRefine(questaoSeedBaseRefine);

/**
 * Schema para import/seed — exige aula completa v2 em toda questão.
 * Usado por validate:questoes, validate:lote e db:seed.
 */
export const questaoSeedImportSchema = questaoSeedBaseSchema
  .extend({
    estudo_reverso_visual_completo: estudoReversoVisualCompletoSchema,
  })
  .superRefine((q, ctx) => {
    questaoSeedBaseRefine(q, ctx);
  });

export const questoesFileSchema = z.array(questaoSeedSchema);

/** Lotes para seed — cada questão com v2 obrigatória. */
export const questoesImportFileSchema = z.array(questaoSeedImportSchema);

export type QuestaoSeedInput = z.infer<typeof questaoSeedSchema>;
export type QuestaoSeedImportInput = z.infer<typeof questaoSeedImportSchema>;
