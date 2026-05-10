"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Zap } from "lucide-react";
import { updateProduct } from "@/app/admin/actions";
import GalleryUploadField from "@/components/admin/GalleryUploadField";
import SpecificationsTable from "@/components/product/SpecificationsTable";

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  base_price: number;
  moq: number;
  sample_price: number | null;
  specifications: Record<string, string> | null;
  image_url: string | null;
  gallery_images: string[];
  is_flash_deal: boolean;
  flash_discount_pct: number | null;
  flash_starts_at: string | null;
  flash_ends_at: string | null;
}

export default function EditProductForm({ product, categories }: { product: Product; categories: string[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFlash, setIsFlash] = useState(product.is_flash_deal);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("is_flash_deal", isFlash ? "true" : "false");
    startTransition(async () => {
      const result = await updateProduct(product.id, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/admin/inventory");
      }
    });
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/inventory" className="p-2 hover:bg-neutral-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">Edit Product</h1>
          <p className="text-neutral-500 mt-1 truncate max-w-md">{product.name}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm space-y-5">
          <h2 className="font-semibold text-neutral-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Product Name *</label>
            <input
              name="name"
              required
              defaultValue={product.name}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={product.description ?? ""}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Category *</label>
            <select
              name="category"
              required
              defaultValue={product.category}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00]"
            >
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <GalleryUploadField defaultImages={product.gallery_images?.length ? product.gallery_images : (product.image_url ? [product.image_url] : [])} />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Base Price (USD) *</label>
              <input
                name="base_price"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={product.base_price}
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
                defaultValue={product.moq}
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
                defaultValue={product.sample_price ?? ""}
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
          <SpecificationsTable defaultSpecs={product.specifications || {}} />
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
                <input
                  name="flash_discount_pct"
                  type="number"
                  min="1"
                  max="99"
                  defaultValue={product.flash_discount_pct ?? ""}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Starts At</label>
                <input
                  name="flash_starts_at"
                  type="datetime-local"
                  defaultValue={product.flash_starts_at?.slice(0, 16) ?? ""}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Ends At</label>
                <input
                  name="flash_ends_at"
                  type="datetime-local"
                  defaultValue={product.flash_ends_at?.slice(0, 16) ?? ""}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 justify-end">
          <Link
            href="/admin/inventory"
            className="px-6 py-2.5 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 transition font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6A00] text-white rounded-lg font-semibold hover:bg-[#FF8C00] transition disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
