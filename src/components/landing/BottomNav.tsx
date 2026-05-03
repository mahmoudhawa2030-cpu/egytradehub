"use client";

import { Home, Search, Package, MessageSquare, User } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/context";

type NavItem = {
  id: string;
  label: string;
  Icon: typeof Home;
  href: string;
  dot?: boolean;
};

export default function BottomNav() {
  const { t, locale } = useI18n();
  const [active, setActive] = useState<string>("home");

  const ITEMS: NavItem[] = [
    { id: "home",     label: t.nav.home,     Icon: Home,          href: `/${locale}` },
    { id: "search",   label: t.nav.search,   Icon: Search,        href: `/${locale}/search` },
    { id: "orders",   label: t.nav.orders,   Icon: Package,       href: `/${locale}/orders`, dot: true },
    { id: "messages", label: t.nav.messages, Icon: MessageSquare, href: `/${locale}/messages` },
    { id: "account",  label: t.nav.account,  Icon: User,          href: `/${locale}/account` },
  ];

  return (
    <nav className="bg-white border-t border-neutral-200 flex pt-2 pb-3.5">
      {ITEMS.map(({ id, label, Icon, dot, href }) => {
        const on = id === active;
        return (
          <Link
            key={id}
            href={href}
            onClick={() => setActive(id)}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <div className="relative w-[21px] h-[21px]">
              <Icon
                className={`w-[21px] h-[21px] ${on ? "text-[#FF6A00]" : "text-neutral-300"}`}
                strokeWidth={1.8}
              />
              {dot && (
                <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-[#FFE566] rounded-full border-[1.5px] border-white" />
              )}
            </div>
            <span
              className={`text-[10px] font-medium ${
                on ? "text-[#FF6A00]" : "text-neutral-300"
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
