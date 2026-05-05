import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Zap, BadgeCheck, ChevronRight, Home } from "lucide-react";

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; sub?: string }>;
}) {
  const { locale } = await params;
  const { category: categoryParam, sub: subParam } = await searchParams;
  const supabase = await createClient();

  // ── Resolve the requested parent category from DB ──────────────
  let parentCategory: { id: string; name: string; slug: string } | null = null;
  let subcategories: { id: string; name: string; slug: string; thumbnail_url: string | null }[] = [];

  if (categoryParam) {
    const { data: matched } = await supabase
      .from("categories")
      .select("id, name, slug")
      .ilike("name", categoryParam)
      .is("parent_id", null)
      .maybeSingle();

    if (matched) {
      parentCategory = matched;
      const { data: subs } = await supabase
        .from("categories")
        .select("id, name, slug, thumbnail_url")
        .eq("parent_id", matched.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      subcategories = subs ?? [];
    }
  }

  // ── Active sub filter (from ?sub= or fall back to parent) ──────
  const activeSubName = subParam ?? null;

  // ── Fetch products ─────────────────────────────────────────────
  let query = supabase
    .from("products")
    .select("id, slug, name, category, base_price, moq, image_url, is_flash_deal, profiles!supplier_id(full_name, company_name)")
    .order("created_at", { ascending: false });

  if (activeSubName) {
    query = query.ilike("category", activeSubName);
  } else if (categoryParam) {
    query = query.ilike("category", categoryParam);
  }

  const { data, error } = await query;
  const products = data ?? [];

  const pageTitle = parentCategory?.name ?? "All Products";

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
            {parentCategory ? (
              <>
                <li>
                  <Link href={`/${locale}/products?category=${encodeURIComponent(parentCategory.name)}`} className="hover:text-neutral-800 transition-colors">
                    Products
                  </Link>
                </li>
                <li className="flex items-center"><ChevronRight className="w-3.5 h-3.5 text-neutral-300" /></li>
                <li className={activeSubName ? "hover:text-neutral-800" : "text-neutral-900 font-medium"}>
                  {activeSubName ? (
                    <Link href={`/${locale}/products?category=${encodeURIComponent(parentCategory.name)}`} className="hover:text-neutral-800 transition-colors">
                      {parentCategory.name}
                    </Link>
                  ) : (
                    <span aria-current="page">{parentCategory.name}</span>
                  )}
                </li>
                {activeSubName && (
                  <>
                    <li className="flex items-center"><ChevronRight className="w-3.5 h-3.5 text-neutral-300" /></li>
                    <li className="text-neutral-900 font-medium" aria-current="page">{activeSubName}</li>
                  </>
                )}
              </>
            ) : (
              <li className="text-neutral-900 font-medium" aria-current="page">Products</li>
            )}
          </ol>
        </nav>

        {/* Subcategory picker strip */}
        {subcategories.length > 0 && (
          <div className="mb-6 bg-white rounded-xl border border-neutral-200 shadow-sm px-6 py-5">
            <p className="text-sm font-semibold text-neutral-800 mb-4">Source by category</p>
            <div className="flex gap-6 overflow-x-auto pb-1 scrollbar-hide">
              {/* "All" chip */}
              <Link
                href={`/${locale}/products?category=${encodeURIComponent(parentCategory!.name)}`}
                className={`flex flex-col items-center gap-2 flex-shrink-0 group`}
              >
                <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center overflow-hidden bg-neutral-50 transition-colors ${!activeSubName ? "border-[#FF6A00]" : "border-neutral-200 group-hover:border-neutral-400"}`}>
                  <span className="text-xs font-semibold text-neutral-500">All</span>
                </div>
                <span className={`text-xs text-center leading-tight max-w-[72px] ${!activeSubName ? "text-[#FF6A00] font-semibold" : "text-neutral-600"}`}>
                  All
                </span>
              </Link>

              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/${locale}/products?category=${encodeURIComponent(parentCategory!.name)}&sub=${encodeURIComponent(sub.name)}`}
                  className="flex flex-col items-center gap-2 flex-shrink-0 group"
                >
                  <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center overflow-hidden bg-neutral-50 transition-colors ${activeSubName === sub.name ? "border-[#FF6A00]" : "border-neutral-200 group-hover:border-neutral-400"}`}>
                    {sub.thumbnail_url ? (
                      <img src={sub.thumbnail_url} alt={sub.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-semibold text-neutral-400 text-center px-1 leading-tight">
                        {sub.name.split(" ").slice(0, 2).join(" ")}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs text-center leading-tight max-w-[72px] line-clamp-2 ${activeSubName === sub.name ? "text-[#FF6A00] font-semibold" : "text-neutral-600"}`}>
                    {sub.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{activeSubName ?? pageTitle}</h1>
            <p className="text-sm text-neutral-500 mt-0.5">{products.length} products found</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error.message}
          </div>
        )}

        {products.length === 0 ? (
          <p className="p-12 text-center text-neutral-400 bg-white rounded-xl border border-neutral-200 shadow-sm">
            No products found{activeSubName ? ` in "${activeSubName}"` : ""}.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product: any) => {
              const supplier = product.profiles as { full_name?: string; company_name?: string } | null;
              const supplierName = supplier?.company_name ?? supplier?.full_name ?? "—";
              return (
                <Link
                  key={product.id}
                  href={`/${locale}/products/${product.slug ?? product.id}`}
                  className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div className="h-44 bg-neutral-100 flex items-center justify-center relative">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-neutral-400">No image</span>
                    )}
                    {product.is_flash_deal && (
                      <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded bg-[#FF6A00] text-white text-xs font-semibold">
                        <Zap className="w-3 h-3" /> Flash deal
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h2 className="font-medium text-neutral-900 line-clamp-2 group-hover:text-[#FF6A00] transition mb-1">
                      {product.name}
                    </h2>
                    <p className="text-xs text-neutral-500 mb-3 truncate">{product.category}</p>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-bold text-[#FF6A00]">
                        ${Number(product.base_price).toLocaleString()}
                      </span>
                      <span className="text-xs text-neutral-500">MOQ {product.moq}</span>
                    </div>
                    <div className="mt-auto flex items-center justify-between text-xs text-neutral-500 pt-3 border-t border-neutral-100">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-neutral-700 truncate max-w-[120px]">{supplierName}</span>
                        {supplierName !== "—" && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                      </div>
                      <span className="text-[#FF6A00] font-medium group-hover:underline">View →</span>
                    </div>
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
