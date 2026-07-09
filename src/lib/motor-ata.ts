import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getSemaforoData } from "@/lib/semaforo";
import { SIMULADO_ESPELHO_DISTRIBUICAO, type Disciplina } from "@/types";

/** Disciplinas gerais com maior risco de zerar (regra do projeto). */
const DISCIPLINAS_RISCO_PADRAO: Disciplina[] = [
  "informatica",
  "historia_cg_pb",
  "legislacao_etica_sp",
];

export type ModoSessaoEstudo =
  | "auto"
  | "normal"
  | "erros"
  | "anti_zerar"
  | "pegadinha";

export interface FiltrosMotor {
  disciplina?: Disciplina;
  topicoSlug?: string;
  disciplinasPrioritarias?: Disciplina[];
  /** Anti-zerar: restringe prática só às disciplinas em risco. */
  filtrarSomentePrioritarias?: boolean;
  somentePegadinha?: boolean;
  somenteErros?: boolean;
}

export function parseModoSessao(raw?: string): ModoSessaoEstudo {
  const valid: ModoSessaoEstudo[] = [
    "auto",
    "normal",
    "erros",
    "anti_zerar",
    "pegadinha",
  ];
  if (raw && valid.includes(raw as ModoSessaoEstudo)) {
    return raw as ModoSessaoEstudo;
  }
  return "auto";
}

export function labelModoSessao(modo: ModoSessaoEstudo): string {
  switch (modo) {
    case "auto":
      return "Motor ATA";
    case "anti_zerar":
      return "Anti-zerar";
    case "pegadinha":
      return "Pegadinha IDECAN";
    case "erros":
      return "Caderno de erros";
    default:
      return "Prática livre";
  }
}

async function resolverContextoAuto(
  userId: string,
): Promise<Pick<FiltrosMotor, "disciplinasPrioritarias">> {
  const semaforo = await getSemaforoData(userId);
  if (semaforo.disciplinasEmRisco.length > 0) {
    return {
      disciplinasPrioritarias: semaforo.disciplinasEmRisco.map(
        (r) => r.disciplina,
      ),
    };
  }
  return {};
}

async function resolverAntiZerar(
  userId: string,
): Promise<Pick<FiltrosMotor, "disciplinasPrioritarias">> {
  const semaforo = await getSemaforoData(userId);
  if (semaforo.disciplinasEmRisco.length > 0) {
    return {
      disciplinasPrioritarias: semaforo.disciplinasEmRisco.map(
        (r) => r.disciplina,
      ),
    };
  }
  return { disciplinasPrioritarias: [...DISCIPLINAS_RISCO_PADRAO] };
}

/** Traduz modo de URL + semáforo em filtros concretos para o motor. */
export async function resolverFiltrosMotor(
  modo: ModoSessaoEstudo,
  userId: string | undefined,
  disciplina?: Disciplina,
  topicoSlug?: string,
): Promise<FiltrosMotor> {
  const base: FiltrosMotor = { disciplina, topicoSlug };

  if (modo === "erros") {
    return { ...base, somenteErros: true };
  }

  if (modo === "pegadinha") {
    return { ...base, somentePegadinha: true };
  }

  if (!userId) return base;

  if (disciplina || topicoSlug) return base;

  switch (modo) {
    case "anti_zerar": {
      const ctx = await resolverAntiZerar(userId);
      return {
        ...base,
        disciplinasPrioritarias: ctx.disciplinasPrioritarias,
        filtrarSomentePrioritarias: true,
      };
    }
    case "auto": {
      const ctx = await resolverContextoAuto(userId);
      return { ...base, disciplinasPrioritarias: ctx.disciplinasPrioritarias };
    }
    default:
      return base;
  }
}

function pesoEditalDisciplina(disciplina: Disciplina): number {
  return Math.round(
    100 * (SIMULADO_ESPELHO_DISTRIBUICAO[disciplina] / 60),
  );
}

/**
 * Seleciona questões de prática por score ponderado:
 * SRS vencido > disciplina em risco > sem tentativa > último erro > peso edital.
 */
