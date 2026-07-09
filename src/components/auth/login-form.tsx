"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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
}

export function LoginForm({ next, authError }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [linkEnviado, setLinkEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      const supabase = createClient();
      const redirectTo = new URL("/auth/callback", window.location.origin);
      if (next?.startsWith("/") && !next.startsWith("//")) {
        redirectTo.searchParams.set("next", next);
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo.toString() },
      });

      if (error) {
        setErro(error.message);
        return;
      }

      setLinkEnviado(true);
    } catch {
      setErro("Não foi possível enviar o link. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>
          {linkEnviado
            ? "Enviamos um link mágico para o seu e-mail."
            : "Informe seu e-mail para receber um link de acesso."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {authError && (
          <Alert variant="destructive">
            <AlertDescription>
              Não foi possível concluir o login. Solicite um novo link.
            </AlertDescription>
          </Alert>
        )}

        {linkEnviado ? (
          <p className="text-sm text-muted-foreground">
            Abra o e-mail <strong className="text-foreground">{email}</strong> e
            clique no link para entrar. Você pode fechar esta aba após
            autenticar.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">E-mail</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            {erro && (
              <p className="text-sm text-destructive" role="alert">
                {erro}
              </p>
            )}
            <Button type="submit" disabled={enviando || !email.trim()}>
              {enviando ? "Enviando…" : "Enviar link mágico"}
            </Button>
          </form>
        )}

        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }))}>
          Voltar ao início
        </Link>
      </CardContent>
    </Card>
  );
}
