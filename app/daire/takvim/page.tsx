"use client";

import { BarChart3, CalendarClock, Users, Wallet } from "lucide-react";
import { Badge } from "@/app/components/ui";
import { CalendarView } from "@/app/components/calendar";
import { buildCalendarEvents } from "@/app/lib/calendar";
import { useStore } from "@/app/lib/store";

export default function DaireCalendarPage() {
  const { data, user } = useStore();
  if (!user) return null;

  const events = buildCalendarEvents(data, user);
  const reference = new Date();
  const upcoming = events.filter(
    (event) => new Date(event.start).getTime() >= reference.getTime()
  ).length;
  const monthPayments = events.filter((event) => {
    const date = new Date(event.start);
    return (
      event.kind === "payment" &&
      date.getMonth() === reference.getMonth() &&
      date.getFullYear() === reference.getFullYear()
    );
  }).length;

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-gradient-to-br from-sky-600 via-blue-700 to-blue-900 p-6 text-white shadow-lg shadow-blue-600/20">
        <div className="flex items-center gap-2 text-sky-100">
          <CalendarClock className="h-4 w-4" />
          <p className="text-xs font-medium">Daire Takvimi</p>
        </div>
        <h1 className="mt-2 text-xl font-bold">Takvim</h1>
        <p className="mt-1 text-[11px] text-sky-100">
          {upcoming} yaklaşan etkinlik · Aidat, toplantı, anket ve bina işleri tek
          yerde.
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold ring-1 ring-inset ring-white/20">
            <Users className="h-3 w-3" /> Toplantı
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold ring-1 ring-inset ring-white/20">
            <Wallet className="h-3 w-3" /> Aidat
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold ring-1 ring-inset ring-white/20">
            <BarChart3 className="h-3 w-3" /> Anket
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold ring-1 ring-inset ring-white/20">
            <CalendarClock className="h-3 w-3" /> Bina etkinliği
          </span>
        </div>
      </section>

      {monthPayments > 0 ? (
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/70">
          <p className="text-[11px] font-medium text-slate-500">
            Bu ay takviminde <span className="font-bold text-slate-800">{monthPayments}</span>{" "}
            aidat tarihi var.
          </p>
          <Badge className="bg-amber-50 text-amber-700 ring-amber-200">Aidat</Badge>
        </div>
      ) : null}

      <CalendarView events={events} />
    </div>
  );
}
