import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const createClient = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          // Responses containing refreshed sessions must not be shared-cached.
          supabaseResponse.headers.set("Cache-Control", "private, no-store");
          supabaseResponse.headers.set("Pragma", "no-cache");
          supabaseResponse.headers.set("Expires", "0");
        },
      },
    },
  );

  // Creating the client alone does not refresh an expired session.
  await supabase.auth.getClaims();

  return supabaseResponse;
};
