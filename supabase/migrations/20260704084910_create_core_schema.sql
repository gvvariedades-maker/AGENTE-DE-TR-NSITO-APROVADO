-- Migration: create_core_schema (aplicada via MCP Supabase)

CREATE TYPE disciplina AS ENUM (
  'portugues',
  'informatica',
  'historia_cg_pb',
  'legislacao_etica_sp',
  'direito_administrativo',
  'direito_constitucional',
  'legislacao_transito'
);

CREATE TABLE topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disciplina disciplina NOT NULL,
  nome text NOT NULL,
  edital_ref text,
  parent_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  enunciado text NOT NULL,
  alt_a text NOT NULL,
  alt_b text NOT NULL,
  alt_c text NOT NULL,
  alt_d text NOT NULL,
  alt_e text,
  gabarito text NOT NULL,
  tipo text NOT NULL DEFAULT 'multipla_escolha',
  estilo_idecan text,
  dificuldade integer NOT NULL DEFAULT 3,
  comentario_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  resposta text NOT NULL,
  acertou boolean NOT NULL,
  tempo_seg integer,
  modo text NOT NULL DEFAULT 'estudo',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE simulados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tipo text NOT NULL DEFAULT 'simulado_espelho',
  nota_total integer NOT NULL,
  notas_disciplina_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  zerou_disciplina boolean NOT NULL DEFAULT false,
  duracao_min integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE srs_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  next_review timestamptz NOT NULL,
  interval_days integer NOT NULL DEFAULT 1,
  ease_factor integer NOT NULL DEFAULT 250,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_topic_id ON questions(topic_id);
CREATE INDEX idx_attempts_user_id_created_at ON attempts(user_id, created_at);
CREATE INDEX idx_srs_cards_user_id_next_review ON srs_cards(user_id, next_review);
