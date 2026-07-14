import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { questions, topics } from "@/lib/db/schema";
import { DISCIPLINAS, type Disciplina } from "@/types";
import {
  TAG_QUESTAO_REAL_IDECAN,
  isQuestaoRealIdecan,
} from "@/lib/questoes-reais-tags";

export { TAG_QUESTAO_REAL_IDECAN, isQuestaoRealIdecan };

/** Filtro SQL: coluna `tags` contém questão real IDECAN. */
export function sqlSomenteQuestoesReais(coluna = "q.tags") {
  return sql`${sql.raw(coluna)} @> ARRAY[${TAG_QUESTAO_REAL_IDECAN}]::text[]`;
}

export interface TopicoReaisResumo {
  slug: string;
  label: string;
  questoesReaisCount: number;
}

export interface VitrineReaisDisciplina {
  disciplina: Disciplina;
  total: number;
  topicos: TopicoReaisResumo[];
}

export interface VitrineReaisResumo {
  total: number;
  disciplinas: VitrineReaisDisciplina[];
}

/** Contagem global e por disciplina para a vitrine `/estudo/reais`. */
export async function getVitrineReaisResumo(): Promise<VitrineReaisResumo> {
  try {
    const rows = await db.execute<{
      disciplina: Disciplina;
      slug: string;
      questoes_reais: number;
    }>(sql`
      SELECT
        t.disciplina,
        t.nome AS slug,
        count(q.id)::int AS questoes_reais
      FROM questions q
      INNER JOIN topics t ON t.id = q.topic_id
      WHERE ${sqlSomenteQuestoesReais("q.tags")}
      GROUP BY t.disciplina, t.nome
      HAVING count(q.id) > 0
      ORDER BY t.disciplina, t.nome
    `);

    const { labelTopicoEdital } = await import("@/lib/edital-topicos");

    const porDisciplina = new Map<Disciplina, TopicoReaisResumo[]>();
    let total = 0;

    for (const row of rows) {
      total += row.questoes_reais;
      const lista = porDisciplina.get(row.disciplina) ?? [];
      lista.push({
        slug: row.slug,
        label: labelTopicoEdital(row.slug),
        questoesReaisCount: row.questoes_reais,
      });
      porDisciplina.set(row.disciplina, lista);
    }

    const disciplinas: VitrineReaisDisciplina[] = DISCIPLINAS.filter((d) =>
      porDisciplina.has(d),
    ).map((disciplina) => ({
      disciplina,
      total: (porDisciplina.get(disciplina) ?? []).reduce(
        (acc, t) => acc + t.questoesReaisCount,
        0,
      ),
      topicos: porDisciplina.get(disciplina) ?? [],
    }));

    return { total, disciplinas };
  } catch {
    return { total: 0, disciplinas: [] };
  }
}

export async function getContagemQuestoesReais(): Promise<number> {
  try {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(questions)
      .where(sqlSomenteQuestoesReais("questions.tags"));
    return row?.count ?? 0;
  } catch {
    return 0;
  }
}
