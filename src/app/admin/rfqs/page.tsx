"use client";

import { useState } from "react";
import { Search, MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react";

const rfqs = [
  { id: "RFQ-001", buyer: "Global Traders Inc", product: "Custom CNC Parts", quantity: "500 units", budget: "$15,000", deadline: "2024-02-01", status: "open" },
  { id: "RFQ-002", buyer: "Euro Import Ltd", product: "LED Strip Lights", quantity: "2000 meters", budget: "$8,000", deadline: "2024-01-25", status: "quoted" },
  { id: "RFQ-003", buyer: "Asia Manufacturing", product: "Plastic Containers", quantity: "10000 pcs", budget: "$3,500", deadline: "2024-01-20", status: "closed" },
];

export default function RFQsPage() {
  const [filter, setFilter] = useState("all");

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">RFQs</h1>
          <p className="text-neutral-500 mt-1">Manage Request for Quotation submissions</p>
        </div>
        <div className="flex items-center gap-2">
          {["all", "open", "quoted", "closed"].map((f) => (
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

      <div className="space-y-4">
        {rfqs.map((rfq) => (
          <div key={rfq.id} className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg text-neutral-900">{rfq.product}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      rfq.status === "open" ? "bg-green-100 text-green-700" :
                      rfq.status === "quoted" ? "bg-blue-100 text-blue-700" :
                      "bg-neutral-100 text-neutral-600"
                    }`}>
                      {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">From: {rfq.buyer}</p>
                  <div className="flex items-center gap-6 text-sm text-neutral-500">
                    <span>Quantity: <span className="font-medium text-neutral-700">{rfq.quantity}</span></span>
                    <span>Budget: <span className="font-medium text-neutral-700">{rfq.budget}</span></span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Deadline: {rfq.deadline}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {rfq.status === "open" && (
                  <>
                    <button className="flex items-center gap-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition">
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button className="flex items-center gap-1 px-3 py-2 bg-[#FF6A00] text-white rounded-lg text-sm hover:bg-[#FF8C00] transition">
                      <CheckCircle className="w-4 h-4" />
                      Quote
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
