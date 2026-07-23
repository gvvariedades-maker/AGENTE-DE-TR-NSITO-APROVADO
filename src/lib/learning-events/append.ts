import { db } from "@/lib/db";
import { learningEvents } from "@/lib/db/schema";

export type LearningEventType =
  | "question_answered"
  | "confidence_recorded";

export type AppendLearningEventInput = {
  userId: string;
  eventType: LearningEventType;
  questionId?: string | null;
  sessionId?: string | null;
  payload?: Record<string, unknown>;
  /** Cliente de transação Drizzle (opcional). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx?: any;
};

export async function appendLearningEvent(
  input: AppendLearningEventInput,
): Promise<{ id: string }> {
  const client = input.tx ?? db;
  const [row] = await client
    .insert(learningEvents)
    .values({
      userId: input.userId,
      eventType: input.eventType,
      questionId: input.questionId ?? null,
      sessionId: input.sessionId ?? null,
      payloadJson: input.payload ?? {},
    })
    .returning({ id: learningEvents.id });

  return { id: row.id };
}
