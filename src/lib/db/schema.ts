import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const disciplinaEnum = pgEnum("disciplina", [
  "portugues",
  "informatica",
  "historia_cg_pb",
  "legislacao_etica_sp",
  "direito_administrativo",
  "direito_constitucional",
  "legislacao_transito",
]);

export const topics = pgTable("topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  disciplina: disciplinaEnum("disciplina").notNull(),
  nome: text("nome").notNull(),
  editalRef: text("edital_ref"),
  parentId: uuid("parent_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  topicId: uuid("topic_id")
    .references(() => topics.id, { onDelete: "cascade" })
    .notNull(),
  enunciado: text("enunciado").notNull(),
  altA: text("alt_a").notNull(),
  altB: text("alt_b").notNull(),
  altC: text("alt_c").notNull(),
  altD: text("alt_d").notNull(),
  altE: text("alt_e"),
  gabarito: text("gabarito").notNull(),
  tipo: text("tipo").notNull().default("multipla_escolha"),
  estiloIdecan: text("estilo_idecan"),
  dificuldade: integer("dificuldade").notNull().default(3),
  comentarioJson: jsonb("comentario_json").notNull().default({}),
  estudoReversoVisualJson: jsonb("estudo_reverso_visual_json"),
  estudoReversoVisualCompletoJson: jsonb("estudo_reverso_visual_completo_json"),
  /** PedagogyConfig — percursos adaptativos (Fase 4); null = aula completa. */
  pedagogyJson: jsonb("pedagogy_json"),
  /**
   * Pool de avaliação (Fase 5).
   * learning | transfer | holdout | simulation — holdout fora de estudo comum.
   */
  assessmentPool: text("assessment_pool").notNull().default("learning"),
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Relações near/far entre questões (Fase 5).
 * Meta textual near_transfer/far_transfer permanece no JSON da aula.
 */
export const questionRelations = pgTable(
  "question_relations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceQuestionId: uuid("source_question_id")
      .references(() => questions.id, { onDelete: "cascade" })
      .notNull(),
    targetQuestionId: uuid("target_question_id")
      .references(() => questions.id, { onDelete: "cascade" })
      .notNull(),
    /** near | far | variant | prerequisite */
    relationType: text("relation_type").notNull(),
    /** 1 = near típico; ≥2 = far */
    distance: smallint("distance").notNull().default(1),
    invariantsJson: jsonb("invariants_json").notNull().default({}),
    changedElementsJson: jsonb("changed_elements_json").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
);

export const attempts = pgTable("attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  questionId: uuid("question_id")
    .references(() => questions.id, { onDelete: "cascade" })
    .notNull(),
  sessionId: uuid("session_id"),
  resposta: text("resposta").notNull(),
  acertou: boolean("acertou").notNull(),
  tempoSeg: integer("tempo_seg"),
  modo: text("modo").notNull().default("estudo"),
  tipoErro: text("tipo_erro"),
  /** Confiança subjetiva 0–3 (Fase 1 UI: 1|3). */
  confidence: smallint("confidence"),
  /** Nota FSRS 1–4 persistida (erro sempre 1). */
  fsrsRating: smallint("fsrs_rating"),
  /** Exposições prévias desta questão para o usuário. */
  exposureCount: integer("exposure_count").notNull().default(0),
  hintUsed: boolean("hint_used").notNull().default(false),
  answerChanged: boolean("answer_changed").notNull().default(false),
  feedbackSeenBeforeAnswer: boolean("feedback_seen_before_answer")
    .notNull()
    .default(false),
  diagnosticsJson: jsonb("diagnostics_json"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Habilidades de domínio (microtópico edital + clusters finos).
 * Fase 2 — Motor de Evidências.
 */
export const skills = pgTable("skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  topicId: uuid("topic_id").references(() => topics.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  /** microtopico | cluster | device */
  kind: text("kind").notNull().default("microtopico"),
  editalWeight: real("edital_weight").notNull().default(1),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Cobertura questão ↔ skill (primary = tópico; secondary via eixos). */
export const questionSkills = pgTable(
  "question_skills",
  {
    questionId: uuid("question_id")
      .references(() => questions.id, { onDelete: "cascade" })
      .notNull(),
    skillId: uuid("skill_id")
      .references(() => skills.id, { onDelete: "cascade" })
      .notNull(),
    /** primary | secondary | distractor */
    role: text("role").notNull().default("primary"),
    weight: real("weight").notNull().default(1),
    /** T0 | T1 | T2 | T3 — default T1 até curadoria */
    transferLevel: text("transfer_level").notNull().default("T1"),
  },
  (t) => [primaryKey({ columns: [t.questionId, t.skillId] })],
);

/** Crenças erradas curadas (skill_id Fase 2). */
export const misconceptions = pgTable("misconceptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  mistakenBelief: text("mistaken_belief").notNull(),
  correctRule: text("correct_rule").notNull(),
  skillCode: text("skill_code"),
  skillId: uuid("skill_id").references(() => skills.id, {
    onDelete: "set null",
  }),
  repairStrategyJson: jsonb("repair_strategy_json").notNull().default({}),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Diagnóstico por alternativa (distrator IDECAN / misconception). */
export const alternativeDiagnostics = pgTable(
  "alternative_diagnostics",
  {
    questionId: uuid("question_id")
      .references(() => questions.id, { onDelete: "cascade" })
      .notNull(),
    alternative: text("alternative").notNull(),
    misconceptionId: uuid("misconception_id").references(
      () => misconceptions.id,
      { onDelete: "set null" },
    ),
    errorType: text("error_type"),
    mechanismSlug: text("mechanism_slug"),
    feedbackJson: jsonb("feedback_json").notNull().default({}),
  },
  (t) => [primaryKey({ columns: [t.questionId, t.alternative] })],
);

/** Append-only: question_answered, confidence_recorded (Fase 1). */
export const learningEvents = pgTable("learning_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  eventType: text("event_type").notNull(),
  questionId: uuid("question_id").references(() => questions.id, {
    onDelete: "set null",
  }),
  sessionId: uuid("session_id"),
  payloadJson: jsonb("payload_json").notNull().default({}),
  occurredAt: timestamp("occurred_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Mastery enxuto por skill (Fase 3).
 * Domínio = min(recall, transfer) × calibração.
 */
export const userSkillMastery = pgTable(
  "user_skill_mastery",
  {
    userId: uuid("user_id").notNull(),
    skillId: uuid("skill_id")
      .references(() => skills.id, { onDelete: "cascade" })
      .notNull(),
    recallScore: real("recall_score").notNull().default(0),
    transferScore: real("transfer_score").notNull().default(0),
    /** Neutro inicial 0.5 — high-conf error reduz. */
    calibrationScore: real("calibration_score").notNull().default(0.5),
    masteryProbability: real("mastery_probability").notNull().default(0),
    /** unseen | learning | consolidating | mastered | at_risk */
    state: text("state").notNull().default("unseen"),
    novelCorrectCount: integer("novel_correct_count").notNull().default(0),
    delayedCorrectCount: integer("delayed_correct_count").notNull().default(0),
    highConfidenceErrorCount: integer("high_confidence_error_count")
      .notNull()
      .default(0),
    lastEvidenceAt: timestamp("last_evidence_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.skillId] })],
);

export const simulados = pgTable("simulados", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  tipo: text("tipo").notNull().default("simulado_espelho"),
  notaTotal: integer("nota_total").notNull(),
  notasDisciplinaJson: jsonb("notas_disciplina_json").notNull().default({}),
  zerouDisciplina: boolean("zerou_disciplina").notNull().default(false),
  duracaoMin: integer("duracao_min"),
  /** Questões deste caderno — anti-repetição entre simulados. */
  questionIds: uuid("question_ids").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Estado FSRS-4.5 do card. Ver src/lib/srs.ts para o algoritmo. */
export const srsCards = pgTable("srs_cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  questionId: uuid("question_id")
    .references(() => questions.id, { onDelete: "cascade" })
    .notNull(),
  nextReview: timestamp("next_review", { withTimezone: true }).notNull(),
  intervalDays: integer("interval_days").notNull().default(1),
  /** FSRS: dificuldade do item, escala 1-10 (default = w4). */
  difficulty: real("difficulty").notNull().default(5.1618),
  /** FSRS: estabilidade da memória em dias (R=90% quando t=stability). */
  stability: real("stability").notNull().default(0),
  reps: integer("reps").notNull().default(0),
  lapses: integer("lapses").notNull().default(0),
  state: text("state").notNull().default("new"),
  lastReview: timestamp("last_review", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const studySessions = pgTable("study_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  modo: text("modo").notNull().default("normal"),
  disciplina: disciplinaEnum("disciplina"),
  topicoSlug: text("topico_slug"),
  plannedCount: integer("planned_count").notNull().default(0),
  answeredCount: integer("answered_count").notNull().default(0),
  acertos: integer("acertos").notNull().default(0),
  erros: integer("erros").notNull().default(0),
  /** Sessão gerada pelo CTA da missão do dia (fila da IA). */
  missaoHoje: boolean("missao_hoje").notNull().default(false),
  /** IDs escolhidos pela IA — progresso da missão só conta estes. */
  plannedQuestionIds: uuid("planned_question_ids").array().notNull().default([]),
  startedAt: timestamp("started_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  completed: boolean("completed").notNull().default(false),
});

export const estudoReversoSessions = pgTable("estudo_reverso_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  questionId: uuid("question_id")
    .references(() => questions.id, { onDelete: "cascade" })
    .notNull(),
  attemptId: uuid("attempt_id").references(() => attempts.id, {
    onDelete: "set null",
  }),
  telasVistas: jsonb("telas_vistas").notNull().default([]),
  recallAcertou: boolean("recall_acertou"),
  tempoTotalSeg: integer("tempo_total_seg"),
  concluido: boolean("concluido").notNull().default(false),
  iniciadoEm: timestamp("iniciado_em", { withTimezone: true })
    .defaultNow()
    .notNull(),
  concluidoEm: timestamp("concluido_em", { withTimezone: true }),
});

/** Parâmetros calibrados do Planejador Tutor (Camada 3). */
export const userTutorCalib = pgTable("user_tutor_calib", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique(),
  capacidadeQuestoes: integer("capacidade_questoes").notNull().default(20),
  biasRevisao: real("bias_revisao").notNull().default(0),
  boostDisciplinasJson: jsonb("boost_disciplinas_json")
    .notNull()
    .default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
