import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { questions, topics } from "@/lib/db/schema";
import type { ComentarioQuestao, Disciplina } from "@/types";
import type { EstudoReversoVisual } from "@/types/estudo-reverso-visual";
import { DEMO_ESTUDO_REVERSO_VISUAL } from "@/lib/demo-estudo-reverso-visual";
import { resolveEstudoReversoVisual } from "@/lib/estudo-reverso-visual-fallback";

export interface QuestaoUI {
  id: string;
  disciplina: Disciplina;
  enunciado: string;
  alternativas: Record<string, string>;
  gabarito: string;
  comentario: ComentarioQuestao | null;
  estudoReversoVisual: EstudoReversoVisual | null;
}

const QUESTAO_DEMO: QuestaoUI = {
  id: "demo",
  disciplina: "legislacao_transito",
  enunciado:
    "Durante fiscalização de trânsito em Campina Grande, agente da STTP constata que o condutor apresenta sinais evidentes de alteração da capacidade psicomotora. O condutor recusa-se a submeter-se ao teste do etilômetro. Considerando o CTB, assinale a alternativa CORRETA:",
  alternativas: {
    A: "A recusa impede a autuação, pois o teste depende de consentimento livre do condutor.",
    B: "O agente deve aguardar perito criminal antes de lavrar qualquer auto de infração.",
    C: "A recusa em se submeter ao teste constitui infração autônoma prevista no CTB.",
    D: "A infração somente se configura se o etilômetro confirmar concentração acima do limite legal.",
  },
  gabarito: "C",
  comentario: {
    o_que_testa:
      "Conhecimento sobre embriaguez ao volante e consequência jurídica da recusa ao etilômetro.",
    fundamento_legal:
      "CTB, art. 165-A: recusar-se a ser submetido a teste, exame clínico, perícia ou outro procedimento que permita certificar influência de álcool ou outra substância psicoativa, na forma do art. 277, configura infração autônoma de trânsito.",
    passo_a_passo: [
      "O enunciado descreve sinais de alteração psicomotora + recusa ao etilômetro.",
      "A) Erra: a recusa não impede autuação — é infração autônoma (art. 165-A).",
      "B) Erra: não é necessário aguardar perito para autuação administrativa.",
      "C) Correta: a recusa configura infração autônoma prevista no art. 165-A do CTB.",
      "D) Erra: confunde necessidade de confirmação etílica com a recusa em si.",
    ],
    pegadinha:
      "IDECAN troca recusa por necessidade de confirmação etílica — candidato acha que sem teste positivo não há infração.",
    macete:
      "Recusou o bafômetro = infração autônoma (art. 165-A). Não precisa estar bêbado no teste.",
    estudo_reverso: ["CTB art. 165", "CTB art. 165-A", "CTB art. 277"],
  },
  estudoReversoVisual: DEMO_ESTUDO_REVERSO_VISUAL,
};

function mapRowToQuestao(row: {
  id: string;
  enunciado: string;
  altA: string;
  altB: string;
  altC: string;
  altD: string;
  altE: string | null;
  gabarito: string;
  comentarioJson: unknown;
  estudoReversoVisualJson: unknown;
  disciplina: Disciplina;
}): QuestaoUI {
  const alternativas: Record<string, string> = {
    A: row.altA,
    B: row.altB,
    C: row.altC,
    D: row.altD,
  };
  if (row.altE) alternativas.E = row.altE;

  return {
    id: row.id,
    disciplina: row.disciplina,
    enunciado: row.enunciado,
    alternativas,
    gabarito: row.gabarito,
    comentario: (row.comentarioJson as ComentarioQuestao) ?? null,
    estudoReversoVisual: resolveEstudoReversoVisual(
      row.estudoReversoVisualJson,
      (row.comentarioJson as ComentarioQuestao) ?? null,
    ),
  };
}

export async function getQuestaoById(id: string): Promise<QuestaoUI | null> {
  try {
    const [row] = await db
      .select({
        id: questions.id,
        enunciado: questions.enunciado,
        altA: questions.altA,
        altB: questions.altB,
        altC: questions.altC,
        altD: questions.altD,
        altE: questions.altE,
        gabarito: questions.gabarito,
        comentarioJson: questions.comentarioJson,
        estudoReversoVisualJson: questions.estudoReversoVisualJson,
        disciplina: topics.disciplina,
      })
      .from(questions)
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .where(eq(questions.id, id))
      .limit(1);

    return row ? mapRowToQuestao(row) : null;
  } catch {
    return null;
  }
}

export async function getQuestoesLista(
  limit = 60,
  disciplina?: Disciplina,
): Promise<QuestaoUI[]> {
  try {
    const conditions = disciplina
      ? eq(topics.disciplina, disciplina)
      : undefined;

    const query = db
      .select({
        id: questions.id,
        enunciado: questions.enunciado,
        altA: questions.altA,
        altB: questions.altB,
        altC: questions.altC,
        altD: questions.altD,
        altE: questions.altE,
        gabarito: questions.gabarito,
        comentarioJson: questions.comentarioJson,
        estudoReversoVisualJson: questions.estudoReversoVisualJson,
        disciplina: topics.disciplina,
      })
      .from(questions)
      .innerJoin(topics, eq(questions.topicId, topics.id));

    const rows = await (conditions
      ? query.where(conditions).limit(limit)
      : query.limit(limit));

    return rows.map(mapRowToQuestao);
  } catch {
    return [];
  }
}

export async function getQuestoesCount(): Promise<number> {
  try {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(questions);
    return result?.count ?? 0;
  } catch {
    return 0;
  }
}

export async function getPrimeiraQuestao(): Promise<{
  questao: QuestaoUI;
  isDemo: boolean;
}> {
  const lista = await getQuestoesLista(1);
  if (lista.length > 0) {
    return { questao: lista[0], isDemo: false };
  }
  return { questao: QUESTAO_DEMO, isDemo: true };
}

export { QUESTAO_DEMO };
