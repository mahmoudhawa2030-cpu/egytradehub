import { Globe, Building2, Calendar, CheckCircle, XCircle, Ban } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { verifySupplier, rejectSupplier, suspendUser } from "@/app/admin/actions";

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "verified" ? "verified" : "pending";
  const supabase = await createClient();

  const [{ data: pendingSuppliers }, { data: verifiedSuppliers }] = await Promise.all([
    supabase
      .from("profiles")
      .select("user_id, full_name, company_name, country, created_at")
      .eq("role", "supplier")
      .eq("is_verified", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("user_id, full_name, company_name, country, created_at")
      .eq("role", "supplier")
      .eq("is_verified", true)
      .order("created_at", { ascending: false }),
  ]);

  const pending = pendingSuppliers ?? [];
  const verified = verifiedSuppliers ?? [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">Suppliers</h1>
          <p className="text-neutral-500 mt-1">Verify new suppliers and manage existing ones</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg p-1">
          <a
            href="/admin/suppliers?tab=pending"
            className={`px-4 py-2 rounded-md font-medium text-sm transition ${
              activeTab === "pending" ? "bg-[#FF6A00] text-white" : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            Pending ({pending.length})
          </a>
          <a
            href="/admin/suppliers?tab=verified"
            className={`px-4 py-2 rounded-md font-medium text-sm transition ${
              activeTab === "verified" ? "bg-[#FF6A00] text-white" : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            Verified ({verified.length})
          </a>
        </div>
      </div>

      {/* Content */}
      {activeTab === "pending" ? (
        <div className="space-y-4">
          {pending.length === 0 && (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400">
              No pending supplier applications.
            </div>
          )}
          {pending.map((supplier) => {
            const name = supplier.company_name ?? supplier.full_name ?? "Unknown";
            return (
              <div key={supplier.user_id} className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-orange-100 text-[#FF6A00] flex items-center justify-center font-bold text-lg">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-neutral-900">{name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
                        {supplier.country && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            {supplier.country}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Applied {new Date(supplier.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1 font-mono">{supplier.user_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <form action={rejectSupplier.bind(null, supplier.user_id)}>
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50 transition"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </form>
                    <form action={verifySupplier.bind(null, supplier.user_id)}>
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Verify
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          {verified.length === 0 ? (
            <p className="p-12 text-center text-neutral-400">No verified suppliers yet.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Supplier</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Country</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Member Since</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {verified.map((supplier) => {
                  const name = supplier.company_name ?? supplier.full_name ?? "Unknown";
                  return (
                    <tr key={supplier.user_id} className="hover:bg-neutral-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm">
                            {name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">{name}</p>
                            <p className="text-xs text-neutral-400 font-mono">{supplier.user_id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        <span className="flex items-center gap-1">
                          <Globe className="w-4 h-4 text-neutral-400" />
                          {supplier.country ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {new Date(supplier.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <form action={suspendUser.bind(null, supplier.user_id)}>
                          <button
                            type="submit"
                            className="flex items-center gap-1 ml-auto px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition"
                          >
                            <Ban className="w-4 h-4" />
                            Suspend
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
