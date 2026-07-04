import type { RetencaoResumo, AtividadeDia, EstadoRetencao } from "@/lib/retencao";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

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
}

export function CicloRetencao({ resumo, atividade }: CicloRetencaoProps) {
  const total = resumo.aprendendo + resumo.jovem + resumo.maduro;
  const maxAtividade = Math.max(1, ...atividade.map((a) => a.total));

  const diasLabel = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <section aria-labelledby="retencao-titulo" className="flex flex-col gap-4">
      <div>
        <h2 id="retencao-titulo" className="text-lg font-semibold">
          Ciclo de retenção
        </h2>
        <p className="text-sm text-muted-foreground">
          Estados SRS inspirados no Anki/FSRS — consolidação visível
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Mapa de memória</CardTitle>
            <CardDescription>
              {resumo.hasData
                ? `${total} cartões no ciclo espaçado`
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
                O algoritmo SRS agenda revisões em +1, +3, +7, +14 e +30 dias.
                Cada acerto empurra a revisão; cada erro reinicia o ciclo.
              </p>
            )}

            {resumo.revisoesHoje > 0 && (
              <Badge variant="outline" className="w-fit border-semaforo-amarelo/50 text-semaforo-amarelo">
                {resumo.revisoesHoje} revisões pendentes hoje
              </Badge>
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
              role="img"
              aria-label="Atividade de estudo nos últimos 7 dias"
            >
              {atividade.map((dia, i) => (
                <div
                  key={dia.data}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <div
                    className={cn(
                      "w-full min-h-1 rounded-sm bg-transito/20",
                      dia.total > 0 && "bg-transito",
                    )}
                    style={{
                      height: `${Math.max(8, (dia.total / maxAtividade) * 72)}px`,
                    }}
                    title={`${dia.total} questões`}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {diasLabel[i]}
                  </span>
                </div>
              ))}
            </div>
            {!atividade.some((a) => a.total > 0) && (
              <Link
                href="/estudo"
                className={cn(buttonVariants({ size: "sm" }), "mt-4 w-full")}
              >
                Iniciar sessão de hoje
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
