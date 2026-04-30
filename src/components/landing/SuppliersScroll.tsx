import { Star } from "lucide-react";
import { topSuppliers } from "./data";

export default function SuppliersScroll() {
  return (
    <section className="mx-2.5 mt-2.5">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-semibold text-neutral-900">Top suppliers</h2>
        <button className="text-xs text-[#FF6A00] font-medium">Directory ›</button>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {topSuppliers.map((s) => (
          <article
            key={s.id}
            className="flex-shrink-0 w-[138px] bg-white rounded-2xl p-2.5 border border-neutral-200 cursor-pointer"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold mb-1.5 ${s.bg} ${s.fg}`}
            >
              {s.initials}
            </div>
            <div className="text-xs font-semibold text-neutral-900 mb-px leading-tight">
              {s.name}
            </div>
            <div className="text-[10px] text-neutral-400">
              {s.years} yrs · {s.productCount.toLocaleString()} products
            </div>
            <div className="flex items-center gap-1 text-[10.5px] text-[#FF6A00] mt-1 font-medium">
              <Star className="w-3 h-3 fill-[#FF6A00] stroke-[#FF6A00]" />
              {s.rating} ({s.reviewCount} reviews)
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {s.tags.map((t) => (
                <span
                  key={t}
                  className="text-[9.5px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
