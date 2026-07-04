import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>
            Autenticação via Supabase Auth — configure as variáveis de ambiente
            para ativar o login.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button disabled>Entrar com e-mail</Button>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            Voltar ao início
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
