import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Get user role for redirect
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", data.user.id)
        .single();

      let redirectTo = "/en";
      if (profile?.role === "admin") {
        redirectTo = "/en/admin/dashboard";
      } else if (profile?.role === "supplier") {
        redirectTo = "/en/supplier/dashboard";
      }

      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // Return to home on error
  return NextResponse.redirect(`${origin}/en?error=auth_failed`);
}
