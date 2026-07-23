import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  calcularBacklogDominio,
  classificarDominioAgregado,
  CONTAGEM_DOMINIO_VAZIA,
  criarContagemDominio,
  type ContagemDominio,
  type NivelDominio,
  registrarNivelDominio,
} from "@/lib/dominio-topico";
import { verificarDominioTopicoComMastery } from "@/lib/mastery";
import { calcularDebitoDiario } from "@/lib/plano-prova-calc";
import { diasParaProva } from "@/lib/prova-data";
import { DISCIPLINAS, type Disciplina } from "@/types";

export interface TopicoDominio {
  topicId: string;
  slug: string;
  disciplina: Disciplina;
  nivel: NivelDominio;
  tentativas: number;
}

export interface DominioResumo {
  global: ContagemDominio;
  porDisciplina: Record<Disciplina, ContagemDominio>;
  /** Microtópicos estudáveis sem domínio — alimenta débito diário. */
  backlog: number;
  debitoDiario: number;
  topicos: TopicoDominio[];
  hasData: boolean;
}

function contagemVaziaPorDisciplina(): Record<Disciplina, ContagemDominio> {
  return Object.fromEntries(
    DISCIPLINAS.map((d) => [d, criarContagemDominio()]),
  ) as Record<Disciplina, ContagemDominio>;
}

export function dominioResumoVazio(): DominioResumo {
  const dias = diasParaProva();
  return {
    global: { ...CONTAGEM_DOMINIO_VAZIA },
    porDisciplina: contagemVaziaPorDisciplina(),
    backlog: 0,
    debitoDiario: calcularDebitoDiario(0, dias),
    topicos: [],
    hasData: false,
  };
}

export async function getDominioResumo(
  userId?: string | null,
): Promise<DominioResumo> {
  if (!userId) return dominioResumoVazio();

  try {
    const estudaveis = await db.execute<{
      topic_id: string;
      slug: string;
      disciplina: Disciplina;
      tentativas: number;
      acertos: number;
    }>(sql`
      SELECT
        t.id AS topic_id,
        t.nome AS slug,
        t.disciplina,
        count(a.id)::int AS tentativas,
        count(a.id) FILTER (WHERE a.acertou)::int AS acertos
      FROM topics t
      INNER JOIN questions q ON q.topic_id = t.id
      LEFT JOIN attempts a
        ON a.question_id = q.id AND a.user_id = ${userId}::uuid
      GROUP BY t.id, t.nome, t.disciplina
    `);

    if (estudaveis.length === 0) {
      return dominioResumoVazio();
    }

    const ultimasRows = await db.execute<{
      topic_id: string;
      acertou: boolean;
      created_at: Date;
      rn: number;
    }>(sql`
      WITH ranked AS (
        SELECT
          t.id AS topic_id,
          a.acertou,
          a.created_at,
          row_number() OVER (
            PARTITION BY t.id ORDER BY a.created_at DESC
          ) AS rn
        FROM topics t
        INNER JOIN questions q ON q.topic_id = t.id
        INNER JOIN attempts a
          ON a.question_id = q.id AND a.user_id = ${userId}::uuid
      )
      SELECT topic_id, acertou, created_at, rn
      FROM ranked
      WHERE rn <= 2
    `);

    const ultimasPorTopico = new Map<
      string,
      { acertou: boolean; createdAt: Date }[]
    >();
    for (const row of ultimasRows) {
      const lista = ultimasPorTopico.get(row.topic_id) ?? [];
      lista.push({ acertou: row.acertou, createdAt: row.created_at });
      ultimasPorTopico.set(row.topic_id, lista);
    }

    const global = criarContagemDominio();
    const porDisciplina = contagemVaziaPorDisciplina();
    const topicos: TopicoDominio[] = [];
    let hasData = false;

    for (const row of estudaveis) {
      const ultimasDuas = ultimasPorTopico.get(row.topic_id) ?? [];
      const nivel = classificarDominioAgregado({
        tentativas: row.tentativas,
        acertos: row.acertos,
        ultimasDuas,
      });

      if (row.tentativas > 0) hasData = true;

      registrarNivelDominio(global, nivel);
      registrarNivelDominio(porDisciplina[row.disciplina], nivel);

      topicos.push({
        topicId: row.topic_id,
        slug: row.slug,
        disciplina: row.disciplina,
        nivel,
        tentativas: row.tentativas,
      });
    }

    const backlog = calcularBacklogDominio(global);
    const dias = diasParaProva();

    return {
      global,
      porDisciplina,
      backlog,
      debitoDiario: calcularDebitoDiario(backlog, dias),
      topicos,
      hasData,
    };
  } catch {
    return dominioResumoVazio();
  }
}

/** Verifica domínio de um tópico (mesma regra que estudo-reverso / Fase 3). */
export async function verificarDominioTopicoPorId(
  userId: string,
  topicId: string,
): Promise<boolean> {
  return verificarDominioTopicoComMastery(userId, topicId);
}