export async function buscarIdsPraticaPontuados(
  userId: string,
  limit: number,
  filtros: FiltrosMotor,
  excluirIds: string[] = [],
): Promise<string[]> {
  if (limit <= 0) return [];

  try {
    const disciplinasPrioritarias = filtros.disciplinasPrioritarias ?? [];
    const disciplinasFiltro =
      filtros.filtrarSomentePrioritarias && disciplinasPrioritarias.length > 0
        ? disciplinasPrioritarias
        : filtros.disciplina
          ? [filtros.disciplina]
          : null;

    const pesoPort = pesoEditalDisciplina("portugues");
    const pesoInf = pesoEditalDisciplina("informatica");
    const pesoHist = pesoEditalDisciplina("historia_cg_pb");
    const pesoLeg = pesoEditalDisciplina("legislacao_etica_sp");
    const pesoAdm = pesoEditalDisciplina("direito_administrativo");
    const pesoConst = pesoEditalDisciplina("direito_constitucional");
    const pesoTrans = pesoEditalDisciplina("legislacao_transito");

    const filtroDisciplinaSql = disciplinasFiltro
      ? sql`AND t.disciplina IN (${sql.join(
          disciplinasFiltro.map((d) => sql`${d}`),
          sql`, `,
        )})`
      : sql``;

    const filtroTopicoSql = filtros.topicoSlug
      ? sql`AND t.nome = ${filtros.topicoSlug}`
      : sql``;

    const filtroPegadinhaSql = filtros.somentePegadinha
      ? sql`AND q.estilo_idecan LIKE '%pegadinha%'`
      : sql``;

    const filtroErrosSql = filtros.somenteErros
      ? sql`AND la.acertou = false`
      : sql``;

    const filtroExcluirSql =
      excluirIds.length > 0
        ? sql`AND q.id NOT IN (${sql.join(
            excluirIds.map((id) => sql`${id}::uuid`),
            sql`, `,
          )})`
        : sql``;

    const prioridadeDisciplinaSql =
      disciplinasPrioritarias.length > 0
        ? sql`CASE WHEN t.disciplina IN (${sql.join(
            disciplinasPrioritarias.map((d) => sql`${d}`),
            sql`, `,
          )}) THEN 500 ELSE 0 END`
        : sql`0`;

    const rows = await db.execute<{ id: string }>(sql`
      WITH latest_attempt AS (
        SELECT DISTINCT ON (a.question_id)
          a.question_id,
          a.acertou,
          a.created_at
        FROM attempts a
        WHERE a.user_id = ${userId}::uuid
        ORDER BY a.question_id, a.created_at DESC
      )
      SELECT q.id
      FROM questions q
      INNER JOIN topics t ON t.id = q.topic_id
      LEFT JOIN srs_cards sc
        ON sc.question_id = q.id AND sc.user_id = ${userId}::uuid
      LEFT JOIN latest_attempt la ON la.question_id = q.id
      WHERE 1 = 1
      ${filtroDisciplinaSql}
      ${filtroTopicoSql}
      ${filtroPegadinhaSql}
      ${filtroErrosSql}
      ${filtroExcluirSql}
      ORDER BY (
        CASE WHEN sc.next_review IS NOT NULL AND sc.next_review <= NOW() THEN 1000 ELSE 0 END
        + ${prioridadeDisciplinaSql}
        + CASE WHEN la.question_id IS NULL THEN 150 ELSE 0 END
        + CASE WHEN la.acertou = false THEN 200 ELSE 0 END
        + CASE WHEN COALESCE(sc.stability, 0) >= 21 THEN -200 ELSE 0 END
        + CASE WHEN la.created_at > NOW() - INTERVAL '24 hours' THEN -100 ELSE 0 END
        + CASE t.disciplina
            WHEN 'portugues' THEN ${pesoPort}
            WHEN 'informatica' THEN ${pesoInf}
            WHEN 'historia_cg_pb' THEN ${pesoHist}
            WHEN 'legislacao_etica_sp' THEN ${pesoLeg}
            WHEN 'direito_administrativo' THEN ${pesoAdm}
            WHEN 'direito_constitucional' THEN ${pesoConst}
            WHEN 'legislacao_transito' THEN ${pesoTrans}
            ELSE 0
          END
      ) DESC,
      random()
      LIMIT ${limit}
    `);

    return rows.map((r) => r.id);
  } catch {
    return [];
  }
}

export async function contarPraticaPontuada(
  userId: string,
  limit: number,
  filtros: FiltrosMotor,
  excluirIds: string[] = [],
): Promise<number> {
  const ids = await buscarIdsPraticaPontuados(
    userId,
    limit,
    filtros,
    excluirIds,
  );
  return ids.length;
}
