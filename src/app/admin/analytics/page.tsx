"use client";

import { TrendingUp, Users, ShoppingCart, DollarSign, BarChart3 } from "lucide-react";

const chartData = [
  { month: "Jan", revenue: 45000, orders: 120 },
  { month: "Feb", revenue: 52000, orders: 145 },
  { month: "Mar", revenue: 48000, orders: 132 },
  { month: "Apr", revenue: 61000, orders: 178 },
  { month: "May", revenue: 58000, orders: 165 },
  { month: "Jun", revenue: 72000, orders: 210 },
];

export default function AnalyticsPage() {
  const totalRevenue = chartData.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalOrders = chartData.reduce((acc, curr) => acc + curr.orders, 0);
  const avgOrderValue = totalRevenue / totalOrders;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-neutral-900">Analytics</h1>
        <p className="text-neutral-500 mt-1">Business performance and insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-[#FF6A00] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-neutral-500 font-medium">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">${totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-1">+15% vs last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-neutral-500 font-medium">Total Orders</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{totalOrders.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-1">+8% vs last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-neutral-500 font-medium">New Customers</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">324</p>
          <p className="text-sm text-green-600 mt-1">+23% vs last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-neutral-500 font-medium">Avg Order Value</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">${avgOrderValue.toFixed(0)}</p>
          <p className="text-sm text-red-600 mt-1">-2% vs last month</p>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-6">Revenue & Orders Trend</h2>
        <div className="h-64 flex items-end justify-between gap-4">
          {chartData.map((data, idx) => (
            <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col gap-1">
                <div
                  className="w-full bg-[#FF6A00] rounded-t"
                  style={{ height: `${(data.revenue / 80000) * 200}px` }}
                />
                <div
                  className="w-full bg-blue-400 rounded-t"
                  style={{ height: `${(data.orders / 250) * 50}px` }}
                />
              </div>
              <span className="text-xs text-neutral-500">{data.month}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#FF6A00] rounded" />
            <span className="text-sm text-neutral-600">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded" />
            <span className="text-sm text-neutral-600">Orders</span>
          </div>
        </div>
      </div>
    </div>
  );
}
