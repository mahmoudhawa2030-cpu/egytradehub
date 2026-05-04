import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll().map((c) => c.name);

  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();

  let profileData = null;
  let profileErr: string | null = null;

  if (userData?.user) {
    const { data, error } = await supabase
      .from("profiles")
      .select("role, full_name, is_verified")
      .eq("user_id", userData.user.id)
      .single();
    profileData = data;
    profileErr = error?.message ?? null;
  }

  return NextResponse.json({
    env: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    cookies: allCookies,
    user: userData?.user
      ? { id: userData.user.id, email: userData.user.email }
      : null,
    userError: userErr?.message ?? null,
    profile: profileData,
    profileError: profileErr,
  });
}
