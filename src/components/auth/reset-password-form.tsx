"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updatePassword, type ResetPasswordState } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ResetPasswordFormProps {
  hasSession: boolean;
}

const initialState: ResetPasswordState = {};

const inputClassName =
  "h-10 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60";

export function ResetPasswordForm({ hasSession }: ResetPasswordFormProps) {
  const [state, formAction, pending] = useActionState(
    updatePassword,
    initialState,
  );

  if (!hasSession) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Link inválido ou expirado</CardTitle>
          <CardDescription>
            Não foi possível validar o link de recuperação.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Solicite um novo e-mail de recuperação e abra o link mais recente.
          </p>
          <Link href="/esqueci-senha" className={cn(buttonVariants())}>
            Solicitar novo link
          </Link>
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

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Nova senha</CardTitle>
        <CardDescription>
          Escolha uma nova senha para a sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form action={formAction} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Nova senha</span>
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
            <span className="font-medium">Confirmar nova senha</span>
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
            {pending ? "Salvando…" : "Salvar nova senha"}
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
