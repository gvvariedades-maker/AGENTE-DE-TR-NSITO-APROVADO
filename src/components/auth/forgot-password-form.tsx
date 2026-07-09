"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  requestPasswordReset,
  type ForgotPasswordState,
} from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const initialState: ForgotPasswordState = {};

const inputClassName =
  "h-10 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  if (state.success && state.email) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verifique seu e-mail</CardTitle>
          <CardDescription>
            Se existir uma conta com{" "}
            <strong className="text-foreground">{state.email}</strong>, enviamos
            um link para redefinir a senha.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            O link expira em breve. Abra o e-mail e clique no botão para criar
            uma nova senha.
          </p>
          <Link href="/login" className={cn(buttonVariants())}>
            Voltar ao login
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Esqueci minha senha</CardTitle>
        <CardDescription>
          Informe seu e-mail e enviaremos um link para redefinir a senha.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form action={formAction} className="flex flex-col gap-3">
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

          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={pending}>
            {pending ? "Enviando…" : "Enviar link"}
          </Button>
        </form>

        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          Voltar ao login
        </Link>
      </CardContent>
    </Card>
  );
}
