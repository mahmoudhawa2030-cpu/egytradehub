"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  Calendar,
} from "lucide-react";

const statsCards = [
  {
    title: "Total Revenue",
    value: "$124,592",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    bg: "bg-orange-50",
    fg: "text-[#FF6A00]",
  },
  {
    title: "Active Orders",
    value: "1,429",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
    bg: "bg-blue-50",
    fg: "text-blue-600",
  },
  {
    title: "New Suppliers",
    value: "48",
    change: "+23.1%",
    trend: "up",
    icon: Users,
    bg: "bg-green-50",
    fg: "text-green-600",
  },
  {
    title: "Pending RFQs",
    value: "156",
    change: "-5.3%",
    trend: "down",
    icon: MessageSquare,
    bg: "bg-purple-50",
    fg: "text-purple-600",
  },
];

const recentOrders = [
  { id: "ORD-2024-001", customer: "Acme Corp", product: "Hydraulic Pump Set", amount: 2450, status: "processing" },
  { id: "ORD-2024-002", customer: "TechGlobal Ltd", product: "LED Panel 60W", amount: 1890, status: "shipped" },
  { id: "ORD-2024-003", customer: "BuildRight Inc", product: "Safety Harness", amount: 567, status: "delivered" },
  { id: "ORD-2024-004", customer: "FactoryOne", product: "Servo Motor 400W", amount: 3200, status: "processing" },
  { id: "ORD-2024-005", customer: "MegaIndustrial", product: "Air Purifier H13", amount: 1450, status: "shipped" },
];

const pendingSuppliers = [
  { id: "SUP-001", name: "Global Manufacturing Co.", country: "China", category: "Machinery", submitted: "2 hours ago" },
  { id: "SUP-002", name: "EuroTech Solutions", country: "Germany", category: "Electronics", submitted: "5 hours ago" },
  { id: "SUP-003", name: "AsiaPack Industries", country: "Vietnam", category: "Packaging", submitted: "1 day ago" },
];

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-500 mt-1">Welcome back to TradeHub Admin</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6A00]"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#FF6A00] text-white rounded-lg font-medium hover:bg-[#FF8C00] transition">
            <Calendar className="w-4 h-4" />
            Today
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${stat.bg} ${stat.fg} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {stat.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {stat.change}
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
            {recentOrders.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">{order.id}</p>
                    <p className="text-sm text-neutral-500">{order.customer} • {order.product}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-neutral-900">${order.amount.toLocaleString()}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === "delivered" ? "bg-green-100 text-green-700" :
                    order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Suppliers */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Pending Verification</h2>
              <Link href="/admin/suppliers" className="text-[#FF6A00] font-medium hover:underline flex items-center gap-1">
                Review <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-neutral-100">
            {pendingSuppliers.map((supplier) => (
              <div key={supplier.id} className="p-4 hover:bg-neutral-50 transition">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-[#FF6A00] flex items-center justify-center font-bold text-sm">
                    {supplier.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">{supplier.name}</p>
                    <p className="text-sm text-neutral-500">{supplier.country} • {supplier.category}</p>
                    <p className="text-xs text-neutral-400 mt-1">{supplier.submitted}</p>
                  </div>
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-neutral-200">
            <Link
              href="/admin/suppliers"
              className="block text-center py-2 border border-[#FF6A00] text-[#FF6A00] rounded-lg font-medium hover:bg-[#FF6A00] hover:text-white transition"
            >
              Verify All Suppliers
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-4 gap-4">
        {[
          { label: "Add Product", href: "/admin/inventory/add", color: "bg-[#FF6A00]" },
          { label: "Create Flash Deal", href: "/admin/inventory/deals", color: "bg-purple-600" },
          { label: "View Reports", href: "/admin/analytics", color: "bg-blue-600" },
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
