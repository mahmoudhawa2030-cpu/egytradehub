import { CheckCircle2, Truck, Loader2 } from "lucide-react";
import { recentOrders, type RecentOrder } from "./data";

const STATUS_META: Record<
  RecentOrder["status"],
  { label: string; bg: string; fg: string; iconBg: string; iconFg: string; Icon: typeof CheckCircle2 }
> = {
  delivered:  { label: "Delivered",  bg: "bg-green-100",  fg: "text-green-800",  iconBg: "bg-green-100",  iconFg: "text-green-700",  Icon: CheckCircle2 },
  in_transit: { label: "In transit", bg: "bg-orange-100", fg: "text-orange-800", iconBg: "bg-orange-100", iconFg: "text-orange-700", Icon: Truck },
  processing: { label: "Processing", bg: "bg-blue-100",   fg: "text-blue-800",   iconBg: "bg-blue-100",   iconFg: "text-blue-700",   Icon: Loader2 },
};

export default function RecentOrders() {
  return (
    <section className="mx-2.5 mt-2.5 mb-4">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-semibold text-neutral-900">Recent orders</h2>
        <button className="text-xs text-[#FF6A00] font-medium">View all ›</button>
      </div>

      <div className="bg-white rounded-2xl p-3 border border-neutral-200">
        {recentOrders.map((o, i) => {
          const meta = STATUS_META[o.status];
          const { Icon } = meta;
          return (
            <div
              key={o.id}
              className={`flex items-center gap-2.5 py-2 ${
                i < recentOrders.length - 1 ? "border-b border-neutral-100" : ""
              }`}
            >
              <div className={`w-9 h-9 rounded-xl ${meta.iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${meta.iconFg}`} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-neutral-900 truncate">
                  #{o.id}
                </div>
                <div className="text-[10.5px] text-neutral-500 mt-px truncate">
                  {o.description}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-semibold text-neutral-900 tabular-nums">
                  ${o.amount.toLocaleString()}
                </div>
                <div className={`text-[9.5px] px-1.5 py-0.5 rounded inline-block font-semibold ${meta.bg} ${meta.fg} mt-0.5`}>
                  {meta.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
