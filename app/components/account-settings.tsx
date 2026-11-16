"use client";

import { useState, type FormEvent } from "react";
import { Check, Mail, Phone, Settings, UserRound } from "lucide-react";
import { Button, Card, Input, Label } from "./ui";
import { useStore } from "@/app/lib/store";

export function AccountSettings() {
  const { user, updateProfile } = useStore();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaved(false);
    const result = updateProfile({ name, email, phone });
    if (!result.ok) {
      setError(result.error ?? "Profil güncellenemedi.");
      return;
    }
    setSaved(true);
  };

  return (
    <div className="space-y-4">
      <section className="hero-soft p-6">
        <p className="flex items-center gap-1.5 text-[14px] font-medium text-slate-300">
          <Settings className="h-3.5 w-3.5" />
          Hesap Ayarları
        </p>
        <h1 className="mt-1 text-xl font-bold">Ayarlar</h1>
        <p className="mt-1 text-[13.5px] text-slate-400">
          Profil bilgilerinizi güncelleyin. Değişiklikler giriş bilgilerinize yansır.
        </p>
      </section>

      <Card>
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-[18px] font-bold text-white">
              {user.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toLocaleUpperCase("tr-TR")}
            </span>
            <div>
              <p className="text-[16px] font-bold text-slate-900">
                {user.role === "admin" ? "Yönetici" : `Daire ${user.apartmentId}`}
              </p>
              <p className="text-[13.5px] text-slate-500">
                {user.title ?? (user.role === "admin" ? "Uygulama yönetimi" : "Sakin")}
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="settings-name">Ad Soyad</Label>
            <div className="relative mt-1">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="settings-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="pl-9"
                autoComplete="name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="settings-email">E-posta</Label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="settings-email"
                type="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="pl-9"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="settings-phone">Telefon</Label>
            <div className="relative mt-1">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="settings-phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="pl-9"
                autoComplete="tel"
              />
            </div>
          </div>

          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-[13.5px] font-medium text-red-600 ring-1 ring-red-100">
              {error}
            </p>
          ) : null}

          {saved ? (
            <p className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-[13.5px] font-medium text-emerald-700 ring-1 ring-emerald-100">
              <Check className="h-3.5 w-3.5" />
              Profil bilgileriniz güncellendi.
            </p>
          ) : null}

          <Button type="submit" variant="blue" className="w-full">
            <Check className="h-4 w-4" />
            Değişiklikleri Kaydet
          </Button>
        </form>
      </Card>
    </div>
  );
}
