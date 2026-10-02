import { handleOpenGraph } from "@/lib/opengraph-route";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = createClient(await cookies());
  const { data: authData, error: authError } = await supabase.auth.getClaims();
  if (authError || !authData?.claims) {
    return Response.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  return handleOpenGraph(request);
}
