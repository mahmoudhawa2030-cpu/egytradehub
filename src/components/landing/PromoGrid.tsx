export default function PromoGrid() {
  return (
    <section className="mx-2.5 mt-2.5 grid grid-cols-2 gap-2">
      <button className="text-left rounded-2xl p-3.5 bg-gradient-to-br from-[#FF6A00] to-[#FF8C00]">
        <div className="text-[9.5px] font-bold mb-1 tracking-[0.05em] uppercase text-[#FFE566]">
          Free freight
        </div>
        <div className="text-[12.5px] font-semibold leading-snug mb-1.5 text-white">
          50+ unit orders ship free this week
        </div>
        <div className="text-[11px] font-semibold text-[#FFE566]">Claim offer ›</div>
      </button>
      <button className="text-left rounded-2xl p-3.5 bg-gradient-to-br from-neutral-900 to-neutral-800">
        <div className="text-[9.5px] font-bold mb-1 tracking-[0.05em] uppercase text-[#FF6A00]">
          Net-30 terms
        </div>
        <div className="text-[12.5px] font-semibold leading-snug mb-1.5 text-white">
          Buy now, pay in 30 days — apply instantly
        </div>
        <div className="text-[11px] font-semibold text-[#FF6A00]">Apply now ›</div>
      </button>
    </section>
  );
}
