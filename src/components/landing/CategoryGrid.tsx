import {
  Monitor, Settings, Shirt, Truck, HeartPulse, ShieldCheck,
  FlaskConical, Package, Layers, Users, type LucideIcon,
} from "lucide-react";
import { categories } from "./data";

const ICON_MAP: Record<string, LucideIcon> = {
  Monitor, Settings, Shirt, Truck, HeartPulse, ShieldCheck,
  FlaskConical, Package, Layers, Users,
};

export default function CategoryGrid() {
  return (
    <section className="mx-2.5 mt-2.5">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-semibold text-neutral-900">Browse categories</h2>
        <button className="text-xs text-[#FF6A00] font-medium">See all ›</button>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {categories.map((c) => {
          const Icon = ICON_MAP[c.icon] ?? Package;
          return (
            <button
              key={c.id}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div
                className={`${c.bg} w-12 h-12 rounded-xl flex items-center justify-center transition group-active:scale-95`}
              >
                <Icon className={`${c.fg} w-[22px] h-[22px]`} strokeWidth={1.8} />
              </div>
              <span className="text-[10px] text-neutral-700 text-center leading-tight font-medium">
                {c.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
