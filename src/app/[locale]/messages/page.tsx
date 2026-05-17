"use client";

import MessagesClient from "./MessagesClient";
import { useI18n } from "@/i18n/context";

export default function MessagesPage() {
  const { locale } = useI18n();
  return <MessagesClient locale={locale} />;
}
