import { MessageSquare, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateRfqStatus } from "@/app/admin/actions";

const STATUS_FILTERS = ["all", "pending", "replied", "closed"] as const;

export default async function RFQsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filterStatus } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("rfqs")
    .select("id, product_name, quantity, target_price, country, notes, status, created_at, profiles!buyer_id(full_name, company_name)")
    .order("created_at", { ascending: false });

  if (filterStatus && filterStatus !== "all") {
    query = query.eq("status", filterStatus);
  }

  const { data: rfqs } = await query;
  const list = rfqs ?? [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">RFQs</h1>
          <p className="text-neutral-500 mt-1">Manage all Request for Quotation submissions</p>
        </div>
        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map((f) => (
            <a
              key={f}
              href={f === "all" ? "/admin/rfqs" : `/admin/rfqs?status=${f}`}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                (f === "all" && !filterStatus) || filterStatus === f
                  ? "bg-[#FF6A00] text-white"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {list.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400">
            No RFQs found.
          </div>
        )}
        {list.map((rfq) => {
          const buyer = rfq.profiles as { full_name?: string; company_name?: string } | null;
          const buyerName = buyer?.company_name ?? buyer?.full_name ?? "Unknown";
          return (
            <div key={rfq.id} className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-lg text-neutral-900">{rfq.product_name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        rfq.status === "pending" ? "bg-orange-100 text-orange-700" :
                        rfq.status === "replied" ? "bg-blue-100 text-blue-700" :
                        "bg-neutral-100 text-neutral-600"
                      }`}>
                        {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">From: <span className="font-medium">{buyerName}</span></p>
                    <div className="flex items-center gap-6 text-sm text-neutral-500 flex-wrap">
                      <span>Qty: <span className="font-medium text-neutral-700">{rfq.quantity.toLocaleString()} units</span></span>
                      {rfq.target_price && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          Budget: <span className="font-medium text-neutral-700">${Number(rfq.target_price).toLocaleString()}</span>
                        </span>
                      )}
                      {rfq.country && <span>Country: <span className="font-medium text-neutral-700">{rfq.country}</span></span>}
                      <span className="text-neutral-400">{new Date(rfq.created_at).toLocaleDateString()}</span>
                    </div>
                    {rfq.notes && (
                      <p className="mt-2 text-sm text-neutral-500 italic">{rfq.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  {rfq.status === "pending" && (
                    <>
                      <form action={updateRfqStatus.bind(null, rfq.id, "closed")}>
                        <button type="submit" className="flex items-center gap-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition">
                          <XCircle className="w-4 h-4" />
                          Close
                        </button>
                      </form>
                      <form action={updateRfqStatus.bind(null, rfq.id, "replied")}>
                        <button type="submit" className="flex items-center gap-1 px-3 py-2 bg-[#FF6A00] text-white rounded-lg text-sm hover:bg-[#FF8C00] transition">
                          <CheckCircle className="w-4 h-4" />
                          Mark Replied
                        </button>
                      </form>
                    </>
                  )}
                  {rfq.status === "replied" && (
                    <form action={updateRfqStatus.bind(null, rfq.id, "closed")}>
                      <button type="submit" className="flex items-center gap-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition">
                        <XCircle className="w-4 h-4" />
                        Close
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
