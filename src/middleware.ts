import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const LOCALES = ["en", "ar"] as const;
type Locale = (typeof LOCALES)[number];

function getLocale(request: NextRequest): Locale {
  // 1. Cookie preference
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && LOCALES.includes(cookie as Locale)) return cookie as Locale;
  // 2. Accept-Language header
  const acceptLang = request.headers.get("accept-language") ?? "";
  if (acceptLang.toLowerCase().includes("ar")) return "ar";
  return "en";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Locale redirect ─────────────────────────────────────────
  // Skip internals
  const isInternal =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/supplier") ||
    /\.(.+)$/.test(pathname);

  if (!isInternal) {
    const pathnameHasLocale = LOCALES.some(
      (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
    );

    if (!pathnameHasLocale) {
      const locale = getLocale(request);
      const newUrl = request.nextUrl.clone();
      newUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
      const redirectResponse = NextResponse.redirect(newUrl);
      redirectResponse.cookies.set("NEXT_LOCALE", locale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
      return redirectResponse;
    }
  }

  // ── Auth middleware ──────────────────────────────────────────
  // /admin and /supplier have their own server-component auth guards — skip here.
  if (pathname.startsWith("/admin") || pathname.startsWith("/supplier")) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  // Strip locale prefix for route matching
  const pathnameWithoutLocale = LOCALES.reduce(
    (p, l) => (p.startsWith(`/${l}/`) ? p.slice(l.length + 1) : p === `/${l}` ? "/" : p),
    pathname
  );

  const locale = (LOCALES.find((l) => pathname.startsWith(`/${l}`)) ?? "en") as Locale;

  const publicRoutes = ["/", "/login", "/signup", "/forgot-password"];
  if (publicRoutes.some((r) => pathnameWithoutLocale === r || pathnameWithoutLocale.startsWith(r + "?"))) {
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
