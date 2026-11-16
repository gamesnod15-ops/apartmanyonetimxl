"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Eye,
  EyeOff,
  Package,
  ShieldCheck,
  Wallet,
  Wrench,
} from "lucide-react";
import { useStore } from "@/app/lib/store";
import { cn } from "@/app/components/ui";

type Tone = "resident" | "admin";

const demoAccounts: Record<Tone, { email: string; password: string; name: string }> = {
  resident: {
    email: "ahmet@apartman.com",
    password: "1234",
    name: "Ahmet Yılmaz · A-12",
  },
  admin: {
    email: "yonetim@apartman.com",
    password: "1234",
    name: "Mehmet Demir · Site Yöneticisi",
  },
};

const features = [
  { icon: Wrench, label: "Fotoğraflı arıza kaydı ve canlı takip" },
  { icon: Wallet, label: "Online aidat ödeme ve borç görünümü" },
  { icon: Package, label: "Kargo teslim takibi ve teslim kodu" },
  { icon: BarChart3, label: "Anketler, toplantılar ve duyurular" },
];

export default function LoginPage() {
  const { login, user, hydrated } = useStore();
  const router = useRouter();
  const [tone, setTone] = useState<Tone>("resident");
  const [email, setEmail] = useState(demoAccounts.resident.email);
  const [password, setPassword] = useState(demoAccounts.resident.password);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!hydrated || !user) return;
    router.replace(user.role === "admin" ? "/yonetim" : "/daire");
  }, [hydrated, user, router]);

  const selectTone = (next: Tone) => {
    setTone(next);
    setEmail(demoAccounts[next].email);
    setPassword(demoAccounts[next].password);
    setError(null);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = login(email, password);
    if (!result.ok || !result.user) {
      setError(result.error ?? "Giriş yapılamadı.");
      setSubmitting(false);
      return;
    }
    router.replace(result.user.role === "admin" ? "/yonetim" : "/daire");
  };

  const isAdmin = tone === "admin";

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      <section
        className={cn(
          "relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between",
          "bg-[#161a21]"
        )}
      >
        <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <Building2 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[16px] font-bold">Apartman Yönetim</p>
            <p className="text-[13.5px] text-white/70">Akıllı site ve apartman yönetimi</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[13.5px] font-semibold ring-1 ring-white/20 backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" />
            PWA · Mobilde ana ekrana eklenebilir
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight">
            Binanızın tüm süreçleri, tek bir uygulamada.
          </h1>
          <p className="mt-3 text-[16px] leading-6 text-white/70">
            Aidat takibi, arıza yönetimi, kargo teslimi, duyurular ve anketler.
            Sakinler ve yönetim aynı platformda buluşuyor.
          </p>

          <ul className="mt-8 space-y-3">
            {features.map((feature) => (
              <li key={feature.label} className="flex items-center gap-3 text-[16px] text-white/85">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <feature.icon className="h-4 w-4" />
                </span>
                {feature.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-4 text-[13.5px] text-white/60">
          <span>20 daire · 2 blok</span>
          <span className="h-1 w-1 rounded-full bg-white/40" />
          <span>Veriler demo amaçlıdır</span>
        </div>
      </section>

      <section className="flex min-h-dvh items-center justify-center px-5 py-10 lg:min-h-0">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-blue-600 text-white shadow-lg shadow-slate-900/15"
            >
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[16px] font-bold text-slate-900">Apartman Yönetim</p>
              <p className="text-[13.5px] text-slate-500">Mobil uyumlu PWA</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Hoş geldiniz
          </h2>
          <p className="mt-1 text-[16px] text-slate-500">
            {isAdmin
              ? "Yönetim paneline erişmek için giriş yapın."
              : "Giriş yapın veya yeni daire kaydınızı oluşturun."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-0.5 rounded-[11px] bg-slate-900/[0.07] p-0.5">
            <button
              type="button"
              onClick={() => selectTone("resident")}
              className={cn(
                "rounded-[9px] px-3 py-2 text-[14px] font-semibold transition",
                !isAdmin
                  ? "bg-white text-slate-900 shadow-[0_1px_4px_rgb(0_0_0/0.14)]"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Daire · Sakin
            </button>
            <button
              type="button"
              onClick={() => selectTone("admin")}
              className={cn(
                "rounded-[9px] px-3 py-2 text-[14px] font-semibold transition",
                isAdmin
                  ? "bg-white text-slate-900 shadow-[0_1px_4px_rgb(0_0_0/0.14)]"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Uygulama Yönetimi
            </button>
          </div>

          <form
            onSubmit={onSubmit}
            className="mt-4 rounded-[22px] bg-white p-5 shadow-soft"
          >
            <div className="mb-4 rounded-2xl bg-slate-900/[0.04] px-4 py-3">
              <p className="text-[13.5px] font-semibold uppercase tracking-wide text-slate-400">
                Demo hesap
              </p>
              <p className="mt-1 text-[16px] font-semibold text-slate-800">
                {demoAccounts[tone].name}
              </p>
              <p className="text-[13.5px] text-slate-500">
                {demoAccounts[tone].email} · şifre 1234
              </p>
            </div>

            <label className="mb-1.5 block text-[14px] font-semibold text-slate-600">
              E-posta
            </label>
            <input
              type="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-transparent bg-slate-900/[0.05] px-4 py-3 text-[17px] outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15"
              placeholder="ornek@apartman.com"
            />

            <label className="mb-1.5 mt-4 block text-[14px] font-semibold text-slate-600">
              Şifre
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-transparent bg-slate-900/[0.05] px-4 py-3 pr-11 text-[17px] outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15"
                placeholder="••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-slate-600"
                aria-label="Şifreyi göster"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error ? (
              <p className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-[14px] font-medium text-red-600 ring-1 ring-red-100">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-blue-600 text-[17px] font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60"
            >
              Giriş Yap
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {!isAdmin ? (
            <Link
              href="/kayit"
              className="mt-3 flex items-center justify-between gap-3 rounded-[22px] bg-white p-4 shadow-soft transition active:scale-[0.99]"
            >
              <span>
                <span className="block text-[14px] font-bold text-slate-800">
                  Daireniz için kayıt oluşturun
                </span>
                <span className="mt-0.5 block text-[13.5px] text-slate-500">
                  Blok, daire, sakin ve iletişim bilgilerinizi 3 adımda girin.
                </span>
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ) : null}

          <p className="mt-4 text-center text-[13.5px] leading-5 text-slate-400">
            Teknik ekip demo hesabı: teknik@apartman.com · 1234
          </p>
        </div>
      </section>
    </div>
  );
}
