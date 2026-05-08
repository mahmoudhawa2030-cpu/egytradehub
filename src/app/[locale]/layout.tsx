import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { I18nProvider } from "@/i18n/context";
import { getTranslations, isValidLocale } from "@/i18n";
import { createClient } from "@/lib/supabase/server";
import DesktopHeader from "@/components/landing/DesktopHeader";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) notFound();

  const translations = await getTranslations(locale);

  // Determine current pathname to skip header on home (it renders its own)
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? headersList.get("x-invoke-path") ?? "";
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  // Fetch categories for header (only on non-home pages)
  let categories: { id: string; name: string; slug: string; parent_id: string | null }[] = [];
  if (!isHome) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, parent_id")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    categories = data ?? [];
  }

  return (
    <I18nProvider locale={locale} translations={translations}>
      <div dir={locale === "ar" ? "rtl" : "ltr"} className="contents">
        {!isHome && (
          <div className="hidden lg:block">
            <DesktopHeader categories={categories} />
          </div>
        )}
        {children}
      </div>
    </I18nProvider>
  );
}
