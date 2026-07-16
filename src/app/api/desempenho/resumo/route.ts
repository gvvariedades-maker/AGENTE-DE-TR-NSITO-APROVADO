import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadDesempenhoPageResumo } from "@/lib/desempenho-page-resumo";
import {
  parsePeriodoDesempenho,
  periodoSince,
} from "@/lib/desempenho-periodo";
import { DISCIPLINAS, type Disciplina } from "@/types";

export const dynamic = "force-dynamic";

function parseDisciplina(raw: string | null): Disciplina | undefined {
  if (!raw || !DISCIPLINAS.includes(raw as Disciplina)) return undefined;
  return raw as Disciplina;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const periodo = parsePeriodoDesempenho(searchParams.get("periodo") ?? undefined);
  const since = periodoSince(periodo);
  const disciplinaFoco = parseDisciplina(searchParams.get("disciplina"));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const resumo = await loadDesempenhoPageResumo(user?.id, {
    since,
    disciplinaFoco,
  });

  return NextResponse.json(resumo);
}
