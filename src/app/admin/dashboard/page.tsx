import Link from "next/link";
import {
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  MessageSquare,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: totalOrders },
    { count: pendingRfqs },
    { count: pendingSupplierCount },
    { data: recentOrders },
    { data: pendingSuppliers },
    { data: revenueData },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("rfqs").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "supplier").eq("is_verified", false),
    supabase
      .from("orders")
      .select("id, total_amount, status, created_at, profiles!buyer_id(full_name, company_name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("profiles")
      .select("user_id, full_name, company_name, country, created_at")
      .eq("role", "supplier")
      .eq("is_verified", false)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase.from("orders").select("total_amount"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  const totalRevenue = (revenueData ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);

  const stats = [
    { title: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, bg: "bg-orange-50", fg: "text-[#FF6A00]" },
    { title: "Total Orders", value: (totalOrders ?? 0).toLocaleString(), icon: ShoppingCart, bg: "bg-blue-50", fg: "text-blue-600" },
    { title: "Total Users", value: (totalUsers ?? 0).toLocaleString(), icon: Users, bg: "bg-green-50", fg: "text-green-600" },
    { title: "Pending RFQs", value: (pendingRfqs ?? 0).toLocaleString(), icon: MessageSquare, bg: "bg-purple-50", fg: "text-purple-600" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-500 mt-1">Welcome back to TradeHub Admin</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${stat.bg} ${stat.fg} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-neutral-500 text-sm font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="col-span-2 bg-white rounded-xl border border-neutral-200 shadow-sm">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Recent Orders</h2>
              <Link href="/admin/orders" className="text-[#FF6A00] font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-neutral-100">
            {(recentOrders ?? []).length === 0 && (
              <p className="p-6 text-sm text-neutral-400 text-center">No orders yet.</p>
            )}
            {(recentOrders ?? []).map((order) => {
              const buyer = order.profiles as { full_name?: string; company_name?: string } | null;
              const buyerName = buyer?.company_name ?? buyer?.full_name ?? "Unknown";
              return (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-neutral-500" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-neutral-500">{buyerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-neutral-900">${Number(order.total_amount).toLocaleString()}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "delivered" ? "bg-green-100 text-green-700" :
                      order.status === "in_transit" ? "bg-blue-100 text-blue-700" :
                      order.status === "cancelled" ? "bg-red-100 text-red-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace("_", " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Suppliers */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">
                Pending Verification
                {(pendingSupplierCount ?? 0) > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-orange-100 text-[#FF6A00] text-xs rounded-full font-medium">
                    {pendingSupplierCount}
                  </span>
                )}
              </h2>
              <Link href="/admin/suppliers" className="text-[#FF6A00] font-medium hover:underline flex items-center gap-1">
                Review <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-neutral-100">
            {(pendingSuppliers ?? []).length === 0 && (
              <p className="p-6 text-sm text-neutral-400 text-center">No pending suppliers.</p>
            )}
            {(pendingSuppliers ?? []).map((supplier) => {
              const name = supplier.company_name ?? supplier.full_name ?? "Unknown";
              return (
                <div key={supplier.user_id} className="p-4 hover:bg-neutral-50 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-[#FF6A00] flex items-center justify-center font-bold text-sm">
                      {name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">{name}</p>
                      <p className="text-sm text-neutral-500">{supplier.country ?? "—"}</p>
                      <p className="text-xs text-neutral-400 mt-1">{new Date(supplier.created_at).toLocaleDateString()}</p>
                    </div>
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-4 border-t border-neutral-200">
            <Link
              href="/admin/suppliers"
              className="block text-center py-2 border border-[#FF6A00] text-[#FF6A00] rounded-lg font-medium hover:bg-[#FF6A00] hover:text-white transition"
            >
              Manage Suppliers
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-4 gap-4">
        {[
          { label: "Add Product", href: "/admin/inventory/add", color: "bg-[#FF6A00]" },
          { label: "Manage Users", href: "/admin/users", color: "bg-purple-600" },
          { label: "View Analytics", href: "/admin/analytics", color: "bg-blue-600" },
          { label: "System Settings", href: "/admin/settings", color: "bg-neutral-700" },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`${action.color} text-white px-6 py-4 rounded-xl font-semibold hover:opacity-90 transition text-center`}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
