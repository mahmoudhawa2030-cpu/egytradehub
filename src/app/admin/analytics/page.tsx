import { Users, ShoppingCart, DollarSign, BarChart3, MessageSquare, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const [
    { data: orders },
    { count: totalUsers },
    { count: totalProducts },
    { count: pendingRfqs },
    { count: totalSuppliers },
  ] = await Promise.all([
    supabase.from("orders").select("total_amount, status, created_at"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("rfqs").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "supplier").eq("is_verified", true),
  ]);

  const orderList = orders ?? [];
  const totalRevenue = orderList.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const totalOrders = orderList.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const statusCounts = {
    processing: orderList.filter((o) => o.status === "processing").length,
    in_transit: orderList.filter((o) => o.status === "in_transit").length,
    delivered: orderList.filter((o) => o.status === "delivered").length,
    cancelled: orderList.filter((o) => o.status === "cancelled").length,
  };

  // Group orders by month (last 6 months)
  const monthlyMap: Record<string, { revenue: number; orders: number }> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("default", { month: "short" });
    monthlyMap[key] = { revenue: 0, orders: 0 };
  }
  orderList.forEach((o) => {
    const d = new Date(o.created_at);
    const key = d.toLocaleString("default", { month: "short" });
    if (monthlyMap[key]) {
      monthlyMap[key].revenue += Number(o.total_amount);
      monthlyMap[key].orders += 1;
    }
  });
  const chartData = Object.entries(monthlyMap).map(([month, v]) => ({ month, ...v }));
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);
  const maxOrders = Math.max(...chartData.map((d) => d.orders), 1);

  const stats = [
    { title: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, bg: "bg-orange-50", fg: "text-[#FF6A00]" },
    { title: "Total Orders", value: totalOrders.toLocaleString(), icon: ShoppingCart, bg: "bg-blue-50", fg: "text-blue-600" },
    { title: "Total Users", value: (totalUsers ?? 0).toLocaleString(), icon: Users, bg: "bg-green-50", fg: "text-green-600" },
    { title: "Avg Order Value", value: `$${avgOrderValue.toFixed(0)}`, icon: BarChart3, bg: "bg-purple-50", fg: "text-purple-600" },
    { title: "Active Suppliers", value: (totalSuppliers ?? 0).toLocaleString(), icon: Package, bg: "bg-teal-50", fg: "text-teal-600" },
    { title: "Pending RFQs", value: (pendingRfqs ?? 0).toLocaleString(), icon: MessageSquare, bg: "bg-yellow-50", fg: "text-yellow-600" },
    { title: "Total Products", value: (totalProducts ?? 0).toLocaleString(), icon: Package, bg: "bg-indigo-50", fg: "text-indigo-600" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-neutral-900">Analytics</h1>
        <p className="text-neutral-500 mt-1">Real-time business performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {stats.map((s) => (
          <div key={s.title} className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg ${s.bg} ${s.fg} flex items-center justify-center`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-neutral-500 text-sm font-medium">{s.title}</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-6">Revenue Trend (Last 6 Months)</h2>
        <div className="h-48 flex items-end gap-3">
          {chartData.map((d) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-neutral-500 font-medium">${d.revenue > 0 ? (d.revenue / 1000).toFixed(1) + "k" : "0"}</span>
              <div
                className="w-full bg-gradient-to-t from-[#FF6A00] to-[#FF8C00] rounded-t transition-all"
                style={{ height: `${(d.revenue / maxRevenue) * 160}px`, minHeight: d.revenue > 0 ? "4px" : "0" }}
              />
              <span className="text-xs text-neutral-500">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Status + Orders Chart */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => {
              const pct = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
              const colors: Record<string, string> = {
                processing: "bg-orange-400",
                in_transit: "bg-blue-400",
                delivered: "bg-green-400",
                cancelled: "bg-red-400",
              };
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-600 capitalize">{status.replace("_", " ")}</span>
                    <span className="font-medium text-neutral-900">{count}</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className={`h-full ${colors[status]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Orders Volume (Last 6 Months)</h2>
          <div className="h-36 flex items-end gap-3">
            {chartData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-blue-400 rounded-t transition-all"
                  style={{ height: `${(d.orders / maxOrders) * 120}px`, minHeight: d.orders > 0 ? "4px" : "0" }}
                />
                <span className="text-xs text-neutral-500">{d.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
