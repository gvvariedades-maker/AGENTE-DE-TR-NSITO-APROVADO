# Exemplo: Dashboard Semáforo

Tela: `src/app/(dashboard)/dashboard/page.tsx` — evolução alvo.

## Direção visual

- **Personalidade:** painel de controle noturno, dados em primeiro plano
- **Hierarquia:** semáforo (3 cards) → modos de treino → disciplinas
- **Cor:** badges de status no semáforo; primary só nos CTAs de iniciar treino
- **Evitar:** gradientes no hero; cards idênticos sem diferenciação de zona

## Layout alvo

```
┌─────────────────────────────────────┐
│ Painel de estudos                   │
│ Semáforo de aprovação               │
├──────────┬──────────┬───────────────┤
│ Gerais   │ Específ. │ Total         │
│ 12 pts   │ 28 pts   │ 40 pts        │
│ 🟡 Badge │ 🟢 Badge │ 🔴 Badge      │
│ Progress │ Progress │ Progress      │
├─────────────────────────────────────┤
│ Modos de treino (grid 2col)         │
│ [Simulado] [Sniper] [Anti-zerar]... │
├─────────────────────────────────────┤
│ Disciplinas (lista/grid)            │
└─────────────────────────────────────┘
```

## Composição

```tsx
<div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
  {/* Header */}
  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-2xl font-bold">Painel de estudos</h1>
      <p className="text-muted-foreground">Semáforo de aprovação</p>
    </div>
    <p className="text-sm text-muted-foreground tabular-nums">
      Prova em <span className="font-semibold text-foreground">{dias} dias</span>
    </p>
  </div>

  {/* Semáforo */}
  <div className="grid gap-4 sm:grid-cols-3">
    {zonas.map((z) => (
      <Card key={z.id} className={cn(z.borderClass)}>
        <CardHeader className="pb-2">
          <CardDescription>{z.label}</CardDescription>
          <CardTitle className="text-lg tabular-nums">{z.pontos} pts</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Badge variant="outline">{z.status}</Badge>
          <Progress value={z.percentual} />
          <p className="text-xs text-muted-foreground">Mín. {z.minimo} pts</p>
        </CardContent>
      </Card>
    ))}
  </div>

  {/* Modos + Disciplinas — ver component-patterns.md */}
</div>
```

## Estados

| Estado | UI |
|--------|-----|
| Sem dados | Badge "Resolva questões para ativar" + CTA para simulado |
| Carregando | Skeleton ou Progress indeterminado nos cards |
| Zona verde | `border-green-500/30` sutil + Badge "Seguro" |
| Zona amarela | `border-yellow-500/30` + Badge "Atenção" |
| Zona vermelha | `border-destructive/30` + Badge variant destructive |

## Dados (Supabase)

Consultar attempts/scores via MCP antes de hardcodar métricas. Mínimos do edital: Gerais 1 pt, Específicos 2 pts, Total 50 pts.
