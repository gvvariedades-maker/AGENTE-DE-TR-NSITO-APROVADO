import type { EstudoReversoResumo } from "@/lib/retencao";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EstudoReversoResumoCardProps {
  resumo: EstudoReversoResumo;
}

export function EstudoReversoResumoCard({
  resumo,
}: EstudoReversoResumoCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Estudo reverso visual</CardTitle>
        <CardDescription>
          Micro-aulas concluídas após responder questões
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resumo.hasData ? (
          <dl className="grid grid-cols-3 gap-3 text-center">
            <div>
              <dt className="text-xs text-muted-foreground">Sessões</dt>
              <dd className="text-2xl font-bold tabular-nums">
                {resumo.sessoesTotal}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Concluídas</dt>
              <dd className="text-2xl font-bold tabular-nums text-transito-foreground">
                {resumo.taxaConclusao}%
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Recalls OK</dt>
              <dd className="text-2xl font-bold tabular-nums text-semaforo-verde">
                {resumo.recallsAcertados}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            Após responder uma questão, use o botão &quot;Estudo reverso
            visual&quot; para fixar o microtópico com blocos segmentados.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
