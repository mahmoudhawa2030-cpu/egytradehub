import { createClient } from "@/lib/supabase/server";
import { Users, ShieldCheck, ShoppingBag, ShieldBan } from "lucide-react";
import AddUserModal from "./AddUserModal";
import UserActions from "./UserActions";

const ROLES = ["buyer", "supplier", "admin", "supervisor"] as const;
type Role = (typeof ROLES)[number];

const roleBadge: Record<Role, string> = {
  buyer: "bg-blue-100 text-blue-700",
  supplier: "bg-green-100 text-green-700",
  admin: "bg-orange-100 text-[#FF6A00]",
  supervisor: "bg-purple-100 text-purple-700",
};

const roleIcon: Record<Role, React.ElementType> = {
  buyer: ShoppingBag,
  supplier: ShieldCheck,
  admin: Users,
  supervisor: ShieldCheck,
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  try {
  const { role: filterRole } = await searchParams;
  const supabase = await createClient();

  const authResult = await supabase.auth.getUser();
  const currentUser = authResult.data?.user ?? null;

  let query = supabase
    .from("profiles")
    .select("user_id, full_name, company_name, country, role, is_verified, created_at")
    .order("created_at", { ascending: false });

  if (filterRole && ROLES.includes(filterRole as Role)) {
    query = query.eq("role", filterRole);
  }

  const { data: users, error: usersError } = await query;
  const list = users ?? [];

  if (usersError) {
    return (
      <div className="p-8">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <p className="font-semibold mb-1">Database error</p>
          <p className="text-sm font-mono">{usersError.message}</p>
        </div>
      </div>
    );
  }

  const counts = {
    buyer: list.filter((u) => u.role === "buyer").length,
    supplier: list.filter((u) => u.role === "supplier").length,
    admin: list.filter((u) => u.role === "admin").length,
    banned: list.filter((u) => (u as { is_banned?: boolean }).is_banned === true).length,
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">Users</h1>
          <p className="text-neutral-500 mt-1">Manage all platform users and their roles</p>
        </div>
        <AddUserModal />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {([
          { key: "all", label: "All Users", count: list.length, color: "bg-neutral-100 text-neutral-500", border: "bg-neutral-50" },
          { key: "buyer", label: "Buyers", count: counts.buyer, color: "bg-blue-50 text-blue-600", border: "bg-blue-50" },
          { key: "supplier", label: "Suppliers", count: counts.supplier, color: "bg-green-50 text-green-600", border: "bg-green-50" },
          { key: "admin", label: "Admins", count: counts.admin, color: "bg-orange-50 text-[#FF6A00]", border: "bg-orange-50" },
        ] as const).map((s) => (
          <a
            key={s.key}
            href={s.key === "all" ? "/admin/users" : `/admin/users?role=${s.key}`}
            className={`bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3 transition hover:border-[#FF6A00] ${
              (s.key === "all" && !filterRole) || filterRole === s.key ? "border-[#FF6A00]" : "border-neutral-200"
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">{s.label}</p>
              <p className="text-xl font-bold text-neutral-900">{s.count}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Banned alert strip */}
      {counts.banned > 0 && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <ShieldBan className="w-4 h-4 flex-shrink-0" />
          <span><strong>{counts.banned}</strong> banned {counts.banned === 1 ? "user" : "users"} in this list.</span>
        </div>
      )}

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
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Status</th>
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
                const isBanned = (user as { is_banned?: boolean }).is_banned === true;
                return (
                  <tr key={user.user_id} className={`hover:bg-neutral-50 transition ${isBanned ? "opacity-60" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          isBanned ? "bg-red-100 text-red-500" : "bg-neutral-100 text-neutral-600"
                        }`}>
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
                    <td className="px-6 py-4">
                      {isBanned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          <ShieldBan className="w-3 h-3" /> Banned
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isSelf ? (
                        <span className="text-xs text-neutral-400 italic">You</span>
                      ) : (
                        <UserActions user={{
                          user_id: user.user_id,
                          full_name: user.full_name,
                          company_name: user.company_name,
                          country: user.country,
                          role: user.role,
                          is_verified: user.is_verified,
                          is_banned: isBanned,
                        }} />
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Users page crashed: ${message}`);
  }
}
