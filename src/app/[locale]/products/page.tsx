import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Zap, BadgeCheck } from "lucide-react";

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, category, base_price, moq, image_url, is_flash_deal, profiles!supplier_id(full_name, company_name)")
    .order("created_at", { ascending: false });

  const products = data ?? [];

  return (
    <main className="min-h-screen bg-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-neutral-900">All Products</h1>
            <p className="text-neutral-500 mt-1">Browse products listed by verified suppliers.</p>
          </div>
          <span className="text-sm text-neutral-500">{products.length} products</span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error.message}
          </div>
        )}

        {products.length === 0 ? (
          <p className="p-12 text-center text-neutral-400 bg-white rounded-xl border border-neutral-200 shadow-sm">
            No products available yet.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product: any) => {
              const supplier = (product as any).profiles as { full_name?: string; company_name?: string } | null;
              const supplierName = supplier?.company_name ?? supplier?.full_name ?? "—";
              return (
                <Link
                  key={product.id}
                  href={`/${locale}/products/${product.slug ?? product.id}`}
                  className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div className="h-48 bg-neutral-100 flex items-center justify-center relative">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
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
                      <span className="text-xs text-neutral-500">MOQ {product.moq} units</span>
                    </div>
                    <div className="mt-auto flex items-center justify-between text-xs text-neutral-500 pt-3 border-t border-neutral-100">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-neutral-700 truncate max-w-[140px]">
                          {supplierName}
                        </span>
                        {supplierName !== "—" && (
                          <BadgeCheck className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <span className="text-[#FF6A00] font-medium group-hover:underline">View details</span>
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
