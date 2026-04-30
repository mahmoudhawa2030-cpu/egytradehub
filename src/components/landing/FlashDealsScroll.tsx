import { Package } from "lucide-react";
import { flashDeals } from "./data";

export default function FlashDealsScroll() {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-2.5 pt-2.5 pb-1">
      {flashDeals.map((d) => (
        <div
          key={d.id}
          className="flex-shrink-0 w-[148px] bg-white rounded-2xl overflow-hidden border border-neutral-200"
        >
          <div className={`h-[90px] flex items-center justify-center relative ${d.bg}`}>
            <span className="absolute top-1.5 left-1.5 bg-[#FF6A00] text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded">
              -{d.discountPct}%
            </span>
            <Package className="w-10 h-10 text-neutral-500/60" strokeWidth={1.5} />
          </div>
          <div className="px-2.5 py-2">
            <div className="text-[11.5px] text-neutral-900 leading-snug line-clamp-2 mb-1 min-h-[2.6em]">
              {d.name}
            </div>
            <div className="text-sm font-semibold text-[#FF6A00]">
              ${d.priceLow} – ${d.priceHigh}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">MOQ {d.moq} units</div>
            <div className="h-[3px] bg-neutral-200 rounded-full mt-1.5">
              <div
                className="h-full bg-[#FF6A00] rounded-full"
                style={{ width: `${d.claimedPct}%` }}
              />
            </div>
            <div className="text-[9.5px] text-[#FF6A00] mt-1 font-medium">
              {d.claimedPct}% claimed
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
