-- Planejador Tutor: parâmetros calibrados por usuário
CREATE TABLE IF NOT EXISTS user_tutor_calib (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  capacidade_questoes integer NOT NULL DEFAULT 20,
  bias_revisao real NOT NULL DEFAULT 0,
  boost_disciplinas_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_tutor_calib ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_tutor_calib_select_own"
  ON user_tutor_calib FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_tutor_calib_insert_own"
  ON user_tutor_calib FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_tutor_calib_update_own"
  ON user_tutor_calib FOR UPDATE
  USING (auth.uid() = user_id);
