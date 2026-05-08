"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { submitRFQ } from "@/app/actions/rfq";

export default function RFQSubmitForm({ locale }: { locale: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    const result = await submitRFQ({
      product_name: fd.get("product_name") as string,
      quantity: parseInt(fd.get("quantity") as string, 10),
      target_price: fd.get("target_price") ? parseFloat(fd.get("target_price") as string) : null,
      country: fd.get("country") as string,
      notes: fd.get("notes") as string,
    });
    if ("error" in result) {
      if (result.error === "not_authenticated") {
        router.push(`/${locale}/login?next=/${locale}/rfq`);
        return;
      }
      setStatus("error");
      setErrorMsg(result.error ?? "Something went wrong");
    } else {
      setStatus("success");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-14 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <h2 className="text-xl font-bold text-neutral-900">RFQ Submitted!</h2>
        <p className="text-neutral-500 max-w-sm">
          Your request has been sent. Our team will match you with verified suppliers within 24 hours.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-2 px-6 py-2.5 bg-[#FF6A00] text-white rounded-lg font-semibold text-sm hover:bg-[#e05e00] transition"
        >
          Submit Another RFQ
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            name="product_name"
            type="text"
            required
            placeholder="e.g. Hydraulic Pump Set"
            className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Quantity (units) <span className="text-red-500">*</span>
          </label>
          <input
            name="quantity"
            type="number"
            min="1"
            required
            placeholder="e.g. 500"
            className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Target Price (USD)
          </label>
          <input
            name="target_price"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 5000 (optional)"
            className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Destination Country
          </label>
          <input
            name="country"
            type="text"
            placeholder="e.g. Egypt (optional)"
            className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Additional Notes
        </label>
        <textarea
          name="notes"
          rows={4}
          placeholder="Describe your requirements, specifications, packaging, delivery terms…"
          className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 resize-none"
        />
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-[#FF6A00] hover:bg-[#e05e00] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {status === "loading" ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
        ) : (
          <><Send className="w-4 h-4" /> Submit RFQ</>
        )}
      </button>
    </form>
  );
}
