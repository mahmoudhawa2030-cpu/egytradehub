"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Package,
  MessageSquare,
  Heart,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/context";

type Profile = {
  full_name: string | null;
  company_name: string | null;
  country: string | null;
  role: string;
  is_verified: boolean;
};

export default function AccountPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace(`/${locale}/login`);
        return;
      }
      setUser({ id: user.id, email: user.email });

      const { data } = await supabase
        .from("profiles")
        .select("full_name, company_name, country, role, is_verified")
        .eq("user_id", user.id)
        .single();

      setProfile(data ?? null);
      setLoading(false);
    }
    load();
  }, [supabase, router, locale]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-8 h-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = profile?.full_name ?? profile?.company_name ?? user?.email?.split("@")[0] ?? "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  const menuItems = [
    { icon: Package,      label: t.common.myOrders,  href: `/${locale}/orders` },
    { icon: MessageSquare,label: t.common.messages,  href: `/${locale}/messages` },
    { icon: Heart,        label: t.common.wishlist,  href: `/${locale}/wishlist` },
    { icon: Settings,     label: "Settings",         href: `/${locale}/account/settings` },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FF8C00] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-neutral-900 truncate">{displayName}</h1>
                {profile?.is_verified && (
                  <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-neutral-500 truncate">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-[#FF6A00] text-xs font-semibold rounded-full capitalize">
                {profile?.role ?? "buyer"}
              </span>
            </div>
            {profile?.role === "admin" && (
              <Link
                href="/admin/dashboard"
                className="flex-shrink-0 px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-700 transition"
              >
                Admin Panel
              </Link>
            )}
          </div>

          {(profile?.company_name || profile?.country) && (
            <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-2 gap-3 text-sm">
              {profile.company_name && (
                <div>
                  <p className="text-xs text-neutral-400 mb-0.5">Company</p>
                  <p className="font-medium text-neutral-700 truncate">{profile.company_name}</p>
                </div>
              )}
              {profile.country && (
                <div>
                  <p className="text-xs text-neutral-400 mb-0.5">Country</p>
                  <p className="font-medium text-neutral-700">{profile.country}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation menu */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden mb-6">
          {menuItems.map(({ icon: Icon, label, href }, i) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 transition ${
                i < menuItems.length - 1 ? "border-b border-neutral-100" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-[#FF6A00]" />
              </div>
              <span className="flex-1 font-medium text-neutral-800">{label}</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </Link>
          ))}
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 rounded-2xl font-semibold hover:bg-red-50 transition"
        >
          <LogOut className="w-4 h-4" />
          {t.common.signOut}
        </button>
      </div>
    </div>
  );
}
