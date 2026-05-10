import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChevronRight, Home } from "lucide-react";
import ProductGallery from "@/components/product/ProductGallery";
import ProductActions from "@/components/product/ProductActions";
import RelatedProducts from "@/components/product/RelatedProducts";
import SpecificationsTable from "@/components/product/SpecificationsTable";

export const revalidate = 60;

export default async function ProductDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("id, slug, name, description, category, base_price, moq, sample_price, specifications, image_url, gallery_images, is_flash_deal, flash_discount_pct, flash_starts_at, flash_ends_at, supplier_id, profiles!supplier_id(full_name, company_name)")
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

  const { data: relatedData } = await supabase
    .from("products")
    .select("id, slug, name, category, base_price, image_url, gallery_images, is_flash_deal, flash_discount_pct")
    .eq("category", product.category)
    .neq("id", product.id)
    .limit(5);
  const related = relatedData ?? [];

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
          <div className="grid grid-cols-1 lg:grid-cols-[610px_1fr]">
            {/* ── LEFT: Gallery ── */}
            <div className="border-b lg:border-b-0 lg:border-r border-neutral-100 p-6">
              <ProductGallery
                images={images}
                productName={product.name}
                isFlashDeal={!!product.is_flash_deal}
              />
            </div>

            {/* ── RIGHT: Info panel ── */}
            <div className="p-6 md:p-8 flex flex-col justify-between" style={{ minHeight: 572 }}>
              {/* Top: name + category */}
              <div>
                <p className="text-xs uppercase tracking-widest text-[#FF6A00] font-semibold mb-1">
                  {product.category}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 leading-snug">
                  {product.name}
                </h1>
              </div>

              {/* Price rows table */}
              <div className="mt-5 rounded-xl border border-neutral-100 overflow-hidden text-sm">
                {/* Unit price */}
                <div className="flex items-center border-b border-neutral-100">
                  <span className="w-36 shrink-0 px-4 py-3 bg-neutral-50 text-neutral-500 font-medium border-r border-neutral-100">
                    Unit Price
                  </span>
                  <div className="px-4 py-3 flex items-baseline gap-2">
                    {discountedPrice ? (
                      <>
                        <span className="text-2xl font-bold text-[#FF6A00]">
                          ${discountedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-sm text-neutral-400 line-through">
                          ${Number(product.base_price).toLocaleString()}
                        </span>
                        <span className="text-xs font-bold bg-orange-100 text-[#FF6A00] px-2 py-0.5 rounded-full">
                          -{Number(product.flash_discount_pct).toFixed(0)}% OFF
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-[#FF6A00]">
                        ${Number(product.base_price).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* MOQ */}
                <div className="flex items-center border-b border-neutral-100">
                  <span className="w-36 shrink-0 px-4 py-3 bg-neutral-50 text-neutral-500 font-medium border-r border-neutral-100">
                    Min. Order
                  </span>
                  <span className="px-4 py-3 text-neutral-800 font-semibold">
                    {product.moq} {product.moq === 1 ? "unit" : "units"}
                  </span>
                </div>

                {/* Sample price */}
                <div className="flex items-center">
                  <span className="w-36 shrink-0 px-4 py-3 bg-neutral-50 text-neutral-500 font-medium border-r border-neutral-100">
                    Sample Price
                  </span>
                  <span className="px-4 py-3 text-neutral-800">
                    {(product as any).sample_price
                      ? <span className="font-semibold text-[#FF6A00]">${Number((product as any).sample_price).toLocaleString()}</span>
                      : <span className="text-neutral-400 italic">Contact supplier</span>
                    }
                  </span>
                </div>
              </div>

              {/* Supplier */}
              <div className="mt-5 flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="w-10 h-10 rounded-full bg-[#FF6A00]/10 flex items-center justify-center shrink-0">
                  <span className="text-[#FF6A00] font-bold text-sm">
                    {supplierName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] text-neutral-400 uppercase tracking-widest">Supplier</p>
                  <p className="text-sm font-semibold text-neutral-800">{supplierName}</p>
                </div>
              </div>

              {/* CTA buttons — pushed to bottom */}
              <div className="mt-auto pt-5">
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

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <RelatedProducts products={related} locale={locale} />
        )}

        {/* ── Description ── */}
        {product.description && (
          <div className="mt-6 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-900">Product Description</h2>
            </div>
            <div className="px-6 py-6">
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>
        )}

        {/* ── Specifications ── */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-900">Product Specifications</h2>
            </div>
            <div className="px-6 py-4">
              <SpecificationsTable defaultSpecs={product.specifications} readOnly />
            </div>
          </div>
        )}
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
