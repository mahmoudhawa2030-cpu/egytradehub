import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Search, Home, ChevronRight, Zap } from "lucide-react";

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q = "" } = await searchParams;
  const supabase = await createClient();

  let products: any[] = [];

  if (q.trim()) {
    let query = supabase
      .from("products")
      .select("id, slug, name, category, base_price, image_url, gallery_images, is_flash_deal, flash_discount_pct, profiles!supplier_id(full_name, company_name)", { count: "exact" })
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`).limit(40);

    const { data } = await query;
    products = data ?? [];
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex items-center flex-wrap gap-1 text-sm text-neutral-500">
            <li>
              <Link href={`/${locale}`} className="inline-flex items-center gap-1 hover:text-neutral-800 transition-colors">
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
            </li>
            <li className="flex items-center"><ChevronRight className="w-3.5 h-3.5 text-neutral-300" /></li>
            <li className="text-neutral-900 font-medium">Search results</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6">
          {q.trim() ? (
            <>
              <h1 className="text-2xl font-bold text-neutral-900">
                Results for <span className="text-[#FF6A00]">&ldquo;{q}&rdquo;</span>
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                {products.length === 0
                  ? "No products found"
                  : `${products.length} product${products.length !== 1 ? "s" : ""} found`}
              </p>
            </>
          ) : (
            <h1 className="text-2xl font-bold text-neutral-900">Search Products</h1>
          )}
        </div>

        {/* No query state */}
        {!q.trim() && (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-16 flex flex-col items-center gap-4 text-center">
            <Search className="w-14 h-14 text-neutral-200" />
            <p className="text-neutral-500">Enter a search term in the search bar above to find products.</p>
          </div>
        )}

        {/* No results */}
        {q.trim() && products.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-16 flex flex-col items-center gap-4 text-center">
            <Search className="w-14 h-14 text-neutral-200" />
            <p className="text-lg font-semibold text-neutral-700">No products found for &ldquo;{q}&rdquo;</p>
            <p className="text-sm text-neutral-400">Try different keywords or browse by category.</p>
            <Link
              href={`/${locale}/products`}
              className="mt-2 px-6 py-2.5 bg-[#FF6A00] text-white rounded-lg font-semibold text-sm hover:bg-[#e05e00] transition"
            >
              Browse All Products
            </Link>
          </div>
        )}

        {/* Results grid */}
        {products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p) => {
              const imgs = p.gallery_images?.length ? p.gallery_images : (p.image_url ? [p.image_url] : []);
              const thumb = imgs[0] ?? null;
              const supplier = p.profiles as { full_name?: string; company_name?: string } | null;
              const supplierName = supplier?.company_name ?? supplier?.full_name ?? null;
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
                  <div className="relative aspect-square bg-neutral-50 overflow-hidden">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-200">
                        <Search className="w-10 h-10" />
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
                    <p className="text-sm font-semibold text-neutral-800 line-clamp-2 leading-snug mb-1.5">
                      {p.name}
                    </p>
                    <div className="flex items-baseline gap-1.5 mb-1">
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
                    {supplierName && (
                      <p className="text-[11px] text-neutral-400 truncate">{supplierName}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
