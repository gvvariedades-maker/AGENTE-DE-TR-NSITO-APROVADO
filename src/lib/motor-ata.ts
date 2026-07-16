import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { MIN_PONTOS_TOTAL } from "@/lib/edital-constants";
import { calcularFase, type FaseProva } from "@/lib/plano-prova-calc";
import { diasParaProva } from "@/lib/prova-data";
import { sqlSomenteQuestoesReais } from "@/lib/questoes-reais";
import { getSemaforoData } from "@/lib/semaforo";
import type { ModoSessaoEstudo } from "@/lib/motor-ata-shared";
import { SIMULADO_ESPELHO_DISTRIBUICAO, type Disciplina } from "@/types";

export type { ModoSessaoEstudo } from "@/lib/motor-ata-shared";
export { parseModoSessao, labelModoSessao } from "@/lib/motor-ata-shared";

/** Pesos versionados por fase — Motor ATA ROI (Camada 4). */
export const PESOS_FASE: Record<
  FaseProva,
  {
    srs: number;
    semTentativa: number;
    erro: number;
    penalidadeMaduro: number;
    boostDisciplinaMissao: number;
    boostTopicoAprendendo: number;
  }
> = {
  exploracao: {
    srs: 1000,
    semTentativa: 300,
    erro: 200,
    penalidadeMaduro: -300,
    boostDisciplinaMissao: 400,
    boostTopicoAprendendo: 250,
  },
  consolidacao: {
    srs: 1000,
    semTentativa: 150,
    erro: 200,
    penalidadeMaduro: -200,
    boostDisciplinaMissao: 450,
    boostTopicoAprendendo: 300,
  },
  aperto: {
    srs: 1200,
    semTentativa: 50,
    erro: 350,
    penalidadeMaduro: -50,
    boostDisciplinaMissao: 500,
    boostTopicoAprendendo: 350,
  },
  semana_final: {
    srs: 1500,
    semTentativa: 50,
    erro: 350,
    penalidadeMaduro: 0,
    boostDisciplinaMissao: 550,
    boostTopicoAprendendo: 400,
  },
};

export interface FiltrosMotor {
  disciplina?: Disciplina;
  topicoSlug?: string;
  disciplinasPrioritarias?: Disciplina[];
  /** Se true, restringe a fila só às disciplinas prioritárias. */
  filtrarSomentePrioritarias?: boolean;
  somentePegadinha?: boolean;
  somenteErros?: boolean;
  somenteReaisIdecan?: boolean;
  fase?: FaseProva;
  /** Disciplina foco da missão do dia (handshake missão→fila). */
  disciplinaMissao?: Disciplina;
  boostDisciplinas?: Partial<Record<Disciplina, number>>;
  /** Slugs em aprendendo/formando — prioridade no ranking. */
  topicosPrioritarios?: string[];
}

async function resolverContextoAuto(
  userId: string,
): Promise<
  Pick<
    FiltrosMotor,
    "disciplinasPrioritarias" | "filtrarSomentePrioritarias" | "fase"
  >
> {
  const semaforo = await getSemaforoData(userId);
  const fase = calcularFase(diasParaProva());
  const espelhoFraco =
    semaforo.espelho.media !== null &&
    semaforo.espelho.media < MIN_PONTOS_TOTAL;

  if (semaforo.disciplinasEmRisco.length > 0) {
    const filtrarSomentePrioritarias =
      (fase === "aperto" || fase === "semana_final") &&
      (espelhoFraco || semaforo.disciplinasEmRisco.length > 0);

    return {
      disciplinasPrioritarias: semaforo.disciplinasEmRisco.map(
        (r) => r.disciplina,
      ),
      filtrarSomentePrioritarias,
      fase,
    };
  }
  return { fase };
}

