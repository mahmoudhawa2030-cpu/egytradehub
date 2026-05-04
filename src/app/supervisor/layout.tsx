import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Users,
  LogOut,
  Package,
} from "lucide-react";

async function getRole(): Promise<{ role: string | null; loggedIn: boolean; name: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { role: null, loggedIn: false, name: "" };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("user_id", user.id)
    .single();
  return { role: profile?.role ?? null, loggedIn: true, name: profile?.full_name ?? "" };
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",    href: "/supervisor/dashboard" },
  { icon: MessageSquare,   label: "Live Chat",     href: "/supervisor/chat" },
  { icon: ShieldCheck,     label: "Moderation",    href: "/supervisor/moderation" },
  { icon: Users,           label: "Users",         href: "/supervisor/users" },
  { icon: Package,         label: "Products",      href: "/supervisor/products" },
];

export default async function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const { role, loggedIn, name } = await getRole();

  if (!loggedIn) redirect("/en/login");
  if (role !== "supervisor" && role !== "admin") redirect("/en");

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-neutral-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6A00] to-[#FF8C00] flex items-center justify-center">
              <span className="text-white font-display text-sm font-bold">T</span>
            </div>
            <span className="font-display font-bold text-neutral-900">
              Trade<span className="text-[#FF6A00]">Hub</span>
            </span>
          </Link>
          <div className="mt-3 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              Supervisor
            </span>
          </div>
          {name && <p className="text-xs text-neutral-500 mt-1 truncate">{name}</p>}
        </div>

        <nav className="p-4 flex-1">
          <ul className="space-y-1">
            {navItems.map(({ icon: Icon, label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-700 hover:bg-blue-50 hover:text-blue-700 transition"
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
            <span className="font-medium">Exit</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
