-- IDs das questões de cada simulado entregue (caderno inédito entre tentativas)
ALTER TABLE simulados
  ADD COLUMN IF NOT EXISTS question_ids uuid[] NOT NULL DEFAULT '{}'::uuid[];
