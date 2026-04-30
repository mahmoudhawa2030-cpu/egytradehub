"use client";

import { useState } from "react";
import { Search, Filter, Package, Truck, CheckCircle } from "lucide-react";

const orders = [
  { id: "ORD-2024-001", customer: "Acme Corp", product: "Hydraulic Pump Set", amount: 2450, status: "processing", date: "2024-01-15" },
  { id: "ORD-2024-002", customer: "TechGlobal Ltd", product: "LED Panel 60W", amount: 1890, status: "shipped", date: "2024-01-14" },
  { id: "ORD-2024-003", customer: "BuildRight Inc", product: "Safety Harness", amount: 567, status: "delivered", date: "2024-01-13" },
  { id: "ORD-2024-004", customer: "FactoryOne", product: "Servo Motor 400W", amount: 3200, status: "processing", date: "2024-01-12" },
  { id: "ORD-2024-005", customer: "MegaIndustrial", product: "Air Purifier H13", amount: 1450, status: "shipped", date: "2024-01-11" },
];

export default function OrdersPage() {
  const [filter, setFilter] = useState("all");

  const filteredOrders = filter === "all" ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">Orders</h1>
          <p className="text-neutral-500 mt-1">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          {["all", "processing", "shipped", "delivered"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filter === f ? "bg-[#FF6A00] text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Order ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Customer</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Product</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-neutral-50 transition">
                <td className="px-6 py-4 font-medium text-neutral-900">{order.id}</td>
                <td className="px-6 py-4 text-sm text-neutral-600">{order.customer}</td>
                <td className="px-6 py-4 text-sm text-neutral-600">{order.product}</td>
                <td className="px-6 py-4 text-sm text-neutral-600">{order.date}</td>
                <td className="px-6 py-4 font-medium text-neutral-900">${order.amount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === "delivered" ? "bg-green-100 text-green-700" :
                    order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>
                    {order.status === "processing" && <Package className="w-3 h-3" />}
                    {order.status === "shipped" && <Truck className="w-3 h-3" />}
                    {order.status === "delivered" && <CheckCircle className="w-3 h-3" />}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
