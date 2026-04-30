import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  
  // During static build, return a dummy client if env vars are missing
  // The real client will be created on the client side where env vars exist
  if (!url || !key) {
    console.warn("Supabase URL or Anon Key missing — returning stub client");
  }
  
  return createBrowserClient(url, key);
}
