"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, MessageCircle, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { submitInquiry, startChat } from "@/app/actions/product";

interface ProductActionsProps {
  productId: string;
  productName: string;
  supplierId: string;
  locale: string;
}

type Modal = "none" | "inquiry" | "chat";

export default function ProductActions({ productId, productName, supplierId, locale }: ProductActionsProps) {
  const router = useRouter();
  const [modal, setModal] = useState<Modal>("none");

  // ── Inquiry form state ──
  const [quantity, setQuantity] = useState("1");
  const [targetPrice, setTargetPrice] = useState("");
  const [notes, setNotes] = useState("");

  // ── Chat form state ──
  const [message, setMessage] = useState(
    `Hi, I'm interested in "${productName}". Could you provide more details?`
  );

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function reset() {
    setStatus("idle");
    setErrorMsg("");
  }

  function close() {
    setModal("none");
    reset();
  }

  async function handleInquiry(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const result = await submitInquiry({
      productId,
      productName,
      supplierId,
      quantity: Number(quantity),
      targetPrice: targetPrice ? Number(targetPrice) : null,
      notes,
    });
    if ("error" in result) {
      if (result.error === "not_authenticated") {
        router.push(`/${locale}/login?next=/${locale}/products`);
        return;
      }
      setStatus("error");
      setErrorMsg(result.error);
    } else {
      setStatus("success");
    }
  }

  async function handleChat(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const result = await startChat({ supplierId, productId, productName, message });
    if ("error" in result) {
      if (result.error === "not_authenticated") {
        router.push(`/${locale}/login?next=/${locale}/products`);
        return;
      }
      setStatus("error");
      setErrorMsg(result.error);
    } else {
      router.push(`/${locale}/messages`);
    }
  }

  return (
    <>
      {/* CTA buttons */}
      <div className="flex gap-3 mt-2">
        <button
          onClick={() => { reset(); setModal("inquiry"); }}
          className="flex-1 bg-[#FF6A00] hover:bg-[#e05e00] text-white text-sm font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send Inquiry
        </button>
        <button
          onClick={() => { reset(); setModal("chat"); }}
          className="flex-1 border border-[#FF6A00] text-[#FF6A00] hover:bg-orange-50 text-sm font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Chat now
        </button>
      </div>

      {/* ── Modal backdrop ── */}
      {modal !== "none" && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="font-bold text-neutral-900">
                {modal === "inquiry" ? "Send Inquiry" : "Chat with Supplier"}
              </h2>
              <button onClick={close} className="p-1.5 hover:bg-neutral-100 rounded-lg transition">
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* Product pill */}
            <div className="px-6 pt-4">
              <div className="inline-flex items-center gap-2 bg-orange-50 text-[#FF6A00] text-xs font-medium px-3 py-1.5 rounded-full">
                <span className="truncate max-w-[260px]">{productName}</span>
              </div>
            </div>

            {/* ── Success state ── */}
            {status === "success" ? (
              <div className="px-6 py-10 flex flex-col items-center gap-3 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <p className="font-semibold text-neutral-900">Inquiry sent!</p>
                <p className="text-sm text-neutral-500">
                  The supplier will review your request and get back to you.
                </p>
                <button
                  onClick={close}
                  className="mt-2 px-6 py-2.5 bg-[#FF6A00] text-white rounded-lg font-semibold text-sm hover:bg-[#e05e00] transition"
                >
                  Close
                </button>
              </div>
            ) : modal === "inquiry" ? (
              /* ── Inquiry form ── */
              <form onSubmit={handleInquiry} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6A00]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Target price (USD)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6A00]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe your requirements, shipping destination, etc."
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6A00] resize-none"
                  />
                </div>

                {status === "error" && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-[#FF6A00] hover:bg-[#e05e00] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
                  {status === "loading" ? "Sending…" : "Send Inquiry"}
                </button>
              </form>
            ) : (
              /* ── Chat form ── */
              <form onSubmit={handleChat} className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Your message *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6A00] resize-none"
                  />
                </div>

                {status === "error" && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-[#FF6A00] hover:bg-[#e05e00] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
                  {status === "loading" ? "Sending…" : "Start Chat"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
