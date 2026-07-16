import { getQuestoesEspelho, QUESTAO_DEMO } from "@/lib/questoes";
import { QuestaoView } from "@/components/estudo/questao-view";

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
      <QuestaoView
        questoes={questoes}
        modo="simulado"
        duracaoMinutos={240}
        isDemo={isDemo}
        totalEsperado={totalEsperado}
      />
    </div>
  );
}
