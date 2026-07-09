"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignInState = {
  error?: string;
};

export type SignUpState = {
  error?: string;
  success?: boolean;
  email?: string;
};

const MIN_SENHA = 6;

function sanitizeNextPath(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard";
  }
  return raw;
}

async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function mensagemErroAuth(message: string, contexto: "login" | "cadastro"): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar.";
  }
  if (lower.includes("user already registered")) {
    return "Este e-mail já está cadastrado.";
  }
  if (lower.includes("password") && lower.includes("weak")) {
    return "Senha fraca. Use pelo menos 6 caracteres.";
  }
  if (lower.includes("too many requests")) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }
  return contexto === "login"
    ? "Não foi possível entrar. Verifique e-mail e senha."
    : "Não foi possível criar a conta. Tente novamente.";
}

export async function signInWithPassword(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = sanitizeNextPath(String(formData.get("next") ?? ""));

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: mensagemErroAuth(error.message, "login") };
  }

  redirect(next);
}

export async function signUpWithPassword(
  _prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("password_confirm") ?? "");
  const next = sanitizeNextPath(String(formData.get("next") ?? ""));

  if (!email || !password || !passwordConfirm) {
    return { error: "Preencha todos os campos." };
  }

  if (password.length < MIN_SENHA) {
    return { error: `A senha deve ter pelo menos ${MIN_SENHA} caracteres.` };
  }

  if (password !== passwordConfirm) {
    return { error: "As senhas não coincidem." };
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const emailRedirectTo = new URL("/auth/callback", origin);
  emailRedirectTo.searchParams.set("next", next);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: emailRedirectTo.toString() },
  });

  if (error) {
    return { error: mensagemErroAuth(error.message, "cadastro") };
  }

  if (data.session) {
    redirect(next);
  }

  return {
    success: true,
    email,
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
