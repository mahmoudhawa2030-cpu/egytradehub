"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

type Props = {
  /** Initial seconds remaining for the deal (default ~5h44m9s). */
  initialSeconds?: number;
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function FlashDealsBar({ initialSeconds = 5 * 3600 + 44 * 60 + 9 }: Props) {
  const [sec, setSec] = useState(initialSeconds);

  useEffect(() => {
    if (sec <= 0) return;
    const id = setInterval(() => setSec((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [sec]);

  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  return (
    <div className="mx-2.5 mt-2.5 bg-neutral-900 rounded-2xl px-3.5 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#FF6A00] flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white fill-white" strokeWidth={2} />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-white">Flash deals</div>
          <div className="text-[10px] text-neutral-500 mt-px">Limited stock at bulk rates</div>
        </div>
      </div>
      <div className="flex gap-1 items-center">
        <Digit value={pad(h)} />
        <span className="text-neutral-600 text-sm font-semibold">:</span>
        <Digit value={pad(m)} />
        <span className="text-neutral-600 text-sm font-semibold">:</span>
        <Digit value={pad(s)} />
      </div>
    </div>
  );
}

function Digit({ value }: { value: string }) {
  return (
    <div className="bg-[#FF6A00] text-white font-display text-sm font-bold px-2 py-1 rounded-md min-w-[28px] text-center tabular-nums">
      {value}
    </div>
  );
}
