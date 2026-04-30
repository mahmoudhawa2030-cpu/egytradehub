import { ShieldCheck } from "lucide-react";

export default function HeroBanner() {
  return (
    <div className="mx-2.5 mt-2.5 rounded-2xl overflow-hidden relative bg-gradient-to-br from-neutral-900 via-amber-950 to-amber-900">
      <div className="absolute inset-y-0 right-0 w-[45%] bg-gradient-to-br from-orange-500/30 to-orange-600/20 flex items-center justify-center">
        <ShieldCheck className="w-16 h-16 text-orange-300/40" strokeWidth={1.5} />
      </div>

      <div className="relative z-10 px-4 pt-3.5 pb-3.5">
        <span className="inline-block bg-[#FF6A00] text-white text-[9.5px] font-semibold tracking-[0.08em] uppercase px-2 py-[3px] rounded-md mb-1.5">
          Verified Platform
        </span>
        <h2 className="font-display text-lg font-extrabold text-white leading-tight mb-1">
          Bulk orders,<br />made simple
        </h2>
        <p className="text-[11px] text-white/65 mb-2.5">
          3,000+ certified suppliers. MOQ from 10 units.
        </p>
        <div className="flex gap-1.5">
          <button className="bg-[#FF6A00] hover:bg-[#FF8C00] transition text-white px-3.5 py-1.5 rounded-lg text-[11px] font-semibold">
            Browse deals
          </button>
          <button className="bg-white/10 text-[#FFE566] px-3.5 py-1.5 rounded-lg text-[11px] font-semibold border border-yellow-300/30">
            Post RFQ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-white/10 relative z-10">
        {[
          { n: "50K+", l: "Products" },
          { n: "3,200", l: "Suppliers" },
          { n: "99%",  l: "On-time"   },
        ].map((s, i) => (
          <div
            key={s.l}
            className={`py-2.5 text-center ${i < 2 ? "border-r border-white/10" : ""}`}
          >
            <div className="font-display text-sm font-bold text-[#FFE566]">{s.n}</div>
            <div className="text-[9.5px] text-white/50 mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
