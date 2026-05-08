"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, MessageSquare, User, ChevronDown, Menu, Heart, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/context";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type DbCategory = { id: string; name: string; slug: string; parent_id: string | null };

// Demo placeholder terms per category (used for rotating placeholder)
const CATEGORY_TERMS: Record<string, string[]> = {
  default: ["hydraulic pumps", "ceramic tiles", "cotton fabric", "LED strip lights", "solar panels", "steel pipes", "marble slabs", "olive oil bulk"],
  Electronics: ["LED strip lights", "solar panels", "circuit breakers", "CCTV cameras", "UPS systems"],
  "Building Materials": ["ceramic tiles", "marble slabs", "steel rebar", "gypsum boards", "PVC pipes"],
  Textiles: ["cotton fabric rolls", "polyester yarn", "denim fabric", "ready-made garments", "linen sheets"],
  "Food & Agriculture": ["olive oil bulk", "dates wholesale", "spices bulk", "rice 50kg bags", "sugar raw"],
  Chemicals: ["industrial solvents", "epoxy resin", "cleaning chemicals", "paint thinner", "adhesives"],
  Machinery: ["hydraulic pumps", "conveyor belts", "CNC machines", "compressors", "generators"],
  Furniture: ["office chairs bulk", "metal shelving", "wooden pallets", "sofa sets wholesale", "tables"],
};

