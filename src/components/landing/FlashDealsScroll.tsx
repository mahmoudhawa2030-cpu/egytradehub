import Link from "next/link";
import { Package } from "lucide-react";

type DbDeal = {
  id: string;
  name: string;
  base_price: number;
  moq: number;
  image_url: string | null;
  flash_discount_pct: number | null;
};

const BG_CYCLE = ["bg-orange-100", "bg-green-100", "bg-blue-100", "bg-yellow-100", "bg-pink-100"];

export default function FlashDealsScroll({ deals, locale }: { deals: DbDeal[]; locale: string }) {
  if (!deals.length) return null;

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-2.5 pt-2.5 pb-1">
      {deals.map((d, i) => {
        const discount = d.flash_discount_pct ? Number(d.flash_discount_pct) : 0;
        const priceLow = discount > 0
          ? Number(d.base_price) * (1 - discount / 100)
          : Number(d.base_price);
        return (
          <Link
            key={d.id}
            href={`/${locale}/products/${d.id}`}
            className="flex-shrink-0 w-[148px] bg-white rounded-2xl overflow-hidden border border-neutral-200"
          >
            <div className={`h-[90px] flex items-center justify-center relative overflow-hidden ${!d.image_url ? BG_CYCLE[i % BG_CYCLE.length] : ""}`}>
              {discount > 0 && (
                <span className="absolute top-1.5 left-1.5 bg-[#FF6A00] text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded z-10">
                  -{discount.toFixed(0)}%
                </span>
              )}
              {d.image_url ? (
                <img src={d.image_url} alt={d.name} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-10 h-10 text-neutral-500/60" strokeWidth={1.5} />
              )}
            </div>
            <div className="px-2.5 py-2">
              <div className="text-[11.5px] text-neutral-900 leading-snug line-clamp-2 mb-1 min-h-[2.6em]">
                {d.name}
              </div>
              <div className="text-sm font-semibold text-[#FF6A00]">
                ${priceLow.toFixed(2)}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">MOQ {d.moq} units</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
