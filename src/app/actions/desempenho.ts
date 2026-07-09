"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resetDesempenhoUsuario } from "@/lib/desempenho-reset";
import { createClient } from "@/lib/supabase/server";

export type ResetDesempenhoState = {
  error?: string;
};

const CONFIRMACAO = "ZERAR";

export async function resetDesempenho(
  _prevState: ResetDesempenhoState,
  formData: FormData,
): Promise<ResetDesempenhoState> {
  const confirmacao = String(formData.get("confirmacao") ?? "").trim();

  if (confirmacao !== CONFIRMACAO) {
    return { error: `Digite ${CONFIRMACAO} para confirmar.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Faça login para continuar." };
  }

  try {
    await resetDesempenhoUsuario(user.id);
  } catch {
    return { error: "Não foi possível zerar o histórico. Tente novamente." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/desempenho");
  revalidatePath("/estudo");
  revalidatePath("/simulado");

  redirect("/desempenho?reset=ok");
}
