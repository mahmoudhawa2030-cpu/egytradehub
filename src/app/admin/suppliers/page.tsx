"use client";

import { useState } from "react";
import { Search, CheckCircle, XCircle, FileText, Building2, Globe, Calendar } from "lucide-react";

const pendingSuppliers = [
  {
    id: "SUP-001",
    name: "Global Manufacturing Co.",
    country: "China",
    category: "Industrial Machinery",
    email: "contact@globalmfg.com",
    submitted: "2024-01-15",
    documents: ["Business License", "ISO 9001", "Factory Photos"],
  },
  {
    id: "SUP-002",
    name: "EuroTech Solutions GmbH",
    country: "Germany",
    category: "Electronics",
    email: "info@eurotech.de",
    submitted: "2024-01-14",
    documents: ["Trade License", "CE Certificates"],
  },
  {
    id: "SUP-003",
    name: "AsiaPack Industries",
    country: "Vietnam",
    category: "Packaging Materials",
    email: "sales@asiapack.vn",
    submitted: "2024-01-13",
    documents: ["Business Registration", "Product Catalog"],
  },
];

const verifiedSuppliers = [
  { id: "SUP-004", name: "Acme Industrial", country: "USA", category: "Safety Equipment", since: "2023-06", products: 156, rating: 4.9 },
  { id: "SUP-005", name: "Prexon Systems", country: "UK", category: "Automation", since: "2023-08", products: 89, rating: 4.7 },
  { id: "SUP-006", name: "ZenKit Machinery", country: "Japan", category: "Robotics", since: "2023-09", products: 234, rating: 4.8 },
];

export default function SuppliersPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "verified">("pending");

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">Suppliers</h1>
          <p className="text-neutral-500 mt-1">Verify new suppliers and manage existing ones</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-md font-medium text-sm transition ${
              activeTab === "pending" ? "bg-[#FF6A00] text-white" : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            Pending ({pendingSuppliers.length})
          </button>
          <button
            onClick={() => setActiveTab("verified")}
            className={`px-4 py-2 rounded-md font-medium text-sm transition ${
              activeTab === "verified" ? "bg-[#FF6A00] text-white" : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            Verified ({verifiedSuppliers.length})
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          placeholder="Search suppliers..."
          className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00]"
        />
      </div>

      {/* Content */}
      {activeTab === "pending" ? (
        <div className="space-y-4">
          {pendingSuppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-orange-100 text-[#FF6A00] flex items-center justify-center font-bold text-lg">
                    {supplier.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-900">{supplier.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {supplier.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {supplier.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Applied {supplier.submitted}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {supplier.documents.map((doc) => (
                        <span key={doc} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md">
                          <FileText className="w-3 h-3" />
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50 transition">
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                    <CheckCircle className="w-4 h-4" />
                    Verify
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Supplier</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Country</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Products</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Rating</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Member Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {verifiedSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-neutral-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm">
                        {supplier.name.charAt(0)}
                      </div>
                      <span className="font-medium text-neutral-900">{supplier.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{supplier.country}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{supplier.category}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{supplier.products}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-sm font-medium text-yellow-600">
                      ★ {supplier.rating}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{supplier.since}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
