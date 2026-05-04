"use client";

import { useEffect, useState, useTransition } from "react";
import { ShieldCheck, Package, FileText, Check, X, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  category: string;
  base_price: number;
  is_active: boolean;
  created_at: string;
  image_url: string | null;
  profiles: { full_name: string | null; company_name: string | null } | null;
};

type Rfq = {
  id: string;
  product_name: string;
  quantity: number;
  target_price: number | null;
  status: string;
  created_at: string;
  profiles: { full_name: string | null; company_name: string | null } | null;
};

type Tab = "products" | "rfqs";

export default function ModerationPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [{ data: prods }, { data: rfqData }] = await Promise.all([
        supabase
          .from("products")
          .select("id, name, category, base_price, is_active, created_at, image_url, profiles!supplier_id(full_name, company_name)")
          .order("created_at", { ascending: false }),
        supabase
          .from("rfqs")
          .select("id, product_name, quantity, target_price, status, created_at, profiles!buyer_id(full_name, company_name)")
          .order("created_at", { ascending: false }),
      ]);
      setProducts((prods as unknown as Product[]) ?? []);
      setRfqs((rfqData as unknown as Rfq[]) ?? []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function approveProduct(id: string) {
    startTransition(async () => {
      await supabase.from("products").update({ is_active: true }).eq("id", id);
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, is_active: true } : p));
    });
  }

  async function rejectProduct(id: string) {
    startTransition(async () => {
      await supabase.from("products").update({ is_active: false }).eq("id", id);
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, is_active: false } : p));
    });
  }

  async function updateRfqStatus(id: string, status: string) {
    startTransition(async () => {
      await supabase.from("rfqs").update({ status }).eq("id", id);
      setRfqs((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    });
  }

  const pending = products.filter((p) => !p.is_active);
  const approved = products.filter((p) => p.is_active);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Moderation</h1>
        <p className="text-neutral-500 mt-1">Review and approve products and RFQs</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["products", "rfqs"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
              tab === t
                ? "bg-[#FF6A00] text-white"
                : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {t === "products" ? <Package className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            {t === "products" ? `Products (${pending.length} pending)` : `RFQs (${rfqs.filter(r => r.status === "pending").length} pending)`}
          </button>
        ))}
      </div>

      {tab === "products" && (
        <div className="space-y-4">
          {/* Pending */}
          <div>
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
              Pending Approval ({pending.length})
            </h2>
            {pending.length === 0 && (
              <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center text-neutral-400">
                <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-green-400" />
                All products approved
              </div>
            )}
            {pending.map((p) => (
              <ProductCard key={p.id} product={p} onApprove={approveProduct} onReject={rejectProduct} isPending={isPending} />
            ))}
          </div>

          {/* Approved */}
          <div>
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
              Approved ({approved.length})
            </h2>
            {approved.map((p) => (
              <ProductCard key={p.id} product={p} onApprove={approveProduct} onReject={rejectProduct} isPending={isPending} />
            ))}
          </div>
        </div>
      )}

      {tab === "rfqs" && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          {rfqs.length === 0 ? (
            <p className="p-10 text-center text-neutral-400">No RFQs yet</p>
          ) : (
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Buyer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Target Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {rfqs.map((r) => {
                  const buyer = r.profiles;
                  const buyerName = buyer?.company_name ?? buyer?.full_name ?? "—";
                  return (
                    <tr key={r.id} className="hover:bg-neutral-50 transition">
                      <td className="px-6 py-4 font-medium text-neutral-900">{r.product_name}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{buyerName}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{r.quantity}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {r.target_price ? `$${r.target_price}` : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          r.status === "pending" ? "bg-orange-100 text-orange-700" :
                          r.status === "replied" ? "bg-green-100 text-green-700" :
                          "bg-neutral-100 text-neutral-500"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {r.status === "pending" && (
                            <button
                              onClick={() => updateRfqStatus(r.id, "replied")}
                              disabled={isPending}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" /> Mark Replied
                            </button>
                          )}
                          {r.status !== "closed" && (
                            <button
                              onClick={() => updateRfqStatus(r.id, "closed")}
                              disabled={isPending}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" /> Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  onApprove,
  onReject,
  isPending,
}: {
  product: Product;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isPending: boolean;
}) {
  const supplier = product.profiles;
  const supplierName = supplier?.company_name ?? supplier?.full_name ?? "Unknown";
  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 flex items-center gap-4 mb-3">
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-neutral-100" />
      ) : (
        <div className="w-14 h-14 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
          <Package className="w-6 h-6 text-neutral-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-neutral-900 truncate">{product.name}</p>
        <p className="text-sm text-neutral-500">{product.category} · by {supplierName}</p>
        <p className="text-sm font-medium text-neutral-700 mt-0.5">${Number(product.base_price).toLocaleString()}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${product.is_active ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
          {product.is_active ? "Approved" : "Pending"}
        </span>
        {!product.is_active ? (
          <button
            onClick={() => onApprove(product.id)}
            disabled={isPending}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" /> Approve
          </button>
        ) : (
          <button
            onClick={() => onReject(product.id)}
            disabled={isPending}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" /> Deactivate
          </button>
        )}
        <a
          href={`/admin/inventory/${product.id}/edit`}
          target="_blank"
          className="p-1.5 hover:bg-neutral-100 rounded-lg transition"
          title="View"
        >
          <Eye className="w-4 h-4 text-neutral-500" />
        </a>
      </div>
    </div>
  );
}
