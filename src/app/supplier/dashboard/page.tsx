import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlusCircle, Package, Zap, Eye, Pencil } from "lucide-react";

export default async function SupplierDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/en/login");

  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, category, base_price, moq, is_flash_deal, image_url, created_at")
    .eq("supplier_id", user.id)
    .order("created_at", { ascending: false });

  const list = products ?? [];
  const flashCount = list.filter((p) => p.is_flash_deal).length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Supplier Dashboard</h1>
          <p className="text-neutral-500 mt-1">Manage your products and listings</p>
        </div>
        <Link
          href="/supplier/products/add"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6A00] text-white rounded-lg font-semibold hover:bg-[#e05e00] transition"
        >
          <PlusCircle className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-[#FF6A00]" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Total Products</p>
            <p className="text-2xl font-bold text-neutral-900">{list.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Flash Deals</p>
            <p className="text-2xl font-bold text-neutral-900">{flashCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <Eye className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Active Listings</p>
            <p className="text-2xl font-bold text-neutral-900">{list.length}</p>
          </div>
        </div>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">Your Products</h2>
          <Link href="/supplier/products/add" className="text-sm text-[#FF6A00] hover:underline font-medium">
            + Add new
          </Link>
        </div>
        {list.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-neutral-400">
            <Package className="w-12 h-12 opacity-30" />
            <p className="font-medium">No products yet</p>
            <Link
              href="/supplier/products/add"
              className="mt-2 px-5 py-2.5 bg-[#FF6A00] text-white rounded-lg font-semibold text-sm hover:bg-[#e05e00] transition"
            >
              Add your first product
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">MOQ</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {list.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-neutral-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-neutral-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-neutral-900 text-sm">{p.name}</p>
                        {p.is_flash_deal && (
                          <span className="inline-flex items-center gap-1 text-xs text-yellow-600 font-medium">
                            <Zap className="w-3 h-3" /> Flash Deal
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{p.category}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-neutral-900">${Number(p.base_price).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{p.moq} units</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/en/products/${p.slug}`}
                        target="_blank"
                        className="p-1.5 hover:bg-neutral-100 rounded-lg transition text-neutral-500 hover:text-neutral-900"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/supplier/products/${p.id}/edit`}
                        className="p-1.5 hover:bg-orange-50 rounded-lg transition text-neutral-500 hover:text-[#FF6A00]"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
