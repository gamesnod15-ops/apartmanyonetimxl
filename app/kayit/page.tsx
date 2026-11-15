"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Badge, Button, Input, Label, Textarea, cn } from "@/app/components/ui";
import { useStore } from "@/app/lib/store";

const steps = [
  {
    title: "Daire bilgileri",
    description: "Yönetim panelinde görünen daire bilgilerini girin.",
    icon: Building2,
  },
  {
    title: "İletişim",
    description: "Sizinle iletişim kurulacak bilgileri girin.",
    icon: UserRound,
  },
  {
    title: "Hesap",
    description: "Giriş bilgilerinizi belirleyin ve kaydı tamamlayın.",
    icon: ShieldCheck,
  },
];

export default function RegisterPage() {
  const { data, user, hydrated, registerResident } = useStore();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [block, setBlock] = useState("A");
  const [no, setNo] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [residentCount, setResidentCount] = useState("1");
  const [occupancyType, setOccupancyType] = useState<"owner" | "tenant">("owner");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [note, setNote] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!hydrated || !user) return;
    router.replace(user.role === "admin" ? "/yonetim" : "/daire");
  }, [hydrated, user, router]);

  const apartmentId = `${block.trim().toLocaleUpperCase("tr-TR")}-${no.trim()}`;
  const existingApartment = data.apartments.some((item) => item.id === apartmentId);

  const validateStep = () => {
    if (step === 1) {
      if (!block.trim() || !no.trim()) return "Blok ve daire numarası zorunlu.";
      if (ownerName.trim().length < 3) return "Daire sahibi ad soyad en az 3 karakter olmalı.";
      if (Number(residentCount) < 1) return "Dairede en az 1 kişi yaşıyor olmalı.";
    }
    if (step === 2) {
      if (name.trim().length < 3) return "Ad soyad en az 3 karakter olmalı.";
      if (phone.replace(/\D/g, "").length < 10) return "Geçerli bir telefon numarası girin.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return "Geçerli bir e-posta adresi girin.";
      }
    }
    if (step === 3) {
      if (password.length < 4) return "Şifre en az 4 karakter olmalı.";
      if (password !== confirm) return "Şifreler eşleşmiyor.";
      if (!consent) return "Bilgilerin paylaşılması için onay verin.";
    }
    return null;
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setSubmitting(true);
    const result = registerResident({
      block,
      no,
      ownerName,
      residentCount: Math.max(1, Number(residentCount)),
      occupancyType,
      name,
      email,
      phone,
      password,
      vehiclePlate,
      emergencyContactName,
      emergencyContactPhone,
      note,
    });
    if (!result.ok) {
      setError(result.error ?? "Kayıt talebi gönderilemedi.");
      setSubmitting(false);
      return;
    }
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-dvh bg-slate-100 px-5 py-8">
      <div className="mx-auto w-full max-w-xl">
        <Link href="/login" className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-slate-900/15">
            <Building2 className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-bold text-slate-900">Apartman Yönetim</span>
            <span className="block text-[11px] text-slate-500">Daire sakini kaydı</span>
          </span>
        </Link>

        {submitted ? (
          <div className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200 sm:p-8">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
              Kayıt talebiniz alındı
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              <strong className="text-slate-700">{apartmentId}</strong> dairesi için
              başvurunuz yönetime iletildi. Yönetim onayından sonra giriş yapabilirsiniz.
            </p>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Giriş bilgileriniz
              </p>
              <p className="mt-2 text-xs text-slate-600">
                E-posta: <strong className="text-slate-800">{email}</strong>
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Şifre: <strong className="text-slate-800">Belirlediğiniz şifre</strong>
              </p>
            </div>
            <Link href="/login" className="mt-5 block">
              <Button variant="blue" className="w-full">
                Giriş sayfasına dön
              </Button>
            </Link>
            <p className="mt-3 text-[11px] text-slate-400">
              Onay süreci genellikle 1 iş günü içinde tamamlanır.
            </p>
          </div>
        ) : (
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
          <div className="flex items-center gap-2">
            {steps.map((item, index) => {
              const done = step > index + 1;
              const active = step === index + 1;
              return (
                <div key={item.title} className="flex flex-1 items-center gap-2">
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                      done
                        ? "bg-emerald-100 text-emerald-700"
                        : active
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-400"
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : index + 1}
                  </span>
                  <span
                    className={cn(
                      "hidden truncate text-[10px] font-semibold sm:block",
                      active || done ? "text-slate-700" : "text-slate-400"
                    )}
                  >
                    {item.title}
                  </span>
                  {index < steps.length - 1 ? (
                    <span
                      className={cn(
                        "h-px flex-1",
                        step > index + 1 ? "bg-emerald-300" : "bg-slate-200"
                      )}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">
              Adım {step} / 3
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              {steps[step - 1].title}
            </h1>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {steps[step - 1].description}
            </p>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="register-block">Blok</Label>
                    <Input
                      id="register-block"
                      value={block}
                      maxLength={3}
                      onChange={(event) =>
                        setBlock(event.target.value.toLocaleUpperCase("tr-TR"))
                      }
                      placeholder="A"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-no">Daire No</Label>
                    <Input
                      id="register-no"
                      value={no}
                      onChange={(event) => setNo(event.target.value)}
                      placeholder="12"
                    />
                  </div>
                </div>

                {block.trim() && no.trim() ? (
                  <div className="flex items-center justify-between gap-2 rounded-xl bg-blue-50 px-3 py-2.5 ring-1 ring-blue-100">
                    <p className="text-xs font-semibold text-blue-800">
                      {apartmentId} · {block.trim().toLocaleUpperCase("tr-TR")} Blok
                    </p>
                    <Badge
                      className={
                        existingApartment
                          ? "bg-amber-50 text-amber-700 ring-amber-200"
                          : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      }
                    >
                      {existingApartment ? "Kayıtlı daire" : "Yeni daire"}
                    </Badge>
                  </div>
                ) : null}

                <div>
                  <Label htmlFor="register-owner">Daire sahibinin adı soyadı</Label>
                  <Input
                    id="register-owner"
                    value={ownerName}
                    onChange={(event) => setOwnerName(event.target.value)}
                    placeholder="Örn. Ahmet Yılmaz"
                  />
                </div>

                <div>
                  <Label htmlFor="register-resident-count">Dairede yaşayan kişi sayısı</Label>
                  <Input
                    id="register-resident-count"
                    type="number"
                    min={1}
                    value={residentCount}
                    onChange={(event) => setResidentCount(event.target.value)}
                  />
                </div>

                <div>
                  <Label>Oturum tipi</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "owner" as const, label: "Ev sahibi" },
                      { value: "tenant" as const, label: "Kiracı" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setOccupancyType(option.value)}
                        className={cn(
                          "rounded-xl px-3 py-2.5 text-xs font-semibold ring-1 transition",
                          occupancyType === option.value
                            ? "bg-blue-600 text-white ring-blue-600"
                            : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] leading-5 text-slate-500 ring-1 ring-slate-100">
                  Bu bilgiler yönetim panelindeki <strong>Kullanıcı &amp; Daire</strong>{" "}
                  ekranında görünür. Mevcut bir daire seçerseniz hesabınız o daireye bağlanır.
                </p>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <div>
                  <Label htmlFor="register-name">Ad Soyad</Label>
                  <Input
                    id="register-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Örn. Ahmet Yılmaz"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <Label htmlFor="register-phone">Telefon</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+90 5xx xxx xx xx"
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <Label htmlFor="register-email">E-posta</Label>
                  <Input
                    id="register-email"
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="ornek@apartman.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <Label htmlFor="register-plate">Araç plakası (opsiyonel)</Label>
                  <Input
                    id="register-plate"
                    value={vehiclePlate}
                    onChange={(event) =>
                      setVehiclePlate(event.target.value.toLocaleUpperCase("tr-TR"))
                    }
                    placeholder="34 ABC 123"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="register-emergency-name">
                      Acil durum kişisi (opsiyonel)
                    </Label>
                    <Input
                      id="register-emergency-name"
                      value={emergencyContactName}
                      onChange={(event) => setEmergencyContactName(event.target.value)}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-emergency-phone">
                      Acil durum telefonu (opsiyonel)
                    </Label>
                    <Input
                      id="register-emergency-phone"
                      type="tel"
                      inputMode="tel"
                      value={emergencyContactPhone}
                      onChange={(event) => setEmergencyContactPhone(event.target.value)}
                      placeholder="+90 5xx xxx xx xx"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] leading-5 text-slate-500 ring-1 ring-slate-100">
                  İletişim bilgileriniz yönetim tarafından görülebilir ve acil durumlarda
                  kullanılabilir.
                </p>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="register-password">Şifre</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="En az 4 karakter"
                      autoComplete="new-password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-confirm">Şifre tekrar</Label>
                    <Input
                      id="register-confirm"
                      type="password"
                      value={confirm}
                      onChange={(event) => setConfirm(event.target.value)}
                      placeholder="Şifreyi tekrar girin"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="register-note">Yönetime not (opsiyonel)</Label>
                  <Textarea
                    id="register-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Taşınma tarihi, otopark ihtiyacı veya iletmek istediğiniz başka bir bilgi..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Kayıt özeti
                  </p>
                  {[
                    ["Daire", apartmentId],
                    ["Daire sahibi", ownerName],
                    ["Oturum", occupancyType === "owner" ? "Ev sahibi" : "Kiracı"],
                    ["Sakin sayısı", residentCount],
                    ["Ad soyad", name],
                    ["Telefon", phone],
                    ["E-posta", email],
                    ["Araç plakası", vehiclePlate],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-3">
                      <span className="text-[11px] text-slate-500">{label}</span>
                      <span className="text-right text-[11px] font-semibold text-slate-800">
                        {value || "—"}
                      </span>
                    </div>
                  ))}
                </div>

                <label className="flex items-start gap-2 rounded-xl border border-slate-200 p-3 text-[11px] leading-5 text-slate-500">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Bilgilerimin doğru olduğunu, yönetimle paylaşılmasını ve kayıt talebimin
                  yönetim tarafından incelenmesini onaylıyorum.
                </label>
              </>
            ) : null}

            {error ? (
              <p className="rounded-xl bg-red-50 px-3 py-2.5 text-[11px] font-medium text-red-600 ring-1 ring-red-100">
                {error}
              </p>
            ) : null}

            <div className="flex gap-2 pt-1">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setError(null);
                    setStep(step - 1);
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Geri
                </Button>
              ) : (
                <Link href="/login" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Giriş
                  </Button>
                </Link>
              )}
              <Button type="submit" variant="blue" className="flex-1" disabled={submitting}>
                {step === 3 ? (submitting ? "Gönderiliyor..." : "Başvuru Gönder") : "Devam"}
                {step === 3 ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </div>
        )}

        <p className="mt-4 text-center text-[11px] text-slate-500">
          Zaten hesabınız var mı?{" "}
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Giriş yapın
          </Link>
        </p>
      </div>
    </div>
  );
}
