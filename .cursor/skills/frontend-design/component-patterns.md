# Padrões de Componente

Stack: shadcn/ui em `src/components/ui/`. Compor — não reinventar.

## Imports padrão

```tsx
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
```

## Shell de página

```tsx
<div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
  <div className="flex flex-col gap-2">
    <h1 className="text-2xl font-bold">Título</h1>
    <p className="text-muted-foreground">Subtítulo</p>
  </div>
  {/* conteúdo */}
</div>
```

Com largura máxima: envolver em `mx-auto w-full max-w-5xl`.

## Card de métrica (Semáforo)

```tsx
<Card>
  <CardHeader className="pb-2">
    <CardDescription>Gerais</CardDescription>
    <CardTitle className="text-lg tabular-nums">42 pts</CardTitle>
  </CardHeader>
  <CardContent className="flex items-center gap-2">
    <Badge variant="outline">Seguro</Badge>
    <Progress value={70} className="flex-1" />
  </CardContent>
</Card>
```

Status do semáforo via `Badge` — variante ou classe de borda, nunca só cor de fundo.

## Card de destaque (contagem regressiva)

Padrão da home — destaque sutil sem gradiente:

```tsx
<Card className="border-primary/30 bg-primary/5">
  <CardHeader>
    <CardTitle className="text-lg">Contagem regressiva</CardTitle>
    <CardDescription>Prova objetiva — 30/08/2026</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-4xl font-bold tabular-nums">{dias} dias</p>
  </CardContent>
</Card>
```

## Card de modo de treino

```tsx
<Card>
  <CardHeader className="pb-2">
    <CardTitle className="text-base">{label}</CardTitle>
    <CardDescription>{desc}</CardDescription>
  </CardHeader>
  <CardContent>
    <Button variant="secondary" className="w-full">Iniciar</Button>
  </CardContent>
</Card>
```

Grid: `grid gap-3 sm:grid-cols-2`.

## Lista de disciplinas

Item simples com borda — sem card pesado:

```tsx
<li className="rounded-lg border border-border px-4 py-3 text-sm">
  {nome}
</li>
```

## Alternativa de questão (mobile)

Área de toque ampla, estado selecionado visível:

```tsx
<button
  type="button"
  className={cn(
    "flex min-h-11 w-full items-start gap-3 rounded-lg border border-border px-4 py-3 text-left text-base leading-relaxed transition-colors",
    "hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
    selecionada && "border-primary bg-primary/10"
  )}
>
  <span className="font-semibold tabular-nums">{letra}.</span>
  <span>{texto}</span>
</button>
```

Desktop: atalhos de teclado **A–D** via `"use client"` (4 alternativas neste edital).

## Barra de simulado (fixa)

```tsx
<div className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-2 backdrop-blur-sm">
  <div className="flex items-center gap-4">
    <Progress value={progresso} className="flex-1" />
    <span className="font-mono text-sm tabular-nums">{tempo}</span>
  </div>
</div>
```

## Estados vazios e loading

```tsx
<Card>
  <CardContent className="py-8 text-center text-muted-foreground">
  <p>Resolva questões para ver seu semáforo de aprovação.</p>
  </CardContent>
</Card>
```

Nunca: "No data", "TODO", "Lorem ipsum".

## Link como botão

```tsx
<Link href="/dashboard" className={cn(buttonVariants(), "w-full")}>
  Ir para o painel
</Link>
```
