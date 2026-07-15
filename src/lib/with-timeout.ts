/**
 * Limita o tempo de uma Promise; em timeout devolve o fallback.
 * Evita páginas do dashboard travarem 300s quando o Postgres não responde.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T,
  label = "query",
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => {
          console.warn(`[withTimeout] ${label} excedeu ${ms}ms`);
          resolve(fallback);
        }, ms);
      }),
    ]);
  } catch (error) {
    console.warn(`[withTimeout] ${label} falhou`, error);
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
