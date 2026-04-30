"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Filter, MoreVertical, Edit, Trash2 } from "lucide-react";

const products = [
  { id: "P001", name: "Hydraulic Pump Set Industrial", category: "Machinery", price: 44, moq: 5, stock: 150, status: "active" },
  { id: "P002", name: "Servo Motor 400W AC", category: "Electronics", price: 56, moq: 10, stock: 89, status: "active" },
  { id: "P003", name: "HEPA Air Purifier H13", category: "Home", price: 7, moq: 20, stock: 234, status: "low" },
  { id: "P004", name: "Industrial LED Panel 60W", category: "Electronics", price: 12, moq: 30, stock: 456, status: "active" },
  { id: "P005", name: "Safety Harness Professional", category: "Safety", price: 23, moq: 25, stock: 12, status: "low" },
];

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">Inventory</h1>
          <p className="text-neutral-500 mt-1">Manage products, pricing, and stock levels</p>
        </div>
        <Link
          href="/admin/inventory/add"
          className="flex items-center gap-2 px-4 py-2 bg-[#FF6A00] text-white rounded-lg font-medium hover:bg-[#FF8C00] transition"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00]"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Product</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Category</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Price</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">MOQ</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Stock</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Status</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-neutral-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-neutral-500">IMG</span>
                    </div>
                    <span className="font-medium text-neutral-900">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">{product.category}</td>
                <td className="px-6 py-4 text-sm font-medium text-neutral-900">${product.price}</td>
                <td className="px-6 py-4 text-sm text-neutral-600">{product.moq} units</td>
                <td className="px-6 py-4 text-sm text-neutral-600">{product.stock}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.status === "active" ? "bg-green-100 text-green-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>
                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-neutral-100 rounded-lg transition">
                      <Edit className="w-4 h-4 text-neutral-500" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
