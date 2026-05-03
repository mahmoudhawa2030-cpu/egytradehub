"use client";

import { useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/context";

type State = "idle" | "loading" | "error";

export default function LoginPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setState("error");
      setErrorMsg(error.message);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", data.user.id)
        .single();

      if (profile?.role === "admin") {
        router.push(`/${locale}/admin/dashboard`);
      } else if (profile?.role === "supplier") {
        router.push(`/${locale}/supplier/dashboard`);
      } else {
        router.push(`/${locale}`);
      }
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#FF8C00] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-display text-xl font-bold">T</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">{t.auth.welcomeBack}</h1>
          <p className="text-sm text-neutral-500 mt-2">{t.auth.signInSubtitle}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t.auth.email}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t.auth.password}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-orange-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-neutral-300 text-[#FF6A00] focus:ring-[#FF6A00]" />
              <span className="text-neutral-600">{t.auth.rememberMe}</span>
            </label>
            <Link href={`/${locale}/forgot-password`} className="text-[#FF6A00] hover:underline font-medium">
              {t.auth.forgotPassword}
            </Link>
          </div>

          {state === "error" && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{errorMsg}</div>
          )}

          <button
            type="submit"
            disabled={state === "loading"}
            className="w-full bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 hover:shadow-lg transition"
          >
            {state === "loading" ? (
              <><Loader2 className="w-5 h-5 animate-spin" />{t.auth.signingIn}</>
            ) : (
              <>{t.common.signIn}<ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-sm text-neutral-400">or</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        <button className="w-full py-3 border border-neutral-200 rounded-xl flex items-center justify-center gap-3 hover:bg-neutral-50 transition">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-sm font-medium text-neutral-700">{t.auth.continueWithGoogle}</span>
        </button>

        <p className="text-center text-sm text-neutral-600 mt-6">
          {t.auth.noAccount}{" "}
          <Link href={`/${locale}/signup`} className="text-[#FF6A00] font-semibold hover:underline">{t.auth.signUp}</Link>
        </p>
        <Link href={`/${locale}`} className="block text-center text-sm text-neutral-400 mt-4 hover:text-neutral-600">
          {t.auth.backToHome}
        </Link>
      </div>
    </div>
  );
}
