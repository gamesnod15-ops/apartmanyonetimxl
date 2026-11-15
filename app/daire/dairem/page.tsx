"use client";

import Link from "next/link";
import { Building2, House, Layers, Plus, ShieldCheck, Users } from "lucide-react";
import { useStore } from "@/app/lib/store";
import { Badge, Card, SectionHeader, cn } from "@/app/components/ui";
import { remainingRights } from "@/app/lib/selectors";
import { ROOMS, floorOf } from "@/app/lib/unit-options";

export default function DairemPage() {
  const { data, user } = useStore();
  if (!user) return null;

  const apartment = data.apartments.find((item) => item.id === user.apartmentId);
  const openTickets = data.tickets.filter(
    (ticket) => ticket.apartmentId === apartment?.id && ticket.status !== "resolved"
  );
  const rights = remainingRights(apartment);

  const facts = [
    { label: "Blok", value: apartment ? `${apartment.block} Blok` : "-", icon: Building2 },
    { label: "Kat", value: apartment ? `${floorOf(apartment.no)}. kat` : "-", icon: Layers },
    { label: "Daire No", value: apartment?.no ?? "-", icon: House },
    { label: "Kişi", value: String(apartment?.residentCount ?? "-"), icon: Users },
  ];

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-cyan-600 via-sky-700 to-blue-900 p-6 text-white shadow-xl shadow-sky-700/20">
        <div className="hero-texture pointer-events-none absolute inset-0" />
        <div className="relative">
          <p className="text-xs font-medium text-sky-100">Daire Bilgileri</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight">Daire {apartment?.id}</h1>
          <p className="mt-1 text-[11px] text-sky-100">
            Malik: {apartment?.ownerName ?? "-"}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-2xl bg-white/10 px-3 py-2.5 ring-1 ring-white/15 backdrop-blur"
              >
                <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-sky-100">
                  <fact.icon className="h-3 w-3" />
                  {fact.label}
                </p>
                <p className="mt-0.5 text-sm font-bold">{fact.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Daire Yerleşimi"
          subtitle="Bir bölüme dokunun, o bölüm için arıza bildirin"
          action={
            <Badge
              className={
                rights > 0
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-red-50 text-red-700 ring-red-200"
              }
            >
              <ShieldCheck className="h-3 w-3" />
              {rights} arıza hakkı
            </Badge>
          }
        />
        <Card className="p-4">
          <div className="grid auto-rows-[84px] grid-cols-4 gap-2 sm:auto-rows-[96px] sm:gap-3">
            {ROOMS.map((room) => {
              const openCount = openTickets.filter(
                (ticket) => ticket.location === room.label
              ).length;
              return (
                <Link
                  key={room.key}
                  href={`/daire/arizalar/yeni?oda=${room.key}`}
                  className={cn(
                    "group relative flex flex-col items-start justify-between rounded-2xl p-3 text-left ring-1 transition active:scale-[0.98]",
                    room.span,
                    openCount > 0
                      ? "bg-red-50 ring-red-200 hover:bg-red-100"
                      : "bg-slate-50 ring-slate-200 hover:bg-white hover:shadow-soft hover:ring-blue-300"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl",
                      openCount > 0
                        ? "bg-red-100 text-red-600"
                        : "bg-white text-blue-600 ring-1 ring-slate-200"
                    )}
                  >
                    <room.icon className="h-4 w-4" />
                  </span>
                  <span className="flex w-full items-end justify-between gap-1">
                    <span
                      className={cn(
                        "text-xs font-semibold leading-tight",
                        openCount > 0 ? "text-red-700" : "text-slate-700"
                      )}
                    >
                      {room.label}
                    </span>
                    {openCount > 0 ? (
                      <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {openCount}
                      </span>
                    ) : (
                      <Plus className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-blue-500" />
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
          <p className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            Kırmızı bölümlerde açık arıza kaydı var.
          </p>
        </Card>
      </section>
    </div>
  );
}
