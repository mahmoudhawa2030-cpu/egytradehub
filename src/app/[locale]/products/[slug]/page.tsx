import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import ProductGallery from "@/components/product/ProductGallery";

export default async function ProductDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("id, slug, name, description, category, base_price, moq, image_url, is_flash_deal, flash_discount_pct, flash_starts_at, flash_ends_at, profiles!supplier_id(full_name, company_name)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error loading product", error.message);
  }

  if (!product) {
    notFound();
  }

  const supplier = (product as any).profiles as { full_name?: string; company_name?: string } | null;
  const supplierName = supplier?.company_name ?? supplier?.full_name ?? "—";

  const images: string[] = product.image_url ? [product.image_url] : [];

  const discountedPrice = product.is_flash_deal && product.flash_discount_pct
    ? Number(product.base_price) * (1 - Number(product.flash_discount_pct) / 100)
    : null;

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </Link>

        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr]">
            {/* ── LEFT: Gallery ── */}
            <div className="border-b lg:border-b-0 lg:border-r border-neutral-100 p-6">
              <ProductGallery
                images={images}
                productName={product.name}
                isFlashDeal={!!product.is_flash_deal}
              />
            </div>

            {/* ── RIGHT: Info ── */}
            <div className="p-6 md:p-8 flex flex-col gap-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#FF6A00] font-semibold mb-2">
                  {product.category}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 leading-snug">
                  {product.name}
                </h1>
              </div>

              {/* Price */}
              <div className="flex items-end gap-3 py-3 border-y border-neutral-100">
                {discountedPrice ? (
                  <>
                    <span className="text-3xl font-bold text-[#FF6A00]">
                      ${discountedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-lg text-neutral-400 line-through">
                      ${Number(product.base_price).toLocaleString()}
                    </span>
                    <span className="ml-1 text-xs font-semibold bg-orange-100 text-[#FF6A00] px-2 py-0.5 rounded-full">
                      -{Number(product.flash_discount_pct).toFixed(0)}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-[#FF6A00]">
                    ${Number(product.base_price).toLocaleString()}
                  </span>
                )}
              </div>

              {/* MOQ */}
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <span className="font-medium text-neutral-800">Min. Order:</span>
                <span>{product.moq} units</span>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <p className="text-sm font-medium text-neutral-800 mb-1">Description</p>
                  <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Supplier */}
              <div className="mt-auto pt-5 border-t border-neutral-100">
                <p className="text-xs text-neutral-400 uppercase tracking-widest mb-1">Supplier</p>
                <p className="text-sm font-semibold text-neutral-800">{supplierName}</p>
              </div>

              {/* CTA buttons */}
              <div className="flex gap-3 mt-2">
                <button className="flex-1 bg-[#FF6A00] hover:bg-[#e05e00] text-white text-sm font-semibold py-3 rounded-lg transition-colors">
                  Send Inquiry
                </button>
                <button className="flex-1 border border-[#FF6A00] text-[#FF6A00] hover:bg-orange-50 text-sm font-semibold py-3 rounded-lg transition-colors">
                  Chat with Supplier
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, description, category")
    .eq("slug", slug)
    .maybeSingle();

  if (!product) return { title: "Product not found" };

  const title = `${product.name} — EgyTradeHub`;
  const description = product.description
    ? product.description.slice(0, 160)
    : `${product.name} in ${product.category}. Wholesale B2B on EgyTradeHub.`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}
