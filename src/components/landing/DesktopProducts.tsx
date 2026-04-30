"use client";

import Link from "next/link";
import { ChevronRight, BadgeCheck, ShoppingCart, Heart, TrendingUp } from "lucide-react";
import { trendingProducts, topSuppliers, TrendingProduct, Supplier } from "./data";

function ProductCard({ product }: { product: TrendingProduct }) {
  return (
    <Link href={`/products/${product.id}`} className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`h-48 ${product.bg} flex items-center justify-center relative`}>
        <div className="text-center p-4">
          <p className="text-sm font-medium text-neutral-600">{product.name}</p>
          <p className="text-xs text-neutral-500 mt-1">Product Image</p>
        </div>
        {product.badge && (
          <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold ${
            product.badge.tone === "hot" ? "bg-red-500 text-white" :
            product.badge.tone === "new" ? "bg-green-500 text-white" :
            "bg-[#FF6A00] text-white"
          }`}>
            {product.badge.label}
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
          <span className="text-lg font-bold text-[#FF6A00]">${product.priceLow}</span>
          <span className="text-sm text-neutral-400 line-through">${product.basePrice}</span>
          <span className="text-xs text-green-600 font-medium">
            {Math.round((1 - product.priceLow / product.basePrice) * 100)}% off
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
          <span>MOQ: {product.moq} units</span>
          <span>Price: ${product.priceLow} - ${product.priceHigh}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-neutral-700">{product.supplier}</span>
            {product.verified && (
              <BadgeCheck className="w-4 h-4 text-blue-500" />
            )}
          </div>
          <button className="p-2 bg-orange-100 text-[#FF6A00] rounded-lg hover:bg-[#FF6A00] hover:text-white transition">
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}

function SupplierCard({ supplier }: { supplier: Supplier }) {
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
        <span className="text-sm text-neutral-400">({supplier.reviewCount} reviews)</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {supplier.tags.map((tag) => (
          <span key={tag} className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded">
            {tag}
          </span>
        ))}
      </div>
      <Link
        href={`/suppliers/${supplier.id}`}
        className="block text-center mt-4 py-2 border border-[#FF6A00] text-[#FF6A00] rounded-lg text-sm font-medium hover:bg-[#FF6A00] hover:text-white transition"
      >
        View Products
      </Link>
    </div>
  );
}

export default function DesktopProducts() {
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
              <h2 className="text-xl font-display font-bold text-neutral-900">Trending Products</h2>
              <p className="text-sm text-neutral-500">Most popular wholesale items this week</p>
            </div>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-[#FF6A00] font-medium hover:underline">
            View all products
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-5">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Flash Deals Section */}
      <div className="mb-12 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">-70%</span>
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-neutral-900">Flash Deals</h2>
              <p className="text-sm text-neutral-500">Limited time offers - Ends in 23:45:12</p>
            </div>
          </div>
          <Link href="/deals" className="flex items-center gap-1 text-[#FF6A00] font-medium hover:underline">
            View all deals
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-5">
          {trendingProducts.map((product) => (
            <ProductCard key={`flash-${product.id}`} product={{ ...product, badge: { label: "-30%", tone: "deal" } }} />
          ))}
        </div>
      </div>

      {/* Top Suppliers Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <BadgeCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-neutral-900">Verified Suppliers</h2>
              <p className="text-sm text-neutral-500">Trusted manufacturers with trade assurance</p>
            </div>
          </div>
          <Link href="/suppliers" className="flex items-center gap-1 text-[#FF6A00] font-medium hover:underline">
            View all suppliers
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
          <h3 className="text-2xl font-display font-bold mb-2">Free Shipping</h3>
          <p className="text-green-100 mb-4">On orders over $1,000. Valid for new buyers only.</p>
          <Link href="/products" className="inline-block bg-white text-green-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-green-50 transition">
            Shop Now
          </Link>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-display font-bold mb-2">Net-30 Terms</h3>
          <p className="text-blue-100 mb-4">Buy now, pay in 30 days for qualified buyers.</p>
          <Link href="/apply-terms" className="inline-block bg-white text-blue-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition">
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
}
