import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Zap, ArrowLeft } from "lucide-react";

export default async function ProductDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, description, category, base_price, moq, image_url, is_flash_deal, flash_discount_pct, flash_starts_at, flash_ends_at, profiles!supplier_id(full_name, company_name)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error loading product", error.message);
  }

  if (!product) {
    notFound();
  }

  const supplier = (product as any).profiles as { full_name?: string; company_name?: string } | null;
  const supplierName = supplier?.company_name ?? supplier?.full_name ?? "—";

  return (
    <main className="min-h-screen bg-neutral-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/products`}
              className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to products
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
          <div className="relative bg-neutral-100 min-h-[260px] flex items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-neutral-400">No image available</span>
            )}
            {product.is_flash_deal && (
              <div className="absolute top-4 left-4 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#FF6A00] text-white text-xs font-semibold">
                <Zap className="w-3 h-3" /> Flash deal
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 flex flex-col gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-[#FF6A00] mb-1">{product.category}</p>
              <h1 className="text-2xl font-display font-bold text-neutral-900 mb-2">{product.name}</h1>
            </div>

            {product.description && (
              <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}

            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-2xl font-bold text-[#FF6A00]">
                ${Number(product.base_price).toLocaleString()}
              </span>
              <span className="text-sm text-neutral-500">MOQ {product.moq} units</span>
            </div>

            {product.is_flash_deal && product.flash_discount_pct && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-xs text-[#FF6A00] font-medium">
                <Zap className="w-3 h-3" />
                Limited-time discount: {Number(product.flash_discount_pct).toFixed(0)}%
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-col gap-2 text-sm text-neutral-600">
              <div>
                <span className="font-medium text-neutral-800">Supplier:</span>{" "}
                <span>{supplierName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
