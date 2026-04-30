"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Loader2, CheckCircle2 } from "lucide-react";

type State = "idle" | "submitting" | "success" | "error";

export default function RFQForm() {
  const [state, setState] = useState<State>("idle");
  const [form, setForm] = useState({
    product: "",
    quantity: "",
    targetPrice: "",
    country: "Egypt",
    notes: "",
  });

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState("submitting");
    // TODO: replace with Supabase insert into `rfqs` once auth is wired.
    await new Promise((r) => setTimeout(r, 800));
    setState("success");
  }

  return (
    <section className="mx-2.5 mt-2.5">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-semibold text-neutral-900">Request a quote (RFQ)</h2>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl p-3.5 border border-neutral-200"
      >
        <p className="text-[11px] text-neutral-500 mb-3">
          Tell suppliers exactly what you need — get responses in 24h.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <Field label="Product">
            <input
              required
              value={form.product}
              onChange={(e) => update("product", e.target.value)}
              type="text"
              placeholder="e.g. HEPA filters"
              className={inputCls}
            />
          </Field>
          <Field label="Quantity">
            <input
              required
              min={1}
              value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
              type="number"
              placeholder="500"
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <Field label="Target price ($)">
            <input
              value={form.targetPrice}
              onChange={(e) => update("targetPrice", e.target.value)}
              type="number"
              step="0.01"
              placeholder="7.50"
              className={inputCls}
            />
          </Field>
          <Field label="Country">
            <input
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
              type="text"
              placeholder="Egypt"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Special requirements" className="mb-2.5">
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={2}
            placeholder="Certifications, packaging, lead time..."
            className={`${inputCls} resize-none`}
          />
        </Field>

        <button
          type="submit"
          disabled={state === "submitting" || state === "success"}
          className="w-full bg-gradient-to-br from-[#FF6A00] to-[#FF8C00] text-white border-none rounded-xl py-3 text-[13.5px] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60"
        >
          {state === "submitting" && <Loader2 className="w-4 h-4 animate-spin" />}
          {state === "success" && <CheckCircle2 className="w-4 h-4" />}
          {state === "success"
            ? "RFQ submitted — we'll be in touch"
            : "Submit RFQ — get quotes in 24h"}
          {state === "idle" && <ArrowUpRight className="w-4 h-4" />}
        </button>
      </form>
    </section>
  );
}

const inputCls =
  "w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-[12.5px] text-neutral-900 outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 placeholder:text-neutral-300";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[10.5px] text-neutral-500 font-medium">{label}</span>
      {children}
    </label>
  );
}
