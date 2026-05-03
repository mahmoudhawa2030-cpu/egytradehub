"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Building2, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/context";

type ProfileRole = "buyer" | "supplier" | "admin";
type State = "idle" | "loading" | "success" | "error";

export default function SignupPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    companyName: "",
    country: "",
    role: "buyer" as ProfileRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          company_name: form.companyName,
          country: form.country,
          role: form.role,
        },
      },
    });

    if (authError) { setState("error"); setErrorMsg(authError.message); return; }
    if (!authData.user) { setState("error"); setErrorMsg("Failed to create account."); return; }

    await supabase.from("profiles").insert({
      user_id: authData.user.id,
      role: form.role,
      full_name: form.fullName,
      company_name: form.companyName,
      country: form.country,
      is_verified: false,
    });

    setState("success");
    setTimeout(() => {
      if (form.role === "admin") router.push(`/${locale}/admin/dashboard`);
      else if (form.role === "supplier") router.push(`/${locale}/supplier/dashboard`);
      else router.push(`/${locale}`);
      router.refresh();
    }, 1500);
  }

  if (state === "success") {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">{t.auth.accountCreated}</h2>
          <p className="text-neutral-600">{t.auth.redirecting}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#FF8C00] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-display text-xl font-bold">T</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">{t.auth.createAccount}</h1>
          <p className="text-sm text-neutral-500 mt-2">{t.auth.createAccountSubtitle}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-2">{t.auth.iWantTo}</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { id: "buyer", label: t.auth.buyProducts, icon: User },
              { id: "supplier", label: t.auth.sellProducts, icon: Building2 },
              { id: "admin", label: t.auth.manage, icon: Building2 },
            ] as const).map(({ id, label, icon: Icon }) => {
              const active = form.role === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => update("role", id)}
                  className={[
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition",
                    active ? "border-[#FF6A00] bg-orange-50 text-[#FF6A00]" : "border-neutral-200 hover:border-neutral-300 text-neutral-600",
                  ].join(" ")}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t.auth.fullName}</label>
              <input type="text" required value={form.fullName} onChange={(e) => update("fullName", e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t.auth.country}</label>
              <input type="text" required value={form.country} onChange={(e) => update("country", e.target.value)}
                placeholder="Egypt"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t.auth.companyName}</label>
            <input type="text" value={form.companyName} onChange={(e) => update("companyName", e.target.value)}
              placeholder="Acme Industrial Co."
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100" />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t.auth.email}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t.auth.password}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input type={showPassword ? "text" : "password"} required minLength={8}
                value={form.password} onChange={(e) => update("password", e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-neutral-400 mt-1.5">{t.auth.passwordHint}</p>
          </div>

          {state === "error" && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{errorMsg}</div>
          )}

          <button type="submit" disabled={state === "loading"}
            className="w-full bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 hover:shadow-lg transition">
            {state === "loading" ? (
              <><Loader2 className="w-5 h-5 animate-spin" />{t.auth.creatingAccount}</>
            ) : (
              <>{t.auth.createAccount}<ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-600 mt-6">
          {t.auth.alreadyHaveAccount}{" "}
          <Link href={`/${locale}/login`} className="text-[#FF6A00] font-semibold hover:underline">{t.common.signIn}</Link>
        </p>
        <Link href={`/${locale}`} className="block text-center text-sm text-neutral-400 mt-4 hover:text-neutral-600">
          {t.auth.backToHome}
        </Link>
      </div>
    </div>
  );
}
