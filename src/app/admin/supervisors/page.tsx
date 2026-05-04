"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, ShieldCheck, Trash2, UserCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  role: string;
  is_verified: boolean;
  country: string | null;
  created_at: string;
};

export default function SupervisorsPage() {
  const supabase = createClient();
  const [supervisors, setSupervisors] = useState<Profile[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showPicker, setShowPicker] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, full_name, company_name, role, is_verified, country, created_at")
      .order("created_at", { ascending: false });
    const all = (data as Profile[]) ?? [];
    setSupervisors(all.filter((u) => u.role === "supervisor"));
    setAllUsers(all.filter((u) => u.role !== "admin" && u.role !== "supervisor"));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function promote(userId: string) {
    startTransition(async () => {
      await supabase.from("profiles").update({ role: "supervisor" }).eq("user_id", userId);
      setShowPicker(false);
      await load();
    });
  }

  function demote(userId: string) {
    if (!confirm("Remove supervisor role from this user?")) return;
    startTransition(async () => {
      await supabase.from("profiles").update({ role: "buyer" }).eq("user_id", userId);
      await load();
    });
  }

  function displayName(u: Profile) {
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Supervisors</h1>
          <p className="text-neutral-500 mt-1">Manage who has supervisor-level access</p>
        </div>
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF6A00] text-white rounded-lg font-semibold text-sm hover:bg-[#FF8C00] transition"
        >
          <Plus className="w-4 h-4" />
          Add Supervisor
        </button>
      </div>

      {/* User picker modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[80vh] flex flex-col">
            <h2 className="font-semibold text-neutral-900 mb-4">Promote user to Supervisor</h2>
            <div className="flex-1 overflow-y-auto space-y-2">
              {allUsers.length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-6">No eligible users</p>
              )}
              {allUsers.map((u) => (
                <button
                  key={u.user_id}
                  onClick={() => promote(u.user_id)}
                  disabled={isPending}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-orange-50 transition text-left disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#FF6A00] text-xs font-bold">{displayName(u).charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 text-sm truncate">{displayName(u)}</p>
                    <p className="text-xs text-neutral-400 capitalize">{u.role} · {u.country ?? "—"}</p>
                  </div>
                  <UserCheck className="w-4 h-4 text-[#FF6A00]" />
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPicker(false)}
              className="mt-4 w-full py-2 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Supervisors list */}
      {supervisors.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-12 text-center">
          <ShieldCheck className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="font-medium text-neutral-600">No supervisors yet</p>
          <p className="text-sm text-neutral-400 mt-1">Promote a user to give them supervisor access.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Country</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {supervisors.map((u) => (
                <tr key={u.user_id} className="hover:bg-neutral-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-700 text-xs font-bold">{displayName(u).charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 text-sm">{displayName(u)}</p>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">Supervisor</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{u.country ?? "—"}</td>
                  <td className="px-6 py-4 text-sm text-neutral-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => demote(u.user_id)}
                      disabled={isPending}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition disabled:opacity-50 ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
