"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, MessageSquare, User, ChevronDown, Menu, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/context";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const categoryNav = [
  "Consumer Electronics",
  "Apparel & Fashion",
  "Home & Garden",
  "Beauty & Personal Care",
  "Sports & Entertainment",
  "Machinery",
  "Automotive Parts",
  "Health & Medical",
  "Packaging & Printing",
  "Gifts & Crafts",
];

export default function DesktopHeader() {
  const { t, locale } = useI18n();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ? { email: data.user.email } : null);
    }
    checkAuth();
  }, [supabase]);

  const topNavLinks = [
    { label: t.common.products, href: `/${locale}/products` },
    { label: t.common.suppliers, href: `/${locale}/suppliers` },
    { label: t.common.rfq, href: `/${locale}/rfq` },
    { label: t.common.help, href: `/${locale}/help` },
    { label: t.common.downloadApp, href: "#" },
  ];

  return (
    <header className="bg-white shadow-sm">
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
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-neutral-600 hover:text-[#FF6A00] transition"
                >
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
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#FF8C00] flex items-center justify-center">
              <span className="text-white font-display text-xl font-bold">T</span>
            </div>
            <div className="font-display text-2xl font-bold text-neutral-900">
              Trade<span className="text-[#FF6A00]">Hub</span>
            </div>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl">
            <div className="flex">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.common.searchPlaceholderDesktop}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#FF6A00] rounded-l-lg focus:outline-none text-sm"
                />
              </div>
              <button className="px-8 py-3 bg-[#FF6A00] text-white font-semibold rounded-r-lg hover:bg-[#FF8C00] transition">
                {t.common.search}
              </button>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
              <span>Trending:</span>
              {["LED Lights", "Solar Panels", "Bluetooth Earphones", "Smart Watches"].map((tag) => (
                <Link key={tag} href={`/search?q=${tag}`} className="hover:text-[#FF6A00] transition">
                  {tag}
                </Link>
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
            <button className="flex flex-col items-center gap-1 text-neutral-600 hover:text-[#FF6A00] transition">
              <MessageSquare className="w-6 h-6" />
              <span className="text-xs">{t.common.messages}</span>
            </button>
            {user ? (
              <div className="flex flex-col items-center gap-1 text-neutral-600">
                <div className="w-6 h-6 rounded-full bg-[#FF6A00] text-white flex items-center justify-center text-xs font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs">{user.email?.split("@")[0]}</span>
              </div>
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
              {categoryNav.slice(0, 7).map((cat) => (
                <Link
                  key={cat}
                  href={`/category/${cat.toLowerCase().replace(/\s+/g, "-")}`}
                  className="px-4 py-3 text-sm text-neutral-700 hover:text-[#FF6A00] hover:bg-neutral-50 transition"
                >
                  {cat}
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
        <div className="absolute left-0 right-0 bg-white shadow-xl border-t border-neutral-200 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-4 gap-8">
              {categoryNav.map((cat) => (
                <Link
                  key={cat}
                  href={`/category/${cat.toLowerCase().replace(/\s+/g, "-")}`}
                  className="group"
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center group-hover:from-[#FF6A00] group-hover:to-[#FF8C00] transition">
                      <span className="text-[#FF6A00] group-hover:text-white font-bold text-xs">{cat.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 group-hover:text-[#FF6A00] transition">{cat}</p>
                      <p className="text-xs text-neutral-500">12,000+ products</p>
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
