import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChevronRight, Home, MessageSquare, Clock, CheckCircle2, XCircle } from "lucide-react";
import RFQSubmitForm from "./RFQSubmitForm";

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

export const metadata = {
  title: "Request for Quotation — EgyTradeHub",
  description: "Submit an RFQ and get competitive quotes from verified Egyptian suppliers within 24 hours.",
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700",
  replied: "bg-blue-100 text-blue-700",
  closed: "bg-neutral-100 text-neutral-500",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending: <Clock className="w-3.5 h-3.5" />,
  replied: <CheckCircle2 className="w-3.5 h-3.5" />,
  closed: <XCircle className="w-3.5 h-3.5" />,
};

export default async function RFQPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let myRFQs: any[] = [];
  if (user) {
    const { data } = await supabase
      .from("rfqs")
      .select("id, product_name, quantity, target_price, country, status, created_at")
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    myRFQs = data ?? [];
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex items-center flex-wrap gap-1 text-sm text-neutral-500">
            <li>
              <Link href={`/${locale}`} className="inline-flex items-center gap-1 hover:text-neutral-800 transition-colors">
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
            </li>
            <li className="flex items-center"><ChevronRight className="w-3.5 h-3.5 text-neutral-300" /></li>
            <li className="text-neutral-900 font-medium" aria-current="page">Request for Quotation</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

          {/* ── LEFT: Submit form ── */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-[#FF6A00]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-neutral-900">Request for Quotation</h1>
                <p className="text-sm text-neutral-500">Get competitive quotes from verified suppliers within 24 hours</p>
              </div>
            </div>
            <div className="px-6 py-6">
              <RFQSubmitForm locale={locale} />
            </div>
          </div>

          {/* ── RIGHT: Info + history ── */}
          <div className="flex flex-col gap-4">
            {/* How it works */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
              <h2 className="font-bold text-neutral-900 mb-4">How it works</h2>
              <ol className="space-y-4">
                {[
                  { n: "1", title: "Submit your RFQ", desc: "Fill in your product requirements, quantity and budget." },
                  { n: "2", title: "Get matched", desc: "We forward your request to verified suppliers in our network." },
                  { n: "3", title: "Compare quotes", desc: "Receive multiple competitive offers and choose the best one." },
                  { n: "4", title: "Seal the deal", desc: "Negotiate directly with the supplier and place your order." },
                ].map((s) => (
                  <li key={s.n} className="flex gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#FF6A00] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {s.n}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{s.title}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* My RFQs */}
            {user && (
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
                <h2 className="font-bold text-neutral-900 mb-3">My RFQs</h2>
                {myRFQs.length === 0 ? (
                  <p className="text-sm text-neutral-400 text-center py-4">No RFQs submitted yet.</p>
                ) : (
                  <div className="space-y-3">
                    {myRFQs.map((rfq) => (
                      <div key={rfq.id} className="border border-neutral-100 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-neutral-800 truncate">{rfq.product_name}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${STATUS_STYLE[rfq.status]}`}>
                            {STATUS_ICON[rfq.status]}
                            {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-500">
                          <span>Qty: <span className="font-medium text-neutral-700">{rfq.quantity.toLocaleString()}</span></span>
                          {rfq.target_price && (
                            <span>Budget: <span className="font-medium text-neutral-700">${Number(rfq.target_price).toLocaleString()}</span></span>
                          )}
                          {rfq.country && <span>{rfq.country}</span>}
                          <span className="ml-auto">{new Date(rfq.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!user && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 text-center">
                <p className="text-sm text-neutral-700 mb-3">Sign in to track your submitted RFQs</p>
                <Link
                  href={`/${locale}/login?next=/${locale}/rfq`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6A00] text-white text-sm font-semibold rounded-lg hover:bg-[#e05e00] transition"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
