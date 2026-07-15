import { NextResponse } from "next/server";
import { resolveDatabaseUrl } from "@/lib/db/resolve-database-url";
import postgres from "postgres";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const started = Date.now();
  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const hasAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());
  const hasPassword = Boolean(process.env.DATABASE_PASSWORD?.trim());
  const hasRef = Boolean(process.env.SUPABASE_PROJECT_REF?.trim());
  const hasDbUrl = Boolean(process.env.DATABASE_URL?.trim());

  let databaseUrlMasked = "";
  let dbOk = false;
  let dbError: string | null = null;
  let dbMs = 0;

  try {
    const databaseUrl = resolveDatabaseUrl();
    databaseUrlMasked = databaseUrl.replace(/:[^:@]+@/, ":****@");
    const sql = postgres(databaseUrl, {
      prepare: false,
      max: 1,
      connect_timeout: 8,
      idle_timeout: 2,
    });
    const t = Date.now();
    try {
      await sql`select 1 as ok`;
      dbOk = true;
      dbMs = Date.now() - t;
    } finally {
      await sql.end({ timeout: 2 });
    }
  } catch (error) {
    dbError = error instanceof Error ? error.message : String(error);
    dbMs = Date.now() - started;
  }

  const body = {
    ok: hasUrl && hasAnon && dbOk,
    ms: Date.now() - started,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: hasUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: hasAnon,
      DATABASE_PASSWORD: hasPassword,
      SUPABASE_PROJECT_REF: hasRef,
      DATABASE_URL: hasDbUrl,
      DATABASE_PORT: process.env.DATABASE_PORT ?? null,
      DATABASE_HOST: process.env.DATABASE_HOST ?? null,
      VERCEL: Boolean(process.env.VERCEL),
    },
    database: {
      ok: dbOk,
      ms: dbMs,
      url: databaseUrlMasked,
      error: dbError,
    },
  };

  return NextResponse.json(body, { status: body.ok ? 200 : 503 });
}
