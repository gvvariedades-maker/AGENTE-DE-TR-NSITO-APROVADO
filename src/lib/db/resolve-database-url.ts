/**
 * Monta DATABASE_URL com encode automático da senha.
 * Preferir DATABASE_PASSWORD (texto puro) + SUPABASE_PROJECT_REF para evitar erros com ? @ # etc.
 */
export function resolveDatabaseUrl(): string {
  const fromEnv = process.env.DATABASE_URL?.trim();
  const password = process.env.DATABASE_PASSWORD?.trim();
  const projectRef = process.env.SUPABASE_PROJECT_REF?.trim();

  if (password && projectRef) {
    const host =
      process.env.DATABASE_HOST?.trim() ?? "aws-1-us-east-2.pooler.supabase.com";
    const port = process.env.DATABASE_PORT?.trim() ?? "5432";
    const user = `postgres.${projectRef}`;
    const encoded = encodeURIComponent(password);
    return `postgresql://${user}:${encoded}@${host}:${port}/postgres`;
  }

  if (fromEnv) {
    try {
      new URL(fromEnv);
      return fromEnv;
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
