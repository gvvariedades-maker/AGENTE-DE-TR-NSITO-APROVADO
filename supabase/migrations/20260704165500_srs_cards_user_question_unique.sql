-- Migration: srs_cards_user_question_unique (aplicada via MCP Supabase)
-- Garante um card SRS por usuário/questão para upsert seguro.

CREATE UNIQUE INDEX IF NOT EXISTS srs_cards_user_question_unique
  ON public.srs_cards (user_id, question_id);
