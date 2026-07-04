import { z } from "zod";
import { DISCIPLINAS } from "@/types";

const comentarioSchema = z.object({
  o_que_testa: z.string().min(1),
  fundamento_legal: z.string().min(1),
  passo_a_passo: z.array(z.string()).min(1),
  pegadinha: z.string().min(1),
  macete: z.string().min(1),
  estudo_reverso: z.array(z.string()).min(1),
});

export const questaoSeedSchema = z.object({
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
  tags: z.array(z.string()).optional(),
}).refine(
  (q) => q.gabarito in q.alternativas,
  "Gabarito deve existir nas alternativas",
);

export const questoesFileSchema = z.array(questaoSeedSchema);

export type QuestaoSeedInput = z.infer<typeof questaoSeedSchema>;
