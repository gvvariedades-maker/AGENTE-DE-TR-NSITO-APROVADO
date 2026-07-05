-- Estudo reverso visual + sessões de estudo

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS estudo_reverso_visual_json jsonb;

ALTER TABLE attempts
  ADD COLUMN IF NOT EXISTS session_id uuid,
  ADD COLUMN IF NOT EXISTS tipo_erro text;

CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  modo text NOT NULL DEFAULT 'normal',
  disciplina disciplina,
  topico_slug text,
  planned_count integer NOT NULL DEFAULT 0,
  answered_count integer NOT NULL DEFAULT 0,
  acertos integer NOT NULL DEFAULT 0,
  erros integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  completed boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS estudo_reverso_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  attempt_id uuid REFERENCES attempts(id) ON DELETE SET NULL,
  telas_vistas jsonb NOT NULL DEFAULT '[]',
  recall_acertou boolean,
  tempo_total_seg integer,
  concluido boolean NOT NULL DEFAULT false,
  iniciado_em timestamptz NOT NULL DEFAULT now(),
  concluido_em timestamptz
);

CREATE INDEX IF NOT EXISTS idx_estudo_reverso_sessions_user
  ON estudo_reverso_sessions(user_id, iniciado_em DESC);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user
  ON study_sessions(user_id, started_at DESC);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudo_reverso_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "study_sessions_select_own" ON study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "study_sessions_insert_own" ON study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "study_sessions_update_own" ON study_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "estudo_reverso_select_own" ON estudo_reverso_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "estudo_reverso_insert_own" ON estudo_reverso_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "estudo_reverso_update_own" ON estudo_reverso_sessions
  FOR UPDATE USING (auth.uid() = user_id);
