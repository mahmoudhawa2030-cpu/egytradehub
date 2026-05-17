import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Zap } from "lucide-react";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug, locale } = await params;
  const supabase = await createClient();

  // Get parent category
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug, thumbnail_url, icon")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!category) notFound();

  // Get subcategories (3x3 = 9 max)
  const { data: subcategories } = await supabase
    .from("categories")
    .select("id, name, slug, thumbnail_url, icon")
    .eq("parent_id", category.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(9);

  const subs = subcategories || [];

  // If no subcategories, fetch products for this category
  let products: any[] = [];
  if (subs.length === 0) {
    const { data } = await supabase
      .from("products")
      .select("id, slug, name, category, base_price, image_url, gallery_images, is_flash_deal, flash_discount_pct")
      .eq("category", category.name)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(50);
    products = data || [];
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href={`/${locale}`} className="p-2 -ml-2 hover:bg-neutral-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </Link>
          <h1 className="font-semibold text-neutral-900">{category.name}</h1>
        </div>
      </div>

      {/* Subcategories Grid 3x3 */}
      <div className="p-4">
        {subs.length > 0 ? (
          <>
            <p className="text-sm text-neutral-500 mb-4">Select a subcategory</p>
            <div className="grid grid-cols-3 gap-3">
              {subs.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/${locale}/categories/${sub.slug}`}
                  className="bg-white rounded-xl p-3 border border-neutral-200 flex flex-col items-center gap-2 hover:border-[#FF6A00] transition active:scale-95"
                >
                  <div className="w-16 h-16 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden">
                    {sub.thumbnail_url ? (
                      <img
                        src={sub.thumbnail_url}
                        alt={sub.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-neutral-400" />
                    )}
                  </div>
                  <span className="text-xs text-neutral-700 text-center font-medium line-clamp-2 leading-tight">
                    {sub.name}
                  </span>
                </Link>
              ))}
            </div>
            <Link
              href={`/${locale}/products?category=${encodeURIComponent(category.name)}`}
              className="mt-6 block w-full py-3 bg-[#FF6A00] text-white text-center rounded-xl font-medium hover:bg-[#e05e00] transition"
            >
              View all {category.name} products
            </Link>
          </>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
            <p>No products found in this category yet</p>
          </div>
        ) : (
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
                  <div className="relative aspect-square bg-white overflow-hidden">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={p.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-200">
                        <Package className="w-10 h-10" />
                      </div>
                    )}
                    {p.is_flash_deal && (
                      <div className="absolute top-2 left-2 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#FF6A00] text-white text-[10px] font-bold">
                        <Zap className="w-2.5 h-2.5" /> DEAL
                      </div>
                    )}
                  </div>
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
        )}
      </div>
    </div>
  );
}
