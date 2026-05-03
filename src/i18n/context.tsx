"use client";

import { createContext, useContext, ReactNode } from "react";
import type en from "./en.json";

export type Locale = "en" | "ar";
export type Translations = typeof en;

const I18nContext = createContext<{ locale: Locale; t: Translations } | null>(null);

export function I18nProvider({
  locale,
  translations,
  children,
}: {
  locale: Locale;
  translations: Translations;
  children: ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, t: translations }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
