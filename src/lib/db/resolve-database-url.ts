/**
 * Monta DATABASE_URL com encode automático da senha.
 * Preferir DATABASE_PASSWORD (texto puro) + SUPABASE_PROJECT_REF para evitar erros com ? @ # etc.
 *
 * Supabase pooler: porta 6543 (transaction mode) evita EMAXCONNSESSION com Next dev + seed.
 */
const TRANSACTION_POOLER_PORT = "6543";
const SESSION_POOLER_PORT = "5432";

function isPoolerHost(host: string): boolean {
  return host.includes("pooler.supabase.com");
}

/** Em serverless (Vercel) sempre transaction mode; local respeita DATABASE_PORT. */
function resolvePoolerPort(host: string): string {
  if (!isPoolerHost(host)) {
    return process.env.DATABASE_PORT?.trim() || SESSION_POOLER_PORT;
  }

  if (process.env.VERCEL) {
    return TRANSACTION_POOLER_PORT;
  }

  const explicit = process.env.DATABASE_PORT?.trim();
  if (explicit) return explicit;

  return TRANSACTION_POOLER_PORT;
}

function preferTransactionPooler(urlString: string): string {
  try {
    const url = new URL(urlString);
    if (
      isPoolerHost(url.hostname) &&
      (url.port === SESSION_POOLER_PORT || url.port === "")
    ) {
      url.port = resolvePoolerPort(url.hostname);
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
    const port = resolvePoolerPort(host);
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
