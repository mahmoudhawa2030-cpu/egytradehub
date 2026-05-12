"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Zap, CheckCircle } from "lucide-react";
import { createSupplierProduct } from "../actions";
import GalleryUploadField from "@/components/admin/GalleryUploadField";
import SpecificationsTable from "@/components/product/SpecificationsTable";

export default function SupplierAddProductForm({ categories }: { categories: string[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFlash, setIsFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("is_flash_deal", isFlash ? "true" : "false");
    startTransition(async () => {
      const result = await createSupplierProduct(formData);
      if (result && "error" in result) {
        setError(result.error ?? null);
      } else {
        setIsApproved(result?.isApproved ?? false);
        setSuccess(true);
        setTimeout(() => router.push("/supplier/dashboard"), 3000);
      }
    });
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/supplier/dashboard" className="p-2 hover:bg-neutral-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Add Product</h1>
          <p className="text-neutral-500 mt-1">List a new product on EgyTradeHub</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
            <CheckCircle className="w-5 h-5" />
            Product submitted successfully!
          </div>
          {!isApproved && (
            <p className="text-sm text-green-600">
              Your product is pending approval. It will be visible after review by our team.
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm space-y-5">
          <h2 className="font-semibold text-neutral-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Product Name *</label>
            <input
              name="name"
              required
              placeholder="e.g. Hydraulic Pump Set Industrial"
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
            <textarea
              name="description"
              rows={4}
              placeholder="Describe your product — specs, use cases, certifications..."
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Category *</label>
            <select
              name="category"
              required
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00]"
            >
              <option value="">Select category</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <GalleryUploadField />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Base Price (USD) *</label>
              <input
                name="base_price"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="0.00"
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Min. Order Qty (MOQ) *</label>
              <input
                name="moq"
                type="number"
                min="1"
                required
                placeholder="1"
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Sample Price (USD)</label>
              <input
                name="sample_price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Optional"
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Product Specifications</h2>
            <span className="text-xs text-neutral-500">Optional — Add technical details</span>
          </div>
          <SpecificationsTable />
        </div>

        {/* Flash Deal */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#FF6A00]" />
              <h2 className="font-semibold text-neutral-900">Flash Deal</h2>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isFlash}
                onChange={(e) => setIsFlash(e.target.checked)}
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6A00]" />
            </label>
          </div>
          {isFlash && (
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Discount %</label>
                <input name="flash_discount_pct" type="number" min="1" max="99" placeholder="20"
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Starts At</label>
                <input name="flash_starts_at" type="datetime-local"
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Ends At</label>
                <input name="flash_ends_at" type="datetime-local"
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00]" />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 justify-end">
          <Link
            href="/supplier/dashboard"
            className="px-6 py-2.5 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 transition font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6A00] text-white rounded-lg font-semibold hover:bg-[#e05e00] transition disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Saving..." : "Publish Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
