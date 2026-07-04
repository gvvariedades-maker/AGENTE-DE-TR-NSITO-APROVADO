# Exemplo: Questão Mobile (uma por tela)

Fluxo central do app — prioridade máxima de legibilidade.

## Direção visual

- **Personalidade:** modo prova — zero distração, foco no enunciado
- **Hierarquia:** barra fixa (progresso + timer) → enunciado → alternativas → navegação
- **Cor:** neutro até feedback; verde/vermelho só após confirmar resposta
- **Evitar:** sidebar, cards decorativos, múltiplos CTAs competindo

## Layout mobile

```
┌─────────────────────────────────────┐
│ ████████░░░░░░░░  02:34:12  Q12/60│  ← sticky
├─────────────────────────────────────┤
│                                     │
│  Enunciado longo com texto          │
│  legível (text-lg leading-relaxed)  │
│  scrollável...                      │
│                                     │
├─────────────────────────────────────┤
│  A. Alternativa com área ampla      │
│  B. Alternativa                     │
│  C. Alternativa                     │
│  D. Alternativa                     │
├─────────────────────────────────────┤
│  [ Anterior ]    [ Próxima → ]      │
└─────────────────────────────────────┘
```

## Componentes

```tsx
"use client";

// Barra sticky — ver component-patterns.md

<article className="flex flex-1 flex-col">
  <div className="flex-1 overflow-y-auto px-4 py-4">
    <p className="text-lg leading-relaxed">{enunciado}</p>
  </div>

  <fieldset className="flex flex-col gap-2 border-t border-border px-4 py-4">
    <legend className="sr-only">Alternativas</legend>
    {alternativas.map((alt) => (
      <AlternativaButton key={alt.letra} {...alt} />
    ))}
  </fieldset>

  <footer className="flex gap-2 border-t border-border p-4">
    <Button variant="outline" className="flex-1">Anterior</Button>
    <Button className="flex-1">Próxima</Button>
  </footer>
</article>
```

## Interação desktop

```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    const key = e.key.toUpperCase();
    if (["A", "B", "C", "D", "E"].includes(key)) {
      selecionarAlternativa(key);
    }
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, []);
```

## Modo foco

Quando ativo: ocultar sidebar/nav global via classe no layout ou contexto. Manter apenas barra de simulado + conteúdo.

## Timer — alerta 30 min

```tsx
{minutosRestantes <= 30 && (
  <Alert variant="destructive">
    <AlertTitle>Menos de 30 minutos</AlertTitle>
    <AlertDescription>Revise questões marcadas.</AlertDescription>
  </Alert>
)}
```

## A11y específica

- `fieldset` + `legend.sr-only` para grupo de alternativas
- `aria-pressed` na alternativa selecionada
- Timer com `aria-live="polite"` para atualizações
- Não auto-scroll ao trocar questão sem aviso

## Feedback pós-resposta

| Momento | UI |
|---------|-----|
| Durante prova | Sem correção — só marcação para revisão |
| Modo estudo | Borda verde/vermelha + comentário Professor Elite abaixo |
| Estudo reverso | Link para lei seca + sugestão de questões irmãs |
