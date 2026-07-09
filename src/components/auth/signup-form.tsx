"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpWithPassword, type SignUpState } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SignupFormProps {
  next?: string;
}

const initialState: SignUpState = {};

const inputClassName =
  "h-10 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60";

export function SignupForm({ next }: SignupFormProps) {
  const [state, formAction, pending] = useActionState(
    signUpWithPassword,
    initialState,
  );

  if (state.success && state.email) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Confirme seu e-mail</CardTitle>
          <CardDescription>
            Enviamos um link de confirmação para{" "}
            <strong className="text-foreground">{state.email}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Abra o e-mail e clique no link para ativar a conta. Depois volte aqui
            e faça login.
          </p>
          <Link href="/login" className={cn(buttonVariants())}>
            Ir para o login
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          Cadastre-se com e-mail e senha para acessar a plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form action={formAction} className="flex flex-col gap-3">
          {next?.startsWith("/") && !next.startsWith("//") && (
            <input type="hidden" name="next" value={next} />
          )}

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">E-mail</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              disabled={pending}
              placeholder="seu@email.com"
              className={inputClassName}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Senha</span>
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              required
              minLength={6}
              disabled={pending}
              placeholder="Mínimo 6 caracteres"
              className={inputClassName}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Confirmar senha</span>
            <input
              type="password"
              name="password_confirm"
              autoComplete="new-password"
              required
              minLength={6}
              disabled={pending}
              placeholder="Repita a senha"
              className={inputClassName}
            />
          </label>

          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={pending}>
            {pending ? "Criando conta…" : "Criar conta"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </p>

        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }))}>
          Voltar ao início
        </Link>
      </CardContent>
    </Card>
  );
}
