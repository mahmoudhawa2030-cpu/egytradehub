import { Heart, Package } from "lucide-react";
import { trendingProducts } from "./data";

const TONE_MAP = {
  hot:  "bg-orange-100 text-orange-800",
  new:  "bg-green-100 text-green-800",
  deal: "bg-amber-100 text-amber-800",
} as const;

export default function TrendingProducts() {
  return (
    <section className="mx-2.5 mt-2.5">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-semibold text-neutral-900">Trending now</h2>
        <button className="text-xs text-[#FF6A00] font-medium">See all ›</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {trendingProducts.map((p) => (
          <article
            key={p.id}
            className="bg-white rounded-2xl overflow-hidden border border-neutral-200 cursor-pointer"
          >
            <div className={`h-[102px] flex items-center justify-center relative ${p.bg}`}>
              {p.badge && (
                <span
                  className={`absolute top-1.5 left-1.5 text-[9.5px] px-1.5 py-0.5 rounded font-semibold ${TONE_MAP[p.badge.tone]}`}
                >
                  {p.badge.label}
                </span>
              )}
              <button
                aria-label="Save"
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/95 rounded-full flex items-center justify-center shadow"
              >
                <Heart className="w-3 h-3 text-[#FF6A00]" strokeWidth={2} />
              </button>
              <Package className="w-10 h-10 text-neutral-500/60" strokeWidth={1.5} />
            </div>
            <div className="px-2.5 py-2">
              <div className="text-[11.5px] text-neutral-900 leading-snug line-clamp-2 mb-1 min-h-[2.6em]">
                {p.name}
              </div>
              <div className="text-sm font-semibold text-[#FF6A00]">
                ${p.basePrice}
              </div>
              <div className="text-[10.5px] text-neutral-400">
                ${p.priceLow} – ${p.priceHigh} / unit
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">MOQ {p.moq} units</div>
              <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-neutral-100">
                <span className="text-[10px] text-neutral-500 truncate flex-1">{p.supplier}</span>
                {p.verified && (
                  <span className="text-[9.5px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-semibold flex-shrink-0">
                    Verified
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
