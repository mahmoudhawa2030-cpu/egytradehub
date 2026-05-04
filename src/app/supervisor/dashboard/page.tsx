import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MessageSquare, Users, ShieldCheck, Package, ArrowRight } from "lucide-react";

export default async function SupervisorDashboard() {
  const supabase = await createClient();

  const [
    { count: openChats },
    { count: pendingProducts },
    { count: pendingRfqs },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", false),
    supabase.from("rfqs").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { title: "Unread Messages", value: openChats ?? 0, icon: MessageSquare, bg: "bg-blue-50", fg: "text-blue-600", href: "/supervisor/chat" },
    { title: "Pending Products", value: pendingProducts ?? 0, icon: Package, bg: "bg-orange-50", fg: "text-[#FF6A00]", href: "/supervisor/moderation" },
    { title: "Pending RFQs", value: pendingRfqs ?? 0, icon: ShieldCheck, bg: "bg-purple-50", fg: "text-purple-600", href: "/supervisor/moderation" },
    { title: "Total Users", value: totalUsers ?? 0, icon: Users, bg: "bg-green-50", fg: "text-green-600", href: "/supervisor/users" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-neutral-900">Supervisor Dashboard</h1>
        <p className="text-neutral-500 mt-1">Monitor support, moderation and user activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition group"
          >
            <div className={`w-12 h-12 rounded-lg ${s.bg} ${s.fg} flex items-center justify-center mb-4`}>
              <s.icon className="w-6 h-6" />
            </div>
            <p className="text-sm text-neutral-500">{s.title}</p>
            <p className="text-3xl font-bold text-neutral-900 mt-1">{s.value}</p>
            <p className={`text-xs font-medium mt-3 flex items-center gap-1 ${s.fg} opacity-0 group-hover:opacity-100 transition`}>
              View <ArrowRight className="w-3 h-3" />
            </p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-6">
        <Link href="/supervisor/chat" className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 hover:border-blue-300 transition group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="font-semibold text-neutral-900">Live Chat Support</h2>
          </div>
          <p className="text-sm text-neutral-500">View all buyer & supplier conversations and respond as support.</p>
          <p className="text-sm font-medium text-blue-600 mt-4 flex items-center gap-1 group-hover:underline">
            Open Chat <ArrowRight className="w-4 h-4" />
          </p>
        </Link>

        <Link href="/supervisor/moderation" className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 hover:border-orange-300 transition group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#FF6A00]" />
            </div>
            <h2 className="font-semibold text-neutral-900">Moderation</h2>
          </div>
          <p className="text-sm text-neutral-500">Review and approve products, RFQs submitted by suppliers.</p>
          <p className="text-sm font-medium text-[#FF6A00] mt-4 flex items-center gap-1 group-hover:underline">
            Moderate <ArrowRight className="w-4 h-4" />
          </p>
        </Link>

        <Link href="/supervisor/users" className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 hover:border-green-300 transition group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="font-semibold text-neutral-900">User Management</h2>
          </div>
          <p className="text-sm text-neutral-500">Warn or suspend users. Cannot change roles or delete accounts.</p>
          <p className="text-sm font-medium text-green-600 mt-4 flex items-center gap-1 group-hover:underline">
            Manage Users <ArrowRight className="w-4 h-4" />
          </p>
        </Link>
      </div>
    </div>
  );
}
