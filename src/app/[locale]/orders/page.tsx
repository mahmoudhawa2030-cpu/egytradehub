"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/context";

type Order = {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  processing: "bg-orange-100 text-orange-700",
  in_transit:  "bg-blue-100 text-blue-700",
  delivered:   "bg-green-100 text-green-700",
  cancelled:   "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const { locale } = useI18n();
  const router = useRouter();
  const supabase = createClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace(`/${locale}/login`); return; }

      const { data } = await supabase
        .from("orders")
        .select("id, total_amount, status, created_at")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      setOrders(data ?? []);
      setLoading(false);
    }
    load();
  }, [supabase, router, locale]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-8 h-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex items-center gap-3 mb-8">
          <Link href={`/${locale}/account`} className="p-2 hover:bg-neutral-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">My Orders</h1>
            <p className="text-sm text-neutral-500">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-[#FF6A00]" />
            </div>
            <h2 className="font-semibold text-neutral-900 mb-1">No orders yet</h2>
            <p className="text-sm text-neutral-500 mb-6">When you place orders, they'll appear here.</p>
            <Link
              href={`/${locale}`}
              className="inline-block px-6 py-2.5 bg-[#FF6A00] text-white font-semibold rounded-xl hover:bg-[#FF8C00] transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            {orders.map((order, i) => (
              <div
                key={order.id}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 transition ${
                  i < orders.length - 1 ? "border-b border-neutral-100" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-[#FF6A00]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-semibold text-neutral-900">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-neutral-900 text-sm">
                    ${Number(order.total_amount).toLocaleString()}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                      STATUS_STYLES[order.status] ?? "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
