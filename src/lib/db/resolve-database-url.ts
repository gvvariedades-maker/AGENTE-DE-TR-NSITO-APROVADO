/**
 * Monta DATABASE_URL com encode automático da senha.
 * Preferir DATABASE_PASSWORD (texto puro) + SUPABASE_PROJECT_REF para evitar erros com ? @ # etc.
 *
 * Supabase pooler: porta 6543 (transaction mode) evita EMAXCONNSESSION com Next dev + seed.
 */
function defaultPoolerPort(host: string): string {
  if (process.env.DATABASE_PORT?.trim()) {
    return process.env.DATABASE_PORT.trim();
  }
  return host.includes("pooler.supabase.com") ? "6543" : "5432";
}

function preferTransactionPooler(urlString: string): string {
  if (process.env.DATABASE_PORT?.trim()) return urlString;
  try {
    const url = new URL(urlString);
    if (
      url.hostname.includes("pooler.supabase.com") &&
      (url.port === "5432" || url.port === "")
    ) {
      url.port = "6543";
      return url.toString();
    }
  } catch {
    /* mantém string original */
  }
  return urlString;
}

export function resolveDatabaseUrl(): string {
  const fromEnv = process.env.DATABASE_URL?.trim();
  const password = process.env.DATABASE_PASSWORD?.trim();
  const projectRef = process.env.SUPABASE_PROJECT_REF?.trim();

  if (password && projectRef) {
    const host =
      process.env.DATABASE_HOST?.trim() ?? "aws-1-us-east-2.pooler.supabase.com";
    const port = defaultPoolerPort(host);
    const user = `postgres.${projectRef}`;
    const encoded = encodeURIComponent(password);
    return `postgresql://${user}:${encoded}@${host}:${port}/postgres`;
  }

  if (fromEnv) {
    try {
      new URL(fromEnv);
      return preferTransactionPooler(fromEnv);
    } catch {
      throw new Error(
        "DATABASE_URL inválida. Use DATABASE_PASSWORD (senha em texto puro) + SUPABASE_PROJECT_REF, ou corrija o encoding (%3F para ?).",
      );
    }
  }

  throw new Error(
    "Defina DATABASE_PASSWORD + SUPABASE_PROJECT_REF ou DATABASE_URL em .env.local",
  );
}
