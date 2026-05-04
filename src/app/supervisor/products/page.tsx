import { createClient } from "@/lib/supabase/server";
import { Package } from "lucide-react";

export default async function SupervisorProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, category, base_price, moq, is_flash_deal, image_url, is_active, created_at, profiles!supplier_id(full_name, company_name)")
    .order("created_at", { ascending: false });

  const list = products ?? [];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">All Products</h1>
        <p className="text-neutral-500 mt-1">{list.length} products on the platform</p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {list.length === 0 ? (
          <p className="p-12 text-center text-neutral-400">No products yet.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Supplier</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-600 uppercase">Price</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase">Status</th>
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
                          <img src={product.image_url} alt={product.name} className="w-9 h-9 rounded-lg object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center">
                            <Package className="w-4 h-4 text-neutral-400" />
                          </div>
                        )}
                        <span className="font-medium text-neutral-900 text-sm max-w-[200px] truncate">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{product.category}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{supplierName}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-neutral-900 text-right">${Number(product.base_price).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        product.is_active ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                      }`}>
                        {product.is_active ? "Active" : "Pending"}
                      </span>
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