export default function DesktopHeader({
  categories = [],
  activeCategory,
}: {
  categories?: DbCategory[];
  activeCategory?: string;
}) {
  const topLevel = categories.filter((c) => c.parent_id === null);
  const { t, locale } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showCategories, setShowCategories] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = createClient();

  // ── Auth ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) =>
      setUser(data.user ? { email: data.user.email } : null)
    );
  }, []);

  // ── Rotating placeholder ──
  useEffect(() => {
    const terms = (activeCategory && CATEGORY_TERMS[activeCategory])
      ? CATEGORY_TERMS[activeCategory]
      : CATEGORY_TERMS.default;
    let idx = Math.floor(Math.random() * terms.length);
    setPlaceholder(`Search: ${terms[idx]}…`);
    const interval = setInterval(() => {
      idx = (idx + 1) % terms.length;
      setPlaceholder(`Search: ${terms[idx]}…`);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeCategory]);

  // ── Autocomplete fetch (datamuse via our proxy) ──
  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) { setSuggestions([]); return; }
    try {
      const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(q)}`);
      const data: string[] = await res.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch {
      setSuggestions([]);
    }
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchQuery(val);
    setActiveSuggestion(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 220);
  }

  function doSearch(q: string) {
    if (!q.trim()) return;
    setShowSuggestions(false);
    router.push(`/${locale}/search?q=${encodeURIComponent(q.trim())}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions) {
      if (e.key === "Enter") doSearch(searchQuery);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeSuggestion >= 0) {
        doSearch(suggestions[activeSuggestion]);
        setSearchQuery(suggestions[activeSuggestion]);
      } else {
        doSearch(searchQuery);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  // ── Close dropdown on outside click ──
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const topNavLinks = [
    { label: t.common.products, href: `/${locale}/products` },
    { label: t.common.suppliers, href: `/${locale}/suppliers` },
    { label: t.common.rfq, href: `/${locale}/rfq` },
    { label: t.common.help, href: `/${locale}/help` },
    { label: t.common.downloadApp, href: "#" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      {/* Top bar */}
      <div className="bg-neutral-100 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-9 text-xs">
            <div className="flex items-center gap-6">
              <span className="text-neutral-500">{t.common.welcome}</span>
              <LanguageSwitcher />
            </div>
            <div className="flex items-center gap-6">
              {topNavLinks.map((link) => (
                <Link key={link.label} href={link.href} className="text-neutral-600 hover:text-[#FF6A00] transition">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#FF8C00] flex items-center justify-center">
              <span className="text-white font-display text-xl font-bold">T</span>
            </div>
            <div className="font-display text-2xl font-bold text-neutral-900">
              Trade<span className="text-[#FF6A00]">Hub</span>
            </div>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl" ref={searchRef}>
            <div className="relative">
              <div className="flex">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-8 py-3 border-2 border-[#FF6A00] rounded-l-lg focus:outline-none text-sm"
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(""); setSuggestions([]); setShowSuggestions(false); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => doSearch(searchQuery)}
                  className="px-8 py-3 bg-[#FF6A00] text-white font-semibold rounded-r-lg hover:bg-[#FF8C00] transition"
                >
                  {t.common.search}
                </button>
              </div>

              {/* Autocomplete dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-[88px] bg-white border border-neutral-200 rounded-b-xl shadow-xl z-50 overflow-hidden">
                  {suggestions.map((s, i) => (
                    <button
                      key={s}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setSearchQuery(s); doSearch(s); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                        i === activeSuggestion ? "bg-orange-50 text-[#FF6A00]" : "hover:bg-neutral-50 text-neutral-700"
                      }`}
                    >
                      <Search className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Trending tags */}
            <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
              <span>Trending:</span>
              {["LED Lights", "Solar Panels", "Ceramic Tiles", "Cotton Fabric"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => doSearch(tag)}
                  className="hover:text-[#FF6A00] transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <button className="flex flex-col items-center gap-1 text-neutral-600 hover:text-[#FF6A00] transition">
              <ShoppingCart className="w-6 h-6" />
              <span className="text-xs">{t.common.cart}</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-neutral-600 hover:text-[#FF6A00] transition">
              <Heart className="w-6 h-6" />
              <span className="text-xs">{t.common.wishlist}</span>
            </button>
            <Link href={`/${locale}/messages`} className="flex flex-col items-center gap-1 text-neutral-600 hover:text-[#FF6A00] transition">
              <MessageSquare className="w-6 h-6" />
              <span className="text-xs">{t.common.messages}</span>
            </Link>
            {user ? (
              <Link href={`/${locale}/account`} className="flex flex-col items-center gap-1 text-neutral-600 hover:text-[#FF6A00] transition">
                <div className="w-6 h-6 rounded-full bg-[#FF6A00] text-white flex items-center justify-center text-xs font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs">{user.email?.split("@")[0]}</span>
              </Link>
            ) : (
              <Link href={`/${locale}/login`} className="flex flex-col items-center gap-1 text-neutral-600 hover:text-[#FF6A00] transition">
                <User className="w-6 h-6" />
                <span className="text-xs">{t.common.signIn}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Category navigation */}
      <div className="border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center gap-2 px-4 py-3 bg-[#FF6A00] text-white font-medium hover:bg-[#FF8C00] transition"
            >
              <Menu className="w-5 h-5" />
              {t.common.categories}
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 ml-4">
              {topLevel.slice(0, 7).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${locale}/products?category=${encodeURIComponent(cat.name)}`}
                  className="px-4 py-3 text-sm text-neutral-700 hover:text-[#FF6A00] hover:bg-neutral-50 transition"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
            <Link
              href={`/${locale}/deals`}
              className="ml-auto px-4 py-3 text-sm font-medium text-[#FF6A00] hover:bg-orange-50 transition"
            >
              {t.common.flashDeals} →
            </Link>
          </div>
        </div>
      </div>

      {/* Mega menu dropdown */}
      {showCategories && (
        <div
          className="absolute left-0 right-0 bg-white shadow-xl border-t border-neutral-200 z-50"
          onMouseLeave={() => setShowCategories(false)}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-4 gap-8">
              {topLevel.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${locale}/products?category=${encodeURIComponent(cat.name)}`}
                  onClick={() => setShowCategories(false)}
                  className="group"
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center group-hover:from-[#FF6A00] group-hover:to-[#FF8C00] transition">
                      <span className="text-[#FF6A00] group-hover:text-white font-bold text-xs">{cat.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 group-hover:text-[#FF6A00] transition">{cat.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
