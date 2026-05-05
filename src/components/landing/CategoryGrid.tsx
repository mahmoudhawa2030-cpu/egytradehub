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
  parent_id: string | null;
};

export default function CategoryGrid({ categories }: { categories: DbCategory[] }) {
  const topLevel = categories
    .filter((c) => c.is_active && c.parent_id === null)
    .slice(0, 10);

  const subsByParent: Record<string, DbCategory[]> = {};
  categories.forEach((c) => {
    if (c.parent_id) {
      if (!subsByParent[c.parent_id]) subsByParent[c.parent_id] = [];
      subsByParent[c.parent_id].push(c);
    }
  });

  return (
    <section className="mx-2.5 mt-2.5">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-semibold text-neutral-900">Browse categories</h2>
        <Link href="/categories" className="text-xs text-[#FF6A00] font-medium">See all ›</Link>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {topLevel.map((c, i) => {
          const Icon = (c.icon ? ICON_MAP[c.icon] : null) ?? Package;
          const bg = BG_CYCLE[i % BG_CYCLE.length];
          const fg = FG_CYCLE[i % FG_CYCLE.length];
          const subs = subsByParent[c.id] ?? [];
          return (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div className={`${bg} w-12 h-12 rounded-xl flex items-center justify-center transition group-active:scale-95 overflow-hidden relative`}>
                {c.thumbnail_url ? (
                  <img src={c.thumbnail_url} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <Icon className={`${fg} w-[22px] h-[22px]`} strokeWidth={1.8} />
                )}
                {subs.length > 0 && (
                  <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-white/90 rounded-full text-[7px] font-bold text-neutral-600 flex items-center justify-center leading-none shadow-sm">
                    {subs.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-neutral-700 text-center leading-tight font-medium line-clamp-2">
                {c.name}
              </span>
              {subs.length > 0 && (
                <div className="flex flex-wrap justify-center gap-0.5 mt-0.5">
                  {subs.slice(0, 2).map((s) => (
                    <span
                      key={s.id}
                      className="text-[8px] leading-tight text-neutral-400 truncate max-w-[44px]"
                    >
                      {s.name}
                    </span>
                  ))}
                  {subs.length > 2 && (
                    <span className="text-[8px] leading-tight text-neutral-400">+{subs.length - 2}</span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
