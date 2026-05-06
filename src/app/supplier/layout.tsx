import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LayoutDashboard, Package, PlusCircle, LogOut, ShoppingCart, MessageSquare } from "lucide-react";

async function getSupplier() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, company_name")
    .eq("user_id", user.id)
    .single();
  if (!profile || (profile.role !== "supplier" && profile.role !== "admin" && profile.role !== "supervisor")) return null;
  return { ...profile, id: user.id };
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",    href: "/supplier/dashboard" },
  { icon: Package,         label: "My Products",  href: "/supplier/products" },
  { icon: PlusCircle,      label: "Add Product",  href: "/supplier/products/add" },
  { icon: ShoppingCart,    label: "Orders",       href: "/supplier/orders" },
  { icon: MessageSquare,   label: "Messages",     href: "/en/messages" },
];

export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
  const supplier = await getSupplier();

  if (!supplier) {
    redirect("/en/login");
  }

  const displayName = supplier.company_name ?? supplier.full_name ?? "Supplier";

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-neutral-200">
          <Link href="/" className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6A00] to-[#FF8C00] flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-bold text-neutral-900">
              Trade<span className="text-[#FF6A00]">Hub</span>
            </span>
          </Link>
          <div className="bg-orange-50 rounded-lg px-3 py-2">
            <p className="text-xs text-neutral-500">Signed in as</p>
            <p className="text-sm font-semibold text-neutral-900 truncate">{displayName}</p>
            <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Supplier</span>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map(({ icon: Icon, label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-700 hover:bg-orange-50 hover:text-[#FF6A00] transition"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-neutral-200">
          <Link
            href="/en"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-700 hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Exit Portal</span>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