/** Traduz modo de URL + semáforo em filtros concretos para o motor. */
export async function resolverFiltrosMotor(
  modo: ModoSessaoEstudo,
  userId: string | undefined,
  disciplina?: Disciplina,
  topicoSlug?: string,
  extras?: Pick<
    FiltrosMotor,
    | "disciplinaMissao"
    | "boostDisciplinas"
    | "topicosPrioritarios"
    | "disciplinasPrioritarias"
    | "filtrarSomentePrioritarias"
  >,
): Promise<FiltrosMotor> {
  const base: FiltrosMotor = {
    disciplina,
    topicoSlug,
    ...extras,
  };

  if (modo === "erros") {
    return { ...base, somenteErros: true };
  }

  if (modo === "pegadinha") {
    return { ...base, somentePegadinha: true };
  }

  if (modo === "reais_idecan") {
    return { ...base, somenteReaisIdecan: true };
  }

  if (!userId) return { ...base, fase: calcularFase(diasParaProva()) };

  if (disciplina || topicoSlug) {
    return { ...base, fase: calcularFase(diasParaProva()) };
  }

  if (modo === "auto") {
    const ctx = await resolverContextoAuto(userId);
    return {
      ...base,
      disciplinasPrioritarias: ctx.disciplinasPrioritarias,
      filtrarSomentePrioritarias: ctx.filtrarSomentePrioritarias,
      fase: ctx.fase ?? calcularFase(diasParaProva()),
    };
  }

  return { ...base, fase: calcularFase(diasParaProva()) };
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

    const filtroReaisSql = filtros.somenteReaisIdecan
      ? sql`AND ${sqlSomenteQuestoesReais("q.tags")}`
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

    const fase = filtros.fase ?? "consolidacao";
    const pesos = PESOS_FASE[fase];
    const pesoSrs = pesos.srs;
    const pesoSemTentativa = pesos.semTentativa;
    const pesoErro = pesos.erro;
    const penalidadeMaduro = pesos.penalidadeMaduro;
    const boostMissao = pesos.boostDisciplinaMissao;
    const boostTopico = pesos.boostTopicoAprendendo;

    const disciplinaMissao = filtros.disciplinaMissao;
    const boostDisciplinaMissaoSql = disciplinaMissao
      ? sql`CASE WHEN t.disciplina = ${disciplinaMissao} THEN ${boostMissao} ELSE 0 END`
      : sql`0`;

    const topicosPrioritarios = filtros.topicosPrioritarios ?? [];
    const boostTopicoSql =
      topicosPrioritarios.length > 0
        ? sql`CASE WHEN t.nome IN (${sql.join(
            topicosPrioritarios.map((s) => sql`${s}`),
            sql`, `,
          )}) THEN ${boostTopico} ELSE 0 END`
        : sql`0`;

    const boostDisciplinas = filtros.boostDisciplinas ?? {};
    const disciplinasBoost = Object.entries(boostDisciplinas).filter(
      ([, v]) => (v ?? 1) > 1,
    );
    const boostCalibSql =
      disciplinasBoost.length > 0
        ? sql`${sql.join(
            disciplinasBoost.map(
              ([d, mult]) =>
                sql`CASE WHEN t.disciplina = ${d} THEN ${Math.round(((mult ?? 1) - 1) * 200)} ELSE 0 END`,
            ),
            sql` + `,
          )}`
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
      ${filtroReaisSql}
      ${filtroExcluirSql}
      ORDER BY (
        CASE WHEN sc.next_review IS NOT NULL AND sc.next_review <= NOW() THEN ${pesoSrs} ELSE 0 END
        + ${prioridadeDisciplinaSql}
        + CASE WHEN la.question_id IS NULL THEN ${pesoSemTentativa} ELSE 0 END
        + CASE WHEN la.acertou = false THEN ${pesoErro} ELSE 0 END
        + CASE WHEN COALESCE(sc.stability, 0) >= 21 THEN ${penalidadeMaduro} ELSE 0 END
        + CASE WHEN la.created_at > NOW() - INTERVAL '24 hours' THEN -100 ELSE 0 END
        + ${boostDisciplinaMissaoSql}
        + ${boostTopicoSql}
        + ${boostCalibSql}
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
