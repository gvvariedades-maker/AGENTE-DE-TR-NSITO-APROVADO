import type { RetencaoResumo, AtividadeDia, EstadoRetencao } from "@/lib/retencao";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ESTADOS: {
  key: EstadoRetencao;
  label: string;
  desc: string;
  cor: string;
}[] = [
  {
    key: "aprendendo",
    label: "Aprendendo",
    desc: "intervalo < 7 dias",
    cor: "bg-retencao-aprendendo",
  },
  {
    key: "jovem",
    label: "Jovem",
    desc: "7–20 dias",
    cor: "bg-retencao-jovem",
  },
  {
    key: "maduro",
    label: "Maduro",
    desc: "≥ 21 dias",
    cor: "bg-retencao-maduro",
  },
];

interface CicloRetencaoProps {
  resumo: RetencaoResumo;
  atividade: AtividadeDia[];
  embedded?: boolean;
}

export function CicloRetencao({
  resumo,
  atividade,
  embedded = false,
}: CicloRetencaoProps) {
  const total = resumo.aprendendo + resumo.jovem + resumo.maduro;
  const maxAtividade = Math.max(1, ...atividade.map((a) => a.total));

  const diasLabel = ["D", "S", "T", "Q", "Q", "S", "S"];

  const cards = (
    <div
      className={cn(
        "grid gap-4",
        embedded ? "grid-cols-1" : "lg:grid-cols-2",
      )}
    >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Mapa de memória</CardTitle>
            <CardDescription>
              {resumo.hasData
                ? `${total} itens no ciclo de revisão`
                : "Resolva questões para ativar o ciclo"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {resumo.hasData ? (
              <>
                <div className="flex h-3 overflow-hidden rounded-full ring-1 ring-border">
                  {ESTADOS.map((e) => {
                    const n = resumo[e.key];
                    if (n === 0) return null;
                    return (
                      <div
                        key={e.key}
                        className={cn(e.cor, "h-full")}
                        style={{ width: `${(n / total) * 100}%` }}
                        title={`${e.label}: ${n}`}
                      />
                    );
                  })}
                </div>
                <ul className="grid gap-2 sm:grid-cols-3">
                  {ESTADOS.map((e) => (
                    <li
                      key={e.key}
                      className="rounded-lg border border-border px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn("size-2.5 rounded-full", e.cor)}
                          aria-hidden
                        />
                        <span className="text-sm font-medium">{e.label}</span>
                      </div>
                      <p className="mt-1 text-2xl font-bold tabular-nums">
                        {resumo[e.key]}
                      </p>
                      <p className="text-xs text-muted-foreground">{e.desc}</p>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Quanto mais você pratica, mais espaçadas ficam as revisões — o
                app lembra o que revisar e quando.
              </p>
            )}

          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Consistência (7 dias)</CardTitle>
            <CardDescription>
              Prática de recuperação diária — preditor de retenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="flex h-24 items-end justify-between gap-1.5"
              role="list"
              aria-label="Atividade de estudo nos últimos 7 dias"
            >
              {atividade.map((dia, i) => (
                <div
                  key={dia.data}
                  className="flex flex-1 flex-col items-center gap-1"
                  role="listitem"
                  aria-label={`${diasLabel[i]}: ${dia.total} questões`}
                >
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">
                    {dia.total > 0 ? dia.total : "·"}
                  </span>
                  <div
                    className={cn(
                      "w-full min-h-1 rounded-sm bg-transito/20",
                      dia.total > 0 && "bg-transito",
                    )}
                    style={{
                      height: `${Math.max(8, (dia.total / maxAtividade) * 56)}px`,
                    }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {diasLabel[i]}
                  </span>
                </div>
              ))}
            </div>
            {!atividade.some((a) => a.total > 0) && (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                Nenhuma questão nos últimos 7 dias. Inicie pelo próximo passo
                acima.
              </p>
            )}
          </CardContent>
        </Card>
    </div>
  );

  if (embedded) {
    return cards;
  }

  return (
    <section aria-labelledby="retencao-titulo" className="flex flex-col gap-4">
      <div>
        <h2 id="retencao-titulo" className="text-lg font-semibold">
          Ciclo de retenção
        </h2>
        <p className="text-sm text-muted-foreground">
          Acompanhe como o conteúdo vai fixando na memória ao longo dos dias
        </p>
      </div>
      {cards}
    </section>
  );
}
