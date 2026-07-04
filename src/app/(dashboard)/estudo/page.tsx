import Link from "next/link";
import { getQuestoesLista, QUESTAO_DEMO } from "@/lib/questoes";
import { QuestaoView } from "@/components/estudo/questao-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function EstudoPage() {
  const questoesDb = await getQuestoesLista(20);
  const questoes = questoesDb.length > 0 ? questoesDb : [QUESTAO_DEMO];
  const isDemo = questoesDb.length === 0;

  return (
    <div className="flex flex-1 flex-col">
      {isDemo && (
        <Alert className="mx-4 mt-4 max-w-3xl self-center">
          <AlertTitle>Questão demonstração</AlertTitle>
          <AlertDescription>
            Rode{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              npm run db:seed
            </code>{" "}
            para carregar questões reais do banco.
          </AlertDescription>
        </Alert>
      )}

      <QuestaoView questoes={questoes} modo="estudo" />

      <div className="border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
        Prática de recuperação ativa · feedback imediato · revisão espaçada
      </div>

      <div className="border-t border-border p-4">
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          ← Voltar ao painel
        </Link>
      </div>
    </div>
  );
}
