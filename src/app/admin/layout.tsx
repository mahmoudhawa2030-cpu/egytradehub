import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Tag,
} from "lucide-react";

async function getUserRoleAndMessages(): Promise<{ role: string | null; loggedIn: boolean; unreadCount: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { role: null, loggedIn: false, unreadCount: 0 };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  // Count unread messages received by this admin/supervisor
  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  return { role: profile?.role ?? null, loggedIn: true, unreadCount: count ?? 0 };
}

const navItems = (unreadCount: number) => [
  { icon: LayoutDashboard, label: "Dashboard",  href: "/admin/dashboard" },
  { icon: Package,         label: "Inventory",  href: "/admin/inventory" },
  { icon: Tag,             label: "Categories", href: "/admin/categories" },
  { icon: Users,           label: "Suppliers",  href: "/admin/suppliers" },
  { icon: ShoppingCart,    label: "Orders",     href: "/admin/orders" },
  { icon: MessageSquare,   label: "RFQs",       href: "/admin/rfqs" },
  { icon: MessageSquare,   label: "Messages",   href: "/supervisor/chat", badge: unreadCount > 0 ? unreadCount : null },
  { icon: Users,           label: "Users",      href: "/admin/users" },
  { icon: Users,           label: "Supervisors", href: "/admin/supervisors" },
  { icon: BarChart3,       label: "Analytics",  href: "/admin/analytics" },
  { icon: Settings,        label: "Settings",   href: "/admin/settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, loggedIn, unreadCount } = await getUserRoleAndMessages();

  if (!loggedIn) {
    redirect("/en/login");
  }

  if (role !== "admin" && role !== "supervisor") {
    redirect("/en");
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex-shrink-0">
        <div className="p-6 border-b border-neutral-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6A00] to-[#FF8C00] flex items-center justify-center">
              <span className="text-white font-display text-sm font-bold">T</span>
            </div>
            <span className="font-display font-bold text-neutral-900">
              Trade<span className="text-[#FF6A00]">Hub</span>
            </span>
          </Link>
          <p className="text-xs text-neutral-500 mt-2">Admin Panel</p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems(unreadCount).map(({ icon: Icon, label, href, badge }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-700 hover:bg-orange-50 hover:text-[#FF6A00] transition"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                  {badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 border-t border-neutral-200 bg-white">
          <Link
            href="/en"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-700 hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Exit Admin</span>
          </Link>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
