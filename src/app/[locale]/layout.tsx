import { notFound } from "next/navigation";
import { I18nProvider } from "@/i18n/context";
import { getTranslations, isValidLocale } from "@/i18n";
import { createClient } from "@/lib/supabase/server";
import DesktopHeader from "@/components/landing/DesktopHeader";

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

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

  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  const categories = data ?? [];

  return (
    <I18nProvider locale={locale} translations={translations}>
      <div dir={locale === "ar" ? "rtl" : "ltr"} className="contents">
        <div className="hidden lg:block">
          <DesktopHeader categories={categories} />
        </div>
        {children}
      </div>
    </I18nProvider>
  );
}
