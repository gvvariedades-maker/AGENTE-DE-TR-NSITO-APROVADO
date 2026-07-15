import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getTopicosPorDisciplina,
} from "@/lib/topicos";
import { DISCIPLINAS, type Disciplina } from "@/types";

export const dynamic = "force-dynamic";

function parseDisciplina(raw: string | null): Disciplina | null {
  if (!raw || !DISCIPLINAS.includes(raw as Disciplina)) return null;
  return raw as Disciplina;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const disciplina = parseDisciplina(searchParams.get("disciplina"));

  if (!disciplina) {
    return NextResponse.json(
      { error: "Parâmetro disciplina inválido" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const resumo = await getTopicosPorDisciplina(disciplina, user?.id);
  const fonte =
    resumo.totalEstudaveis === 0 &&
    resumo.topicos.some((t) => t.id.startsWith("edital-"))
      ? "fallback-edital"
      : "banco";

  return NextResponse.json(resumo, {
    headers: { "X-Catalogo-Fonte": fonte },
  });
}
