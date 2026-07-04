import { cn } from "@/lib/utils";
import type { ZonaMetrica } from "@/lib/semaforo";
import { formatPontos } from "@/lib/semaforo";
import { SemaforoVisual } from "@/components/dashboard/semaforo-visual";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const zonaStyles = {
  verde: "border-semaforo-verde/35 bg-semaforo-verde/5",
  amarelo: "border-semaforo-amarelo/35 bg-semaforo-amarelo/5",
  vermelho: "border-semaforo-vermelho/35 bg-semaforo-vermelho/5",
  vazio: "border-border",
} as const;

const badgeStyles = {
  verde: "border-semaforo-verde/50 text-semaforo-verde",
  amarelo: "border-semaforo-amarelo/50 text-semaforo-amarelo",
  vermelho: "",
  vazio: "",
} as const;

const progressStyles = {
  verde: "[&_[data-slot=progress-indicator]]:bg-semaforo-verde",
  amarelo: "[&_[data-slot=progress-indicator]]:bg-semaforo-amarelo",
  vermelho: "[&_[data-slot=progress-indicator]]:bg-semaforo-vermelho",
  vazio: "",
} as const;

interface SemaforoZonaCardProps {
  metrica: ZonaMetrica;
  minimoLabel?: string;
}

export function SemaforoZonaCard({ metrica, minimoLabel }: SemaforoZonaCardProps) {
  const { label, pontos, zona, percentual, statusLabel, minimo } = metrica;

  return (
    <Card className={cn("overflow-hidden", zonaStyles[zona])}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div>
          <CardDescription className="text-xs font-medium tracking-wide uppercase">
            {label}
          </CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {formatPontos(pontos)}
          </CardTitle>
        </div>
        <SemaforoVisual zona={zona} size="sm" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Badge
          variant={zona === "vermelho" ? "destructive" : "outline"}
          className={cn("w-fit", badgeStyles[zona])}
        >
          {statusLabel}
        </Badge>
        {pontos !== null && (
          <Progress
            value={percentual}
            aria-label={`Progresso ${label}`}
            className={progressStyles[zona]}
          />
        )}
        <p className="text-xs text-muted-foreground">
          {minimoLabel ?? `Mín. ${minimo} pts`}
        </p>
      </CardContent>
    </Card>
  );
}
