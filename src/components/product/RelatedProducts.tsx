import Link from "next/link";
import { Zap } from "lucide-react";

interface RelatedProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  base_price: number;
  image_url: string | null;
  gallery_images: string[] | null;
  is_flash_deal: boolean;
  flash_discount_pct: number | null;
}

interface RelatedProductsProps {
  products: RelatedProduct[];
  locale: string;
}

export default function RelatedProducts({ products, locale }: RelatedProductsProps) {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-neutral-900">Related Products</h2>
        <Link
          href={`/${locale}/products?category=${encodeURIComponent(products[0]?.category ?? "")}`}
          className="text-sm text-[#FF6A00] hover:underline font-medium"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((p) => {
          const imgs = p.gallery_images?.length ? p.gallery_images : (p.image_url ? [p.image_url] : []);
          const thumb = imgs[0] ?? null;
          const discounted = p.is_flash_deal && p.flash_discount_pct
            ? Number(p.base_price) * (1 - Number(p.flash_discount_pct) / 100)
            : null;

          return (
            <Link
              key={p.id}
              href={`/${locale}/products/${p.slug}`}
              className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md hover:border-[#FF6A00]/40 transition-all"
            >
              {/* Image */}
              <div className="relative aspect-square bg-white overflow-hidden">
                {thumb ? (
                  <img
                    src={thumb}
                    alt={p.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-200">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {p.is_flash_deal && (
                  <div className="absolute top-2 left-2 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#FF6A00] text-white text-[10px] font-bold">
                    <Zap className="w-2.5 h-2.5" /> DEAL
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-[11px] text-[#FF6A00] font-semibold uppercase tracking-wide mb-0.5 truncate">
                  {p.category}
                </p>
                <p className="text-sm font-semibold text-neutral-800 line-clamp-1 truncate mb-2">
                  {p.name}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-bold text-neutral-900">
                    ${discounted
                      ? discounted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : Number(p.base_price).toLocaleString()}
                  </span>
                  {discounted && (
                    <span className="text-xs text-neutral-400 line-through">
                      ${Number(p.base_price).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
