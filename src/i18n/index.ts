import type { Locale, Translations } from "./context";

export const locales: Locale[] = ["en", "ar"];
export const defaultLocale: Locale = "en";

export async function getTranslations(locale: Locale): Promise<Translations> {
  if (locale === "ar") {
    return (await import("./ar.json")).default as Translations;
  }
  return (await import("./en.json")).default as Translations;
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
