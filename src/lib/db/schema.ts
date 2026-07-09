import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
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
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

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
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const simulados = pgTable("simulados", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  tipo: text("tipo").notNull().default("simulado_espelho"),
  notaTotal: integer("nota_total").notNull(),
  notasDisciplinaJson: jsonb("notas_disciplina_json").notNull().default({}),
  zerouDisciplina: boolean("zerou_disciplina").notNull().default(false),
  duracaoMin: integer("duracao_min"),
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
