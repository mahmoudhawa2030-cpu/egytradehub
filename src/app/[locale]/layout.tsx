import { notFound } from "next/navigation";
import { I18nProvider } from "@/i18n/context";
import { getTranslations, isValidLocale } from "@/i18n";

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

  return (
    <I18nProvider locale={locale} translations={translations}>
      <div dir={locale === "ar" ? "rtl" : "ltr"} className="contents">
        {children}
      </div>
    </I18nProvider>
  );
}
