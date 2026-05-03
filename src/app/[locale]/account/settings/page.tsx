"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/context";

type ProfileForm = {
  full_name: string;
  company_name: string;
  country: string;
};

const inputCls =
  "w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100 bg-white";

export default function AccountSettingsPage() {
  const { locale } = useI18n();
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [form, setForm] = useState<ProfileForm>({ full_name: "", company_name: "", country: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace(`/${locale}/login`); return; }
      setEmail(user.email ?? "");

      const { data } = await supabase
        .from("profiles")
        .select("full_name, company_name, country")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setForm({
          full_name: data.full_name ?? "",
          company_name: data.company_name ?? "",
          country: data.country ?? "",
        });
      }
      setLoading(false);
    }
    load();
  }, [supabase, router, locale]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: err } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name || null,
        company_name: form.company_name || null,
        country: form.country || null,
      })
      .eq("user_id", user.id);

    if (err) {
      setError(err.message);
      setStatus("error");
    } else {
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-8 h-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href={`/${locale}/account`} className="p-2 hover:bg-neutral-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Account Settings</h1>
            <p className="text-sm text-neutral-500">Update your profile information</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
        )}
        {status === "saved" && (
          <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            Changes saved successfully.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Account info (read-only) */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-neutral-900">Account</h2>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
              <input
                value={email}
                disabled
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-sm bg-neutral-50 text-neutral-500 cursor-not-allowed"
              />
              <p className="text-xs text-neutral-400 mt-1">Email cannot be changed here.</p>
            </div>
          </div>

          {/* Profile fields */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-neutral-900">Profile</h2>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full Name</label>
              <input
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                placeholder="Your full name"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Company Name</label>
              <input
                value={form.company_name}
                onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
                placeholder="Your company (optional)"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Country</label>
              <input
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                placeholder="e.g. Egypt"
                className={inputCls}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#FF6A00] text-white font-semibold rounded-xl hover:bg-[#FF8C00] transition disabled:opacity-60"
          >
            {status === "saving" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {status === "saving" ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
