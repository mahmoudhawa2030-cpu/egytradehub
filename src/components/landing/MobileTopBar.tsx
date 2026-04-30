"use client";

import { Bell, User2, Search, Camera } from "lucide-react";
import { useState } from "react";
import { categoryTabs } from "./data";

export default function MobileTopBar() {
  const [active, setActive] = useState<string>("All");

  return (
    <div className="brand-gradient pt-2 pb-3 px-4">
      {/* Row 1: Brand + actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center">
            <span className="font-display text-white text-base font-extrabold">T</span>
          </div>
          <div className="font-display text-[18px] font-extrabold text-white tracking-tight">
            Trade<span className="text-[#FFE566] not-italic">Hub</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-5 h-5 text-white" strokeWidth={1.8} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FFE566] border-[1.5px] border-[#FF6A00]" />
          </div>
          <User2 className="w-5 h-5 text-white" strokeWidth={1.8} />
        </div>
      </div>

      {/* Search row */}
      <div className="flex gap-1.5 pb-2.5">
        <div className="flex-1 bg-white rounded-xl flex items-center gap-2 px-3 py-2 shadow-sm">
          <Search className="w-4 h-4 text-neutral-400" strokeWidth={2} />
          <span className="text-[12.5px] text-neutral-400 truncate">
            Search 50,000+ wholesale products
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
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={[
                "px-3.5 py-1.5 rounded-full text-[11.5px] whitespace-nowrap font-medium transition flex-shrink-0 mx-0.5",
                on
                  ? "bg-white text-[#FF6A00] font-semibold shadow"
                  : "text-white/80 hover:text-white",
              ].join(" ")}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}
