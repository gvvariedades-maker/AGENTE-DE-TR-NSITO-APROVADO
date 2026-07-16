export default function EstudoLoading() {
  return (
    <div className="flex flex-1 flex-col" aria-busy="true" aria-label="Carregando sessão">
      <div className="border-b border-border px-4 py-2.5">
        <div className="mx-auto h-4 w-40 max-w-3xl animate-pulse rounded bg-muted" />
      </div>
      <div className="px-4 pt-2.5 pb-2">
        <div className="mx-auto flex max-w-3xl flex-col gap-2">
          <div className="h-3 w-full animate-pulse rounded bg-muted/80" />
          <div className="h-1 w-full animate-pulse rounded-full bg-muted" />
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-muted/70" />
          <div className="h-3 w-[92%] animate-pulse rounded bg-muted/70" />
          <div className="h-3 w-[85%] animate-pulse rounded bg-muted/70" />
        </div>
        <div className="mt-2 flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-12 w-full animate-pulse rounded-lg border border-border bg-muted/40"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
