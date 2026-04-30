"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Shield, Truck, Clock, BadgeCheck } from "lucide-react";
import { flashDeals } from "./data";

export default function DesktopHero() {
  const [activeSlide, setActiveSlide] = useState(0);

  const heroSlides = [
    {
      title: "Global B2B Wholesale Marketplace",
      subtitle: "Connect with 50,000+ verified suppliers. Source products at factory prices with trade assurance protection.",
      cta: "Browse Suppliers",
      bg: "from-[#FF6A00] to-[#FF8C00]",
    },
    {
      title: "Flash Deals - Up to 70% Off",
      subtitle: "Limited time wholesale prices on trending products. MOQ as low as 10 units.",
      cta: "Shop Flash Deals",
      bg: "from-[#FF6A00] to-[#FF8C00]",
    },
    {
      title: "Request for Quotation",
      subtitle: "Tell suppliers what you need. Get competitive quotes from multiple verified suppliers in 24 hours.",
      cta: "Submit RFQ",
      bg: "from-[#FF8C00] to-[#FF6A00]",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left sidebar - Categories */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-3 bg-[#FF6A00] text-white font-semibold text-sm">
            Browse Categories
          </div>
          <div className="divide-y divide-neutral-100">
            {[
              "Consumer Electronics",
              "Apparel & Fashion",
              "Home & Garden",
              "Beauty & Personal Care",
              "Sports & Entertainment",
              "Machinery",
              "Automotive Parts",
              "Health & Medical",
              "Packaging & Printing",
              "Gifts & Crafts",
            ].map((cat) => (
              <Link
                key={cat}
                href={`/category/${cat.toLowerCase().replace(/\s+/g, "-")}`}
                className="block px-3 py-2.5 text-sm text-neutral-700 hover:bg-orange-50 hover:text-[#FF6A00] transition"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Main hero slider */}
        <div className="col-span-7">
          <div className="relative h-[360px] rounded-xl overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r ${heroSlides[activeSlide].bg}`}>
              <div className="absolute inset-0 flex items-center px-10">
                <div className="max-w-lg text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <BadgeCheck className="w-5 h-5" />
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                      Verified Platform
                    </span>
                  </div>
                  <h1 className="text-3xl font-display font-bold mb-4">
                    {heroSlides[activeSlide].title}
                  </h1>
                  <p className="text-lg text-white/90 mb-6">
                    {heroSlides[activeSlide].subtitle}
                  </p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-white text-[#FF6A00] px-6 py-3 rounded-lg font-semibold hover:bg-neutral-100 transition"
                  >
                    {heroSlides[activeSlide].cta}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Slide indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition ${
                    idx === activeSlide ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {[
              { icon: Shield, label: "Trade Assurance", desc: "Secure payment" },
              { icon: Truck, label: "Fast Shipping", desc: "Global delivery" },
              { icon: Clock, label: "24/7 Support", desc: "Always available" },
              { icon: BadgeCheck, label: "Verified Suppliers", desc: "Quality checked" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 bg-white p-4 rounded-lg border border-neutral-200">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#FF6A00]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-neutral-900">{label}</p>
                  <p className="text-xs text-neutral-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="col-span-3 space-y-4">
          {/* Flash deals card */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-900">Flash Deals</h3>
              <Link href="/deals" className="text-sm text-[#FF6A00] hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {flashDeals.slice(0, 3).map((deal) => (
                <Link key={deal.id} href={`/products/${deal.id}`} className="flex gap-3 group">
                  <div className={`w-16 h-16 rounded-lg ${deal.bg} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-xs font-medium text-neutral-600 text-center px-1">
                      {deal.name.split(" ").slice(0, 2).join(" ")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate group-hover:text-[#FF6A00] transition">
                      {deal.name}
                    </p>
                    <p className="text-xs text-neutral-500">MOQ: {deal.moq} units</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-[#FF6A00]">${deal.priceLow}-{deal.priceHigh}</span>
                      <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">-{deal.discountPct}%</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* RFQ card */}
          <div className="bg-gradient-to-br from-[#FF6A00] to-[#FF8C00] rounded-xl p-4 text-white">
            <h3 className="font-semibold mb-2">Request for Quotation</h3>
            <p className="text-sm text-white/90 mb-4">
              Get quotes from multiple suppliers for your custom requirements.
            </p>
            <Link
              href="/rfq"
              className="block text-center bg-white text-[#FF6A00] py-2 rounded-lg font-semibold text-sm hover:bg-neutral-100 transition"
            >
              Submit RFQ
            </Link>
          </div>

          {/* New user offer */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 text-white">
            <h3 className="font-semibold mb-2">New Buyer Offer</h3>
            <p className="text-sm text-white/90 mb-3">
              Get $50 off your first order over $500.
            </p>
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
              <span className="text-lg font-bold">NEW50</span>
              <span className="text-xs text-white/80">Copy code</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
