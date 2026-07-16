-- Missão do dia: fila fixa escolhida pela IA + progresso só dessas questões
ALTER TABLE study_sessions
  ADD COLUMN IF NOT EXISTS missao_hoje boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS planned_question_ids uuid[] NOT NULL DEFAULT '{}'::uuid[];

CREATE INDEX IF NOT EXISTS study_sessions_missao_hoje_started_idx
  ON study_sessions (user_id, started_at DESC)
  WHERE missao_hoje = true;
