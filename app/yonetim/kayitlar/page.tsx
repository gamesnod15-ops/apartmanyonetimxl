"use client";

import { useState } from "react";
import {
  Check,
  Clock3,
  Mail,
  Phone,
  UserPlus,
  X,
} from "lucide-react";
import { Badge, Button, Modal, Textarea, cn } from "@/app/components/ui";
import { useStore } from "@/app/lib/store";
import type {
  RegistrationRequest,
  RegistrationStatus,
} from "@/app/lib/types";

const statusMeta: Record<
  RegistrationStatus,
  { label: string; badge: string; tone: string }
> = {
  pending: {
    label: "Onay bekliyor",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    tone: "from-amber-500 to-orange-600",
  },
  approved: {
    label: "Onaylandı",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    tone: "from-emerald-500 to-teal-600",
  },
  rejected: {
    label: "Reddedildi",
    badge: "bg-red-50 text-red-700 ring-red-200",
    tone: "from-red-500 to-rose-600",
  },
};

const occupancyLabel = {
  owner: "Ev sahibi",
  tenant: "Kiracı",
};

function formatDateTime(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminRegistrationsPage() {
  const { data, user, approveRegistration, rejectRegistration } = useStore();
  const [tab, setTab] = useState<RegistrationStatus>("pending");
  const [selected, setSelected] = useState<RegistrationRequest | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!user || user.role !== "admin") return null;

  const registrations = data.registrations ?? [];
  const counts = {
    pending: registrations.filter((item) => item.status === "pending").length,
    approved: registrations.filter((item) => item.status === "approved").length,
    rejected: registrations.filter((item) => item.status === "rejected").length,
  };
  const list = registrations
    .filter((item) => item.status === tab)
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

  const openDetail = (request: RegistrationRequest) => {
    setSelected(request);
    setReviewNote(request.reviewNote ?? "");
    setError(null);
  };

  const decide = (action: "approve" | "reject") => {
    if (!selected) return;
    if (action === "reject" && reviewNote.trim().length < 3) {
      setError("Reddetme nedeni en az 3 karakter olmalı.");
      return;
    }
    const result =
      action === "approve"
        ? approveRegistration(selected.id, reviewNote)
        : rejectRegistration(selected.id, reviewNote);
    if (!result.ok) {
      setError(result.error ?? "İşlem tamamlanamadı.");
      return;
    }
    setSelected(null);
    setReviewNote("");
    setError(null);
  };

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 p-6 text-white shadow-xl shadow-red-950/30">
        <div className="relative">
          <p className="flex items-center gap-1.5 text-xs font-medium text-red-300">
            <UserPlus className="h-3.5 w-3.5" />
            Sakin Kayıtları
          </p>
          <h1 className="mt-1 text-xl font-bold">Kayıt Talepleri</h1>
          <p className="mt-1 text-[11px] text-slate-400">
            Başvuruları inceleyin; onaylanan sakinlerin giriş hesabı otomatik oluşturulur.
          </p>
          <div className="mt-4 flex gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-amber-200 ring-1 ring-white/10">
              {counts.pending} onay bekliyor
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-emerald-200 ring-1 ring-white/10">
              {counts.approved} onaylandı
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white p-1.5 ring-1 ring-slate-200">
        {(["pending", "approved", "rejected"] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setTab(status)}
            className={cn(
              "rounded-xl px-2 py-2.5 text-[11px] font-semibold transition",
              tab === status
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50"
            )}
          >
            {statusMeta[status].label}
            <span
              className={cn(
                "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]",
                tab === status ? "bg-white/15" : "bg-slate-100"
              )}
            >
              {counts[status]}
            </span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center ring-1 ring-slate-200">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Clock3 className="h-7 w-7" />
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-700">
            Bu sekmede kayıt talebi yok
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Yeni başvurular geldiğinde burada görünecek.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {list.map((request) => {
            const meta = statusMeta[request.status];
            return (
              <button
                key={request.id}
                type="button"
                onClick={() => openDetail(request)}
                className="w-full rounded-2xl bg-white p-4 text-left ring-1 ring-slate-200 transition hover:ring-slate-300"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-bold text-white",
                      meta.tone
                    )}
                  >
                    {request.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toLocaleUpperCase("tr-TR")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {request.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {request.block}-{request.no} ·{" "}
                          {occupancyLabel[request.occupancyType]}
                        </p>
                      </div>
                      <Badge className={meta.badge}>{meta.label}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {request.email}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {request.phone}
                      </span>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-400">
                      Başvuru: {formatDateTime(request.submittedAt)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Kayıt Başvurusu"
        description="Başvuru bilgilerini inceleyip karar verin."
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-900">{selected.name}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {selected.block}-{selected.no} dairesi ·{" "}
                  {occupancyLabel[selected.occupancyType]}
                </p>
              </div>
              <Badge className={statusMeta[selected.status].badge}>
                {statusMeta[selected.status].label}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                ["Daire", `${selected.block}-${selected.no}`],
                ["Daire sahibi", selected.ownerName],
                ["Sakin sayısı", String(selected.residentCount)],
                ["Oturum", occupancyLabel[selected.occupancyType]],
                ["Telefon", selected.phone],
                ["E-posta", selected.email],
                ["Araç plakası", selected.vehiclePlate ?? "—"],
                ["Acil durum kişisi", selected.emergencyContactName ?? "—"],
                ["Acil durum telefonu", selected.emergencyContactPhone ?? "—"],
                ["Başvuru tarihi", formatDateTime(selected.submittedAt)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100"
                >
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    {label}
                  </p>
                  <p className="mt-0.5 break-words text-[11px] font-semibold text-slate-800">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {selected.note ? (
              <div className="rounded-xl bg-blue-50 px-3 py-2.5 ring-1 ring-blue-100">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-500">
                  Sakin notu
                </p>
                <p className="mt-1 text-[11px] leading-5 text-blue-900">
                  {selected.note}
                </p>
              </div>
            ) : null}

            {selected.status === "pending" ? (
              <>
                <div>
                  <p className="mb-1 text-[11px] font-semibold text-slate-600">
                    Yönetim notu (opsiyonel)
                  </p>
                  <Textarea
                    value={reviewNote}
                    onChange={(event) => setReviewNote(event.target.value)}
                    rows={3}
                    placeholder="Onay veya red gerekçesi..."
                  />
                </div>
                {error ? (
                  <p className="rounded-xl bg-red-50 px-3 py-2 text-[11px] font-medium text-red-600 ring-1 ring-red-100">
                    {error}
                  </p>
                ) : null}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="danger"
                    className="flex-1"
                    onClick={() => decide("reject")}
                  >
                    <X className="h-4 w-4" />
                    Reddet
                  </Button>
                  <Button
                    type="button"
                    variant="blue"
                    className="flex-1"
                    onClick={() => decide("approve")}
                  >
                    <Check className="h-4 w-4" />
                    Onayla
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  İnceleme
                </p>
                <p className="mt-1 text-[11px] text-slate-600">
                  {formatDateTime(selected.reviewedAt)}
                </p>
                {selected.reviewNote ? (
                  <p className="mt-1 text-[11px] leading-5 text-slate-700">
                    {selected.reviewNote}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
