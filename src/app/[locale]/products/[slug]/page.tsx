import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChevronRight, Home } from "lucide-react";
import ProductGallery from "@/components/product/ProductGallery";
import ProductActions from "@/components/product/ProductActions";

export default async function ProductDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("id, slug, name, description, category, base_price, moq, image_url, gallery_images, is_flash_deal, flash_discount_pct, flash_starts_at, flash_ends_at, supplier_id, profiles!supplier_id(full_name, company_name)")
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
  const supplierId: string = (product as any).supplier_id;

  const gallery = (product as any).gallery_images as string[] | null;
  const images: string[] = gallery?.length ? gallery : (product.image_url ? [product.image_url] : []);

  const discountedPrice = product.is_flash_deal && product.flash_discount_pct
    ? Number(product.base_price) * (1 - Number(product.flash_discount_pct) / 100)
    : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://egytradehub.vercel.app";
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",     item: `${siteUrl}/${locale}` },
      { "@type": "ListItem", position: 2, name: "Products", item: `${siteUrl}/${locale}/products` },
      { "@type": "ListItem", position: 3, name: product.category, item: `${siteUrl}/${locale}/products?category=${encodeURIComponent(product.category)}` },
      { "@type": "ListItem", position: 4, name: product.name, item: `${siteUrl}/${locale}/products/${product.slug}` },
    ],
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
            <li>
              <Link href={`/${locale}/products`} className="hover:text-neutral-800 transition-colors">
                Products
              </Link>
            </li>
            <li className="flex items-center"><ChevronRight className="w-3.5 h-3.5 text-neutral-300" /></li>
            <li>
              <Link
                href={`/${locale}/products?category=${encodeURIComponent(product.category)}`}
                className="hover:text-neutral-800 transition-colors"
              >
                {product.category}
              </Link>
            </li>
            <li className="flex items-center"><ChevronRight className="w-3.5 h-3.5 text-neutral-300" /></li>
            <li className="text-neutral-900 font-medium truncate max-w-[260px]" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

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
              <ProductActions
                productId={product.id}
                productName={product.name}
                supplierId={supplierId}
                locale={locale}
              />
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
