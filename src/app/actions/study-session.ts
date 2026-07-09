"use server";

import { createClient } from "@/lib/supabase/server";
import { finalizarSessaoEstudo } from "@/lib/study-sessions";

export async function concluirSessaoEstudo(
  sessionId: string,
): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false };

  try {
    await finalizarSessaoEstudo(sessionId);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
