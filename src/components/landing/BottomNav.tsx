"use client";

import { Home, Search, Package, MessageSquare, User } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/i18n/context";

type NavItem = {
  id: string;
  label: string;
  Icon: typeof Home;
  dot?: boolean;
};

export default function BottomNav() {
  const { t } = useI18n();
  const [active, setActive] = useState<string>("home");

  const ITEMS: NavItem[] = [
    { id: "home",     label: t.nav.home,     Icon: Home },
    { id: "search",   label: t.nav.search,   Icon: Search },
    { id: "orders",   label: t.nav.orders,   Icon: Package, dot: true },
    { id: "messages", label: t.nav.messages, Icon: MessageSquare },
    { id: "account",  label: t.nav.account,  Icon: User },
  ];

  return (
    <nav className="bg-white border-t border-neutral-200 flex pt-2 pb-3.5">
      {ITEMS.map(({ id, label, Icon, dot }) => {
        const on = id === active;
        return (
          <button
            key={id}
            onClick={() => setActive(id)}
            className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
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
          </button>
        );
      })}
    </nav>
  );
}
