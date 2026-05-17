"use client";

import { Bell, Search, Camera, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { categoryTabs } from "./data";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/context";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function MobileTopBar() {
  const { t, locale } = useI18n();
  const [active, setActive] = useState<string>("All");
  const [user, setUser] = useState<{ email?: string; id: string } | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ? { id: data.user.id, email: data.user.email } : null);
    }
    checkAuth();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setShowMenu(false);
    router.refresh();
  }

  return (
    <div className="brand-gradient pt-2 pb-3 px-4">
      {/* Row 1: Brand + actions */}
      <div className="flex items-center justify-between mb-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center">
            <span className="font-display text-white text-base font-extrabold">T</span>
          </div>
          <div className="font-display text-[18px] font-extrabold text-white tracking-tight">
            Trade<span className="text-[#FFE566] not-italic">Hub</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher className="text-white [&_button]:text-white [&_button:hover]:text-[#FFE566]" />
          <div className="relative">
            <Bell className="w-5 h-5 text-white" strokeWidth={1.8} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FFE566] border-[1.5px] border-[#FF6A00]" />
          </div>

          {/* User menu */}
          <div className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center"
                >
                  <span className="text-white text-xs font-bold">
                    {user.email?.charAt(0).toUpperCase() ?? "U"}
                  </span>
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-sm font-medium text-neutral-900 truncate">{user.email}</p>
                    </div>
                    <Link href={`/${locale}/account`} className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                      {t.common.account}
                    </Link>
                    <Link href={`/${locale}/orders`} className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                      {t.common.myOrders}
                    </Link>
                    <button
                      onClick={signOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.common.signOut}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="text-white text-xs font-semibold px-3 py-1.5 bg-white/20 rounded-lg border border-white/30"
              >
                {t.common.signIn}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search row */}
      <div className="flex gap-1.5 pb-2.5">
        <div className="flex-1 bg-white rounded-xl flex items-center gap-2 px-3 py-2 shadow-sm">
          <Search className="w-4 h-4 text-neutral-400" strokeWidth={2} />
          <span className="text-[12.5px] text-neutral-400 truncate">
            {t.common.searchPlaceholder}
          </span>
        </div>
        <button
          aria-label="Search by image"
          className="bg-white/20 rounded-xl px-3 py-2 border border-white/35 flex items-center justify-center"
        >
          <Camera className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-0 overflow-x-auto no-scrollbar -mx-1">
        {categoryTabs.map((tab) => {
          const on = tab === active;
          return (
            <Link
              key={tab}
              href={`/en/products?category=${encodeURIComponent(tab)}`}
              className={[
                "px-3.5 py-1.5 rounded-full text-[11.5px] whitespace-nowrap font-medium transition flex-shrink-0 mx-0.5",
                on
                  ? "bg-white text-[#FF6A00] font-semibold shadow"
                  : "text-white/80 hover:text-white",
              ].join(" ")}
            >
              {tab}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
