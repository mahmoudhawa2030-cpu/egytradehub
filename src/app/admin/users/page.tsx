import { createClient } from "@/lib/supabase/server";
import { changeUserRole, suspendUser } from "@/app/admin/actions";
import { Users, ShieldCheck, ShoppingBag, UserX } from "lucide-react";

const ROLES = ["buyer", "supplier", "admin"] as const;
type Role = (typeof ROLES)[number];

const roleBadge: Record<Role, string> = {
  buyer: "bg-blue-100 text-blue-700",
  supplier: "bg-green-100 text-green-700",
  admin: "bg-orange-100 text-[#FF6A00]",
};

const roleIcon: Record<Role, React.ElementType> = {
  buyer: ShoppingBag,
  supplier: ShieldCheck,
  admin: Users,
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role: filterRole } = await searchParams;
  const supabase = await createClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  let query = supabase
    .from("profiles")
    .select("user_id, full_name, company_name, country, role, is_verified, created_at")
    .order("created_at", { ascending: false });

  if (filterRole && ROLES.includes(filterRole as Role)) {
    query = query.eq("role", filterRole);
  }

  const { data: users } = await query;
  const list = users ?? [];

  const counts = {
    all: list.length,
    buyer: list.filter((u) => u.role === "buyer").length,
    supplier: list.filter((u) => u.role === "supplier").length,
    admin: list.filter((u) => u.role === "admin").length,
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">Users</h1>
          <p className="text-neutral-500 mt-1">Manage all platform users and their roles</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {(["all", "buyer", "supplier", "admin"] as const).map((r) => (
          <a
            key={r}
            href={r === "all" ? "/admin/users" : `/admin/users?role=${r}`}
            className={`bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3 transition hover:border-[#FF6A00] ${
              (r === "all" && !filterRole) || filterRole === r ? "border-[#FF6A00]" : "border-neutral-200"
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              r === "all" ? "bg-neutral-100" :
              r === "buyer" ? "bg-blue-50" :
              r === "supplier" ? "bg-green-50" : "bg-orange-50"
            }`}>
              <Users className={`w-5 h-5 ${
                r === "all" ? "text-neutral-500" :
                r === "buyer" ? "text-blue-600" :
                r === "supplier" ? "text-green-600" : "text-[#FF6A00]"
              }`} />
            </div>
            <div>
              <p className="text-xs text-neutral-500 capitalize">{r === "all" ? "All Users" : `${r}s`}</p>
              <p className="text-xl font-bold text-neutral-900">{r === "all" ? list.length : counts[r]}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {list.length === 0 ? (
          <p className="p-12 text-center text-neutral-400">No users found.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Country</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Verified</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Joined</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {list.map((user) => {
                const name = user.company_name ?? user.full_name ?? "Unknown";
                const role = user.role as Role;
                const RoleIcon = roleIcon[role];
                const isSelf = user.user_id === currentUser?.id;
                return (
                  <tr key={user.user_id} className="hover:bg-neutral-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-sm text-neutral-600">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{name}</p>
                          <p className="text-xs text-neutral-400 font-mono">{user.user_id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{user.country ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleBadge[role]}`}>
                        <RoleIcon className="w-3 h-3" />
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_verified ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Yes</span>
                      ) : (
                        <span className="px-2 py-1 bg-neutral-100 text-neutral-500 rounded-full text-xs font-medium">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isSelf ? (
                        <span className="text-xs text-neutral-400 italic">You</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <form action={async (fd: FormData) => {
                            "use server";
                            const newRole = fd.get("role") as Role;
                            await changeUserRole(user.user_id, newRole);
                          }} className="flex items-center gap-2">
                            <select
                              name="role"
                              defaultValue={role}
                              className="text-sm border border-neutral-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#FF6A00]"
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="text-xs px-3 py-1.5 bg-[#FF6A00] text-white rounded-lg hover:bg-[#FF8C00] transition"
                            >
                              Change
                            </button>
                          </form>
                          {role !== "admin" && (
                            <form action={suspendUser.bind(null, user.user_id)}>
                              <button
                                type="submit"
                                className="p-1.5 hover:bg-red-50 rounded-lg transition"
                                title="Suspend user"
                              >
                                <UserX className="w-4 h-4 text-red-500" />
                              </button>
                            </form>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
