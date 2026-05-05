import Link from "next/link";
import {
  Monitor, Settings, Shirt, Truck, HeartPulse, ShieldCheck,
  FlaskConical, Package, Layers, Users, Factory, Warehouse,
  Hammer, Zap, Leaf, Building2, ShoppingCart, Globe, type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Monitor, Settings, Shirt, Truck, HeartPulse, ShieldCheck,
  FlaskConical, Package, Layers, Users, Factory, Warehouse,
  Hammer, Zap, Leaf, Building2, ShoppingCart, Globe,
};

const BG_CYCLE = [
  "bg-orange-50", "bg-blue-50", "bg-purple-50", "bg-cyan-50",
  "bg-pink-50", "bg-green-50", "bg-yellow-50", "bg-stone-100",
  "bg-lime-50", "bg-indigo-50",
];
const FG_CYCLE = [
  "text-orange-700", "text-blue-700", "text-purple-700", "text-cyan-800",
  "text-pink-800", "text-green-800", "text-yellow-800", "text-stone-700",
  "text-lime-800", "text-indigo-800",
];

type DbCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
};

export default function CategoryGrid({ categories }: { categories: DbCategory[] }) {
  const active = categories.filter((c) => c.is_active).slice(0, 10);

  return (
    <section className="mx-2.5 mt-2.5">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-semibold text-neutral-900">Browse categories</h2>
        <Link href="/categories" className="text-xs text-[#FF6A00] font-medium">See all ›</Link>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {active.map((c, i) => {
          const Icon = (c.icon ? ICON_MAP[c.icon] : null) ?? Package;
          const bg = BG_CYCLE[i % BG_CYCLE.length];
          const fg = FG_CYCLE[i % FG_CYCLE.length];
          return (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className={`${bg} w-12 h-12 rounded-xl flex items-center justify-center transition group-active:scale-95 overflow-hidden`}>
                {c.thumbnail_url ? (
                  <img src={c.thumbnail_url} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <Icon className={`${fg} w-[22px] h-[22px]`} strokeWidth={1.8} />
                )}
              </div>
              <span className="text-[10px] text-neutral-700 text-center leading-tight font-medium line-clamp-2">
                {c.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
