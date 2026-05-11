"use client";

import { useState, useTransition } from "react";
import { X, Pencil } from "lucide-react";
import { updateUserProfile } from "@/app/admin/actions";

const ROLES = ["buyer", "supplier", "admin", "supervisor"] as const;

interface UserProfile {
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  country: string | null;
  role: string;
  is_verified: boolean;
  is_banned: boolean;
}

export default function EditUserModal({ user }: { user: UserProfile }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateUserProfile(user.user_id, {
        full_name: fd.get("full_name") as string,
        company_name: (fd.get("company_name") as string) || undefined,
        country: (fd.get("country") as string) || undefined,
        role: fd.get("role") as string,
        is_verified: fd.get("is_verified") === "true",
      });
      if (result && "error" in result) {
        setError(result.error as string);
      } else {
        setOpen(false);
      }
    });
  }

  const displayName = user.company_name ?? user.full_name ?? "User";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 hover:bg-neutral-100 rounded-lg transition"
        title="Edit user"
      >
        <Pencil className="w-4 h-4 text-neutral-500" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Edit User</h2>
                <p className="text-sm text-neutral-500 mt-0.5 truncate max-w-xs">{displayName}</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-neutral-100 rounded-lg transition">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full Name</label>
                  <input
                    name="full_name"
                    defaultValue={user.full_name ?? ""}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Company Name</label>
                  <input
                    name="company_name"
                    defaultValue={user.company_name ?? ""}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Country</label>
                  <input
                    name="country"
                    defaultValue={user.country ?? ""}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Role</label>
                  <select
                    name="role"
                    defaultValue={user.role}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6A00]"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Verified Status</label>
                <select
                  name="is_verified"
                  defaultValue={user.is_verified ? "true" : "false"}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6A00]"
                >
                  <option value="true">Verified</option>
                  <option value="false">Not Verified</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-lg text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 bg-[#FF6A00] text-white rounded-lg text-sm font-semibold hover:bg-[#FF8C00] transition disabled:opacity-60"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
