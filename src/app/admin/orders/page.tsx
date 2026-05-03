import { Package, Truck, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateOrderStatus } from "@/app/admin/actions";

const STATUS_OPTIONS = ["processing", "in_transit", "delivered", "cancelled"] as const;
type OrderStatus = (typeof STATUS_OPTIONS)[number];

const statusStyle: Record<OrderStatus, string> = {
  processing: "bg-orange-100 text-orange-700",
  in_transit: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filterStatus } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("id, total_amount, status, created_at, profiles!buyer_id(full_name, company_name)")
    .order("created_at", { ascending: false });

  if (filterStatus && filterStatus !== "all") {
    query = query.eq("status", filterStatus);
  }

  const { data: orders } = await query;
  const list = orders ?? [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">Orders</h1>
          <p className="text-neutral-500 mt-1">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          {["all", ...STATUS_OPTIONS].map((f) => (
            <a
              key={f}
              href={f === "all" ? "/admin/orders" : `/admin/orders?status=${f}`}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                (f === "all" && !filterStatus) || filterStatus === f
                  ? "bg-[#FF6A00] text-white"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {f === "in_transit" ? "In Transit" : f.charAt(0).toUpperCase() + f.slice(1)}
            </a>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {list.length === 0 ? (
          <p className="p-12 text-center text-neutral-400">No orders found.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Buyer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {list.map((order) => {
                const buyer = order.profiles as { full_name?: string; company_name?: string } | null;
                const buyerName = buyer?.company_name ?? buyer?.full_name ?? "Unknown";
                const status = order.status as OrderStatus;
                return (
                  <tr key={order.id} className="hover:bg-neutral-50 transition">
                    <td className="px-6 py-4 font-mono text-sm font-medium text-neutral-900">
                      {order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{buyerName}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      ${Number(order.total_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium w-fit ${statusStyle[status]}`}>
                        {status === "processing" && <Package className="w-3 h-3" />}
                        {status === "in_transit" && <Truck className="w-3 h-3" />}
                        {status === "delivered" && <CheckCircle className="w-3 h-3" />}
                        {status === "cancelled" && <XCircle className="w-3 h-3" />}
                        {status === "in_transit" ? "In Transit" : status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <form action={async (fd: FormData) => {
                        "use server";
                        const newStatus = fd.get("status") as OrderStatus;
                        await updateOrderStatus(order.id, newStatus);
                      }}>
                        <select
                          name="status"
                          defaultValue={status}
                          className="text-sm border border-neutral-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#FF6A00] mr-2"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s === "in_transit" ? "In Transit" : s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="text-sm px-3 py-1 bg-[#FF6A00] text-white rounded-lg hover:bg-[#FF8C00] transition"
                        >
                          Save
                        </button>
                      </form>
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
