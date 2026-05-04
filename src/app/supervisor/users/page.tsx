"use client";

import { useEffect, useState, useTransition } from "react";
import { Search, ShieldOff, ShieldCheck, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type User = {
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  role: string;
  is_verified: boolean;
  is_banned: boolean;
  country: string | null;
  created_at: string;
};

const ROLE_COLORS: Record<string, string> = {
  buyer:    "bg-blue-100 text-blue-700",
  supplier: "bg-orange-100 text-orange-700",
  admin:    "bg-red-100 text-red-700",
  supervisor: "bg-purple-100 text-purple-700",
};

export default function SupervisorUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [warnMsg, setWarnMsg] = useState<{ userId: string; msg: string } | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name, company_name, role, is_verified, is_banned, country, created_at")
        .order("created_at", { ascending: false });
      setUsers((data as User[]) ?? []);
      setFiltered((data as User[]) ?? []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      users.filter((u) =>
        (u.full_name ?? "").toLowerCase().includes(q) ||
        (u.company_name ?? "").toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      )
    );
  }, [search, users]);

  function toggleBan(userId: string, current: boolean) {
    startTransition(async () => {
      await supabase.from("profiles").update({ is_banned: !current }).eq("user_id", userId);
      setUsers((prev) => prev.map((u) => u.user_id === userId ? { ...u, is_banned: !current } : u));
    });
  }

  function displayName(u: User) {
    return u.company_name ?? u.full_name ?? "Unknown";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">User Management</h1>
        <p className="text-neutral-500 mt-1">Suspend or warn users. Role changes are admin-only.</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, company or role..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 shadow-sm"
        />
      </div>

      {/* Warn modal */}
      {warnMsg && (
        <WarnModal
          userId={warnMsg.userId}
          onClose={() => setWarnMsg(null)}
          supabase={supabase}
        />
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide">User</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide">Country</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wide">Verified</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wide">Status</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map((u) => (
              <tr key={u.user_id} className={`hover:bg-neutral-50 transition ${u.is_banned ? "opacity-60" : ""}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#FF6A00] text-xs font-bold">{displayName(u).charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 text-sm">{displayName(u)}</p>
                      <p className="text-xs text-neutral-400 font-mono">{u.user_id.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[u.role] ?? "bg-neutral-100 text-neutral-600"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">{u.country ?? "—"}</td>
                <td className="px-6 py-4 text-center">
                  {u.is_verified ? (
                    <ShieldCheck className="w-4 h-4 text-green-500 mx-auto" />
                  ) : (
                    <ShieldOff className="w-4 h-4 text-neutral-300 mx-auto" />
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.is_banned ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {u.is_banned ? "Suspended" : "Active"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {/* Supervisors cannot act on admins or other supervisors */}
                  {(u.role === "admin" || u.role === "supervisor") ? (
                    <span className="text-xs text-neutral-300 italic">Protected</span>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setWarnMsg({ userId: u.user_id, msg: "" })}
                        title="Send Warning"
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium hover:bg-orange-100 transition"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> Warn
                      </button>
                      <button
                        onClick={() => toggleBan(u.user_id, u.is_banned)}
                        disabled={isPending}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 ${
                          u.is_banned
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        {u.is_banned ? <><ShieldCheck className="w-3.5 h-3.5" /> Restore</> : <><ShieldOff className="w-3.5 h-3.5" /> Suspend</>}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WarnModal({
  userId,
  onClose,
  supabase,
}: {
  userId: string;
  onClose: () => void;
  supabase: ReturnType<typeof createClient>;
}) {
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function send() {
    if (!msg.trim()) return;
    setSending(true);
    await supabase.from("messages").insert({
      sender_id: (await supabase.auth.getUser()).data.user?.id,
      receiver_id: userId,
      room_id: `warning:${userId}`,
      content: `⚠️ Warning from Support: ${msg.trim()}`,
    });
    setSending(false);
    setSent(true);
    setTimeout(onClose, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="font-semibold text-neutral-900">Send Warning</h2>
        </div>
        {sent ? (
          <p className="text-green-600 font-medium text-center py-4">Warning sent!</p>
        ) : (
          <>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              rows={4}
              placeholder="Describe the warning reason..."
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 resize-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition">
                Cancel
              </button>
              <button
                onClick={send}
                disabled={!msg.trim() || sending}
                className="px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Warning"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
