import { PainelAtalhos } from "@/components/dashboard/painel-atalhos";
import { PainelDashboardLoader } from "@/components/dashboard/painel-dashboard-loader";
import { DISCIPLINAS, type Disciplina } from "@/types";

export const dynamic = "force-dynamic";

function parseDisciplinaPainel(raw?: string): Disciplina {
  if (raw && DISCIPLINAS.includes(raw as Disciplina)) {
    return raw as Disciplina;
  }
  return "legislacao_transito";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ disciplina?: string }>;
}) {
  const { disciplina: disciplinaRaw } = await searchParams;
  const disciplinaPainel = parseDisciplinaPainel(disciplinaRaw);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 p-4 md:gap-6 md:p-8">
      <PainelAtalhos />
      <PainelDashboardLoader disciplinaAtiva={disciplinaPainel} />
    </div>
  );
}
