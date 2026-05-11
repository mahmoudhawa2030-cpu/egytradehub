"use client";

import { useState } from "react";
import { Search, Menu, User, ShoppingCart, Heart, ChevronDown, ArrowRight } from "lucide-react";

const CATEGORIES = [
  { name: "Electronics", icon: "💻" },
  { name: "Machinery", icon: "⚙️" },
  { name: "Textiles", icon: "🧵" },
  { name: "Chemicals", icon: "🧪" },
  { name: "Building Materials", icon: "🏗️" },
  { name: "Food", icon: "🌾" },
];

const TRENDING = [
  { name: "LED Strip Lights", price: "$12.50", moq: "100 pcs", image: "💡" },
  { name: "Solar Panels", price: "$89.00", moq: "10 pcs", image: "☀️" },
  { name: "Cotton Fabric", price: "$3.20", moq: "500 m", image: "🧶" },
  { name: "Ceramic Tiles", price: "$1.80", moq: "1000 pcs", image: "🏺" },
];

export default function MobileLanding() {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#FF8C00] flex items-center justify-center">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2 bg-neutral-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
              />
            </div>
          </div>
          <button className="p-2 hover:bg-neutral-100 rounded-full">
            <ShoppingCart className="w-5 h-5 text-neutral-600" />
          </button>
        </div>
      </header>

      {/* Banner */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">B2B Wholesale</h1>
        <p className="text-sm opacity-90 mb-4">Connect with verified Egyptian suppliers</p>
        <button className="bg-white text-[#FF6A00] px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
          Explore <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Categories */}
      <div className="px-4 mt-6">
        <h2 className="font-bold text-neutral-800 mb-3">Categories</h2>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => (
            <div key={cat.name} className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl mb-1">{cat.icon}</div>
              <span className="text-xs font-medium text-neutral-700">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div className="px-4 mt-6">
        <h2 className="font-bold text-neutral-800 mb-3">Trending Products</h2>
        <div className="space-y-3">
          {TRENDING.map((item) => (
            <div key={item.name} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
              <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center text-2xl">
                {item.image}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-neutral-800">{item.name}</h3>
                <p className="text-[#FF6A00] font-bold">{item.price}</p>
                <p className="text-xs text-neutral-500">MOQ: {item.moq}</p>
              </div>
              <button className="p-2 hover:bg-neutral-100 rounded-full">
                <Heart className="w-5 h-5 text-neutral-400" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* RFQ Section */}
      <div className="mx-4 mt-6 mb-20 bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 border border-orange-100">
        <h2 className="font-bold text-lg text-neutral-800 mb-2">Request a Quote</h2>
        <p className="text-sm text-neutral-600 mb-4">Get quotes from suppliers in 24 hours</p>
        <button className="w-full bg-[#FF6A00] text-white py-3 rounded-xl font-semibold">
          Submit RFQ
        </button>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-6 py-3 flex justify-around">
        <button className="flex flex-col items-center gap-1 text-[#FF6A00]">
          <span className="text-xl">🏠</span>
          <span className="text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-neutral-400">
          <span className="text-xl">🔍</span>
          <span className="text-xs">Search</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-neutral-400">
          <span className="text-xl">📋</span>
          <span className="text-xs">RFQ</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-neutral-400">
          <User className="w-5 h-5" />
          <span className="text-xs">Account</span>
        </button>
      </div>
    </div>
  );
}
