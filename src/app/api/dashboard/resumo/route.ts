import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardResumo } from "@/lib/dashboard-resumo";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const resumo = await loadDashboardResumo(user?.id);
  return NextResponse.json(resumo);
}
