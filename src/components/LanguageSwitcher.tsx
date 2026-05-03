"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { locales } from "@/i18n";
import { useI18n, type Locale } from "@/i18n/context";

const labels: Record<Locale, { native: string; flag: string }> = {
  en: { native: "English", flag: "🇺🇸" },
  ar: { native: "العربية", flag: "🇪🇬" },
};

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLocale(next: Locale) {
    if (next === locale) { setOpen(false); return; }
    // Replace the locale segment in the pathname
    const segments = pathname.split("/");
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = next;
    } else {
      segments.splice(1, 0, next);
    }
    const newPath = segments.join("/") || "/";
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000`;
    router.push(newPath);
    router.refresh();
    setOpen(false);
  }

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm font-medium hover:text-[#FF6A00] transition"
      >
        <Globe className="w-4 h-4" />
        <span>{labels[locale].flag} {labels[locale].native}</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden z-50 min-w-[140px]">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-neutral-50 transition text-left ${
                l === locale ? "text-[#FF6A00] font-semibold bg-orange-50" : "text-neutral-700"
              }`}
            >
              <span>{labels[l].flag}</span>
              <span>{labels[l].native}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
