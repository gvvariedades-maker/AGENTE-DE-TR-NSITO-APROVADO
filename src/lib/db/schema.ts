import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
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
  resposta: text("resposta").notNull(),
  acertou: boolean("acertou").notNull(),
  tempoSeg: integer("tempo_seg"),
  modo: text("modo").notNull().default("estudo"),
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

export const srsCards = pgTable("srs_cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  questionId: uuid("question_id")
    .references(() => questions.id, { onDelete: "cascade" })
    .notNull(),
  nextReview: timestamp("next_review", { withTimezone: true }).notNull(),
  intervalDays: integer("interval_days").notNull().default(1),
  easeFactor: integer("ease_factor").notNull().default(250),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
