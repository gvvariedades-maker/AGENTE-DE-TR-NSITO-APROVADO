import Link from "next/link";
import { getQuestoesEspelho, QUESTAO_DEMO } from "@/lib/questoes";
import { QuestaoView } from "@/components/estudo/questao-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SimuladoPage() {
  const { questoes: questoesDb, totalEsperado } = await getQuestoesEspelho();
  const questoes =
    questoesDb.length > 0
      ? questoesDb
      : Array.from({ length: 3 }, (_, i) => ({
          ...QUESTAO_DEMO,
          id: `demo-${i}`,
        }));
  const isDemo = questoesDb.length < totalEsperado;

  return (
    <div className="flex flex-1 flex-col">
      {isDemo && (
        <Alert className="mx-4 mt-4 max-w-3xl self-center">
          <AlertTitle>Simulado em modo demonstração</AlertTitle>
          <AlertDescription>
            {questoesDb.length === 0
              ? "3 questões demo com timer de 4h — seed o banco para o espelho completo de 60Q."
              : `${questoesDb.length} de ${totalEsperado} questões no espelho (8+4+4+4+5+5+30).`}
          </AlertDescription>
        </Alert>
      )}

      <QuestaoView questoes={questoes} modo="simulado" duracaoMinutos={240} />

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
