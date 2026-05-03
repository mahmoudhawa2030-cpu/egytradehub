import Link from "next/link";
import { Plus, Edit, Trash2, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteProduct } from "@/app/admin/actions";

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, category, base_price, moq, is_flash_deal, image_url, created_at, profiles!supplier_id(full_name, company_name)")
    .order("created_at", { ascending: false });

  const list = products ?? [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">Inventory</h1>
          <p className="text-neutral-500 mt-1">Manage products and pricing</p>
        </div>
        <Link
          href="/admin/inventory/add"
          className="flex items-center gap-2 px-4 py-2 bg-[#FF6A00] text-white rounded-lg font-medium hover:bg-[#FF8C00] transition"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {list.length === 0 ? (
          <p className="p-12 text-center text-neutral-400">No products yet. Add one above.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">MOQ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Supplier</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Flash Deal</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {list.map((product) => {
                const supplier = product.profiles as { full_name?: string; company_name?: string } | null;
                const supplierName = supplier?.company_name ?? supplier?.full_name ?? "—";
                return (
                  <tr key={product.id} className="hover:bg-neutral-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-xs text-neutral-400">IMG</div>
                        )}
                        <span className="font-medium text-neutral-900 max-w-[200px] truncate">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{product.category}</td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">${Number(product.base_price).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{product.moq} units</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{supplierName}</td>
                    <td className="px-6 py-4">
                      {product.is_flash_deal ? (
                        <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-[#FF6A00] rounded-full text-xs font-medium w-fit">
                          <Zap className="w-3 h-3" /> Flash
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/inventory/${product.id}/edit`}
                          className="p-2 hover:bg-neutral-100 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4 text-neutral-500" />
                        </Link>
                        <form action={deleteProduct.bind(null, product.id)}>
                          <button type="submit" className="p-2 hover:bg-red-50 rounded-lg transition">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
