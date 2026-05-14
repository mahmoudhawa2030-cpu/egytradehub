"use client";

import Link from "next/link";
import { ChevronRight, BadgeCheck, ShoppingCart, Heart, TrendingUp, Package } from "lucide-react";
import { topSuppliers, Supplier } from "./data";
import { useI18n } from "@/i18n/context";

type DbProduct = {
  id: string;
  slug?: string | null;
  name: string;
  category: string;
  base_price: number;
  moq: number;
  image_url: string | null;
  is_flash_deal: boolean;
  flash_discount_pct?: number | null;
  profiles?: { full_name?: string; company_name?: string } | null;
};

function ProductCard({ product, flashBadge }: { product: DbProduct; flashBadge?: boolean }) {
  const { t, locale } = useI18n();
  const supplier = product.profiles?.company_name ?? product.profiles?.full_name ?? "Supplier";
  const discount = product.flash_discount_pct ? Number(product.flash_discount_pct) : 0;
  const priceLow = discount > 0 ? Number(product.base_price) * (1 - discount / 100) : Number(product.base_price);

  return (
    <Link href={`/${locale}/products/${product.slug ?? product.id}`} className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-white flex items-center justify-center relative overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
        ) : (
          <Package className="w-16 h-16 text-neutral-400" strokeWidth={1.5} />
        )}
        {(flashBadge || product.is_flash_deal) && discount > 0 && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold bg-[#FF6A00] text-white">
            -{discount.toFixed(0)}%
          </div>
        )}
        <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-white">
          <Heart className="w-4 h-4 text-neutral-600" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-neutral-900 line-clamp-2 group-hover:text-[#FF6A00] transition mb-2">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-[#FF6A00]">${priceLow.toFixed(2)}</span>
          {discount > 0 && (
            <>
              <span className="text-sm text-neutral-400 line-through">${Number(product.base_price).toFixed(2)}</span>
              <span className="text-xs text-green-600 font-medium">{discount.toFixed(0)}% off</span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
          <span>{t.products.moq}: {product.moq} {t.products.units}</span>
          <span className="truncate max-w-[50%]">{product.category}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm font-medium text-neutral-700 truncate">{supplier}</span>
            <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
          </div>
          <span className="p-2 bg-orange-100 text-[#FF6A00] rounded-lg hover:bg-[#FF6A00] hover:text-white transition">
            <ShoppingCart className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function SupplierCard({ supplier }: { supplier: Supplier }) {
  const { t, locale } = useI18n();
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-full ${supplier.bg} ${supplier.fg} flex items-center justify-center font-bold`}>
          {supplier.initials}
        </div>
        <div>
          <h4 className="font-semibold text-neutral-900">{supplier.name}</h4>
          <p className="text-xs text-neutral-500">{supplier.years} years | {supplier.productCount} products</p>
        </div>
      </div>
      <div className="flex items-center gap-1 mb-3">
        <span className="text-yellow-500 font-bold">{supplier.rating}</span>
        <span className="text-sm text-neutral-400">({supplier.reviewCount} {t.products.reviews})</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {supplier.tags.map((tag) => (
          <span key={tag} className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded">
            {tag}
          </span>
        ))}
      </div>
      <Link
        href={`/${locale}/suppliers/${supplier.id}`}
        className="block text-center mt-4 py-2 border border-[#FF6A00] text-[#FF6A00] rounded-lg text-sm font-medium hover:bg-[#FF6A00] hover:text-white transition"
      >
        {t.products.viewProducts}
      </Link>
    </div>
  );
}

export default function DesktopProducts({ trending, flashDeals }: { trending: DbProduct[]; flashDeals: DbProduct[] }) {
  const { t, locale } = useI18n();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Trending Products Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF6A00] to-[#FF8C00] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-neutral-900">{t.products.trendingProducts}</h2>
              <p className="text-sm text-neutral-500">{t.products.trendingDesc}</p>
            </div>
          </div>
          <Link href={`/${locale}/products`} className="flex items-center gap-1 text-[#FF6A00] font-medium hover:underline">
            {t.products.viewAllProducts}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {trending.length === 0 ? (
          <p className="p-8 text-center text-neutral-400 bg-white rounded-xl border border-neutral-200">No products yet.</p>
        ) : (
          <div className="grid grid-cols-4 gap-5">
            {trending.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Flash Deals Section */}
      <div className="mb-12 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">-70%</span>
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-neutral-900">{t.products.flashDeals}</h2>
              <p className="text-sm text-neutral-500">{t.products.flashDealsDesc}</p>
            </div>
          </div>
          <Link href={`/${locale}/deals`} className="flex items-center gap-1 text-[#FF6A00] font-medium hover:underline">
            {t.products.viewAllDeals}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {flashDeals.length === 0 ? (
          <p className="p-8 text-center text-neutral-400 bg-white/60 rounded-xl">No flash deals right now.</p>
        ) : (
          <div className="grid grid-cols-4 gap-5">
            {flashDeals.map((product) => (
              <ProductCard key={`flash-${product.id}`} product={product} flashBadge />
            ))}
          </div>
        )}
      </div>

      {/* Top Suppliers Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <BadgeCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-neutral-900">{t.products.verifiedSuppliers}</h2>
              <p className="text-sm text-neutral-500">{t.products.suppliersDesc}</p>
            </div>
          </div>
          <Link href={`/${locale}/suppliers`} className="flex items-center gap-1 text-[#FF6A00] font-medium hover:underline">
            {t.products.viewAllSuppliers}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-5">
          {topSuppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))}
        </div>
      </div>

      {/* Promotional Banners */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-display font-bold mb-2">{t.products.freeShipping}</h3>
          <p className="text-green-100 mb-4">{t.products.freeShippingDesc}</p>
          <Link href={`/${locale}/products`} className="inline-block bg-white text-green-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-green-50 transition">
            {t.products.shopNow}
          </Link>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-display font-bold mb-2">{t.products.netTerms}</h3>
          <p className="text-blue-100 mb-4">{t.products.netTermsDesc}</p>
          <Link href={`/${locale}/apply-terms`} className="inline-block bg-white text-blue-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition">
            {t.products.applyNow}
          </Link>
        </div>
      </div>
    </div>
  );
}
