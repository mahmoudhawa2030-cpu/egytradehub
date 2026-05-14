import Link from "next/link";
import { Heart, Package } from "lucide-react";

type DbProduct = {
  id: string;
  slug?: string | null;
  name: string;
  category: string;
  base_price: number;
  moq: number;
  image_url: string | null;
  is_flash_deal: boolean;
  profiles?: { full_name?: string; company_name?: string } | null;
};

const BG_CYCLE = ["bg-orange-100", "bg-green-100", "bg-blue-100", "bg-purple-100", "bg-yellow-100", "bg-pink-100"];

export default function TrendingProducts({ products, locale }: { products: DbProduct[]; locale: string }) {
  if (!products.length) return null;

  return (
    <section className="mx-2.5 mt-2.5">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-semibold text-neutral-900">Trending now</h2>
        <Link href={`/${locale}/products`} className="text-xs text-[#FF6A00] font-medium">See all ›</Link>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {products.map((p, i) => {
          const supplier = p.profiles?.company_name ?? p.profiles?.full_name ?? "Supplier";
          return (
            <Link
              key={p.id}
              href={`/${locale}/products/${p.slug ?? p.id}`}
              className="bg-white rounded-2xl overflow-hidden border border-neutral-200 cursor-pointer block"
            >
              <div className={`h-[140px] bg-white flex items-center justify-center relative overflow-hidden ${!p.image_url ? BG_CYCLE[i % BG_CYCLE.length] : ""}`}>
                {p.is_flash_deal && (
                  <span className="absolute top-2 left-2 text-[9.5px] px-2 py-1 rounded font-semibold bg-[#FF6A00] text-white z-10">
                    Flash
                  </span>
                )}
                <span className="absolute top-2 right-2 w-7 h-7 bg-white/95 rounded-full flex items-center justify-center shadow z-10">
                  <Heart className="w-3.5 h-3.5 text-[#FF6A00]" strokeWidth={2} />
                </span>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" />
                ) : (
                  <Package className="w-12 h-12 text-neutral-500/60" strokeWidth={1.5} />
                )}
              </div>
              <div className="px-2.5 py-2">
                <div className="text-[11.5px] text-neutral-900 leading-snug line-clamp-1 mb-1 truncate">
                  {p.name}
                </div>
                <div className="text-sm font-semibold text-[#FF6A00]">
                  ${Number(p.base_price).toLocaleString()}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">MOQ {p.moq} units</div>
                <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-neutral-100">
                  <span className="text-[10px] text-neutral-500 truncate flex-1">{supplier}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
