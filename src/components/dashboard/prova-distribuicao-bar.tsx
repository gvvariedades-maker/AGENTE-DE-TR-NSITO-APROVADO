import {
  SIMULADO_ESPELHO_DISTRIBUICAO,
  DISCIPLINA_LABELS,
  type Disciplina,
} from "@/types";

const DEMAIS: Disciplina[] = [
  "portugues",
  "direito_administrativo",
  "direito_constitucional",
  "informatica",
  "historia_cg_pb",
  "legislacao_etica_sp",
];

const QTD_CTB = SIMULADO_ESPELHO_DISTRIBUICAO.legislacao_transito;
const QTD_DEMAIS = DEMAIS.reduce(
  (acc, d) => acc + SIMULADO_ESPELHO_DISTRIBUICAO[d],
  0,
);
const TOTAL = QTD_CTB + QTD_DEMAIS;

export function ProvaDistribuicaoBar() {
  const pctCtb = (QTD_CTB / TOTAL) * 100;
  const pctDemais = (QTD_DEMAIS / TOTAL) * 100;

  return (
    <section
      className="rounded-xl border border-border bg-card p-5 md:p-6"
      aria-labelledby="distribuicao-titulo"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="distribuicao-titulo" className="text-lg font-semibold">
            Mapa da prova
          </h2>
          <p className="text-sm text-muted-foreground">
            Espelho IDECAN — 60 questões objetivas
          </p>
        </div>
        <p className="text-sm font-medium text-transito-foreground">
          CTB {QTD_CTB}Q · Demais {QTD_DEMAIS}Q
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <div
          className="flex h-4 w-full overflow-hidden rounded-full ring-1 ring-border"
          role="img"
          aria-label={`Distribuição: Legislação de Trânsito ${QTD_CTB} questões, demais disciplinas ${QTD_DEMAIS} questões`}
        >
          <div
            className="h-full bg-transito transition-all"
            style={{ width: `${pctCtb}%` }}
            title={`Legislação de Trânsito: ${QTD_CTB}Q`}
          />
          <div
            className="h-full bg-muted-foreground/35 transition-all"
            style={{ width: `${pctDemais}%` }}
            title={`Demais disciplinas: ${QTD_DEMAIS}Q`}
          />
        </div>

        <div className="flex justify-between text-xs font-medium">
          <span className="text-transito-foreground">
            Legislação de Trânsito · {pctCtb.toFixed(0)}%
          </span>
          <span className="text-muted-foreground">
            Demais disciplinas · {pctDemais.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-transito/25 bg-transito/5 p-4">
          <div className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full bg-transito"
              aria-hidden
            />
            <h3 className="text-sm font-semibold text-transito-foreground">
              Específico — CTB
            </h3>
            <span className="ml-auto text-sm font-bold tabular-nums text-foreground">
              {QTD_CTB}Q
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Metade da prova. Prioridade máxima no edital — CTB, resoluções
            CONTRAN e normas SENATRAN.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full bg-muted-foreground/50"
              aria-hidden
            />
            <h3 className="text-sm font-semibold text-foreground">
              Gerais + específicos
            </h3>
            <span className="ml-auto text-sm font-bold tabular-nums text-foreground">
              {QTD_DEMAIS}Q
            </span>
          </div>
          <ul className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
            {DEMAIS.map((d) => (
              <li key={d} className="flex justify-between gap-2">
                <span>{DISCIPLINA_LABELS[d]}</span>
                <span className="shrink-0 tabular-nums font-medium text-foreground">
                  {SIMULADO_ESPELHO_DISTRIBUICAO[d]}Q
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
