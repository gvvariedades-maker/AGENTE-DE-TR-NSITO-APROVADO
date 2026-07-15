"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { mensagemErroAuth } from "@/lib/auth-messages";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginFormProps {
  next?: string;
  authError?: boolean;
  resetOk?: boolean;
}

function sanitizeNextPath(raw?: string): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard";
  }
  return raw;
}

export function LoginForm({ next, authError, resetOk }: LoginFormProps) {
  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const destino = sanitizeNextPath(next);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setErro("Informe e-mail e senha.");
      setPending(false);
      return;
    }

    try {
      const supabase = createClient();
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("timeout")), 15000);
      });

      const { error } = await Promise.race([signInPromise, timeoutPromise]);

      if (error) {
        setErro(mensagemErroAuth(error.message, "login"));
        setPending(false);
        return;
      }

      // Hard navigation: evita ficar em "Entrando…" se o painel estiver lento.
      window.location.assign(destino);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErro(
        message === "timeout"
          ? "Login demorou demais. Verifique a conexão e tente novamente."
          : "Não foi possível entrar. Tente novamente.",
      );
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>
          Entre com o e-mail e a senha da sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {resetOk && (
          <Alert>
            <AlertDescription>
              Senha redefinida com sucesso. Entre com a nova senha.
            </AlertDescription>
          </Alert>
        )}

        {authError && (
          <Alert variant="destructive">
            <AlertDescription>
              Não foi possível concluir o login. Tente novamente.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">E-mail</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              disabled={pending}
              placeholder="seu@email.com"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">Senha</span>
              <Link
                href="/esqueci-senha"
                className="text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              disabled={pending}
              placeholder="••••••••"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            />
          </label>

          {erro && (
            <p className="text-sm text-destructive" role="alert">
              {erro}
            </p>
          )}

          <Button type="submit" disabled={pending}>
            {pending ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link
            href={
              next
                ? `/cadastro?next=${encodeURIComponent(next)}`
                : "/cadastro"
            }
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Cadastre-se
          </Link>
        </p>

        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }))}>
          Voltar ao início
        </Link>
      </CardContent>
    </Card>
  );
}
