"use client";

import { useState } from "react";
import {
  CalendarDays,
  Check,
  Clock,
  MapPin,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useStore } from "@/app/lib/store";
import { Badge, Card, EmptyState, SectionHeader, cn } from "@/app/components/ui";
import {
  attendanceMeta,
  formatDateTime,
  meetingCounts,
} from "@/app/lib/selectors";
import { useNow } from "@/app/lib/use-now";
import type { AttendanceStatus } from "@/app/lib/types";

const options: Array<{ value: AttendanceStatus; label: string; icon: typeof Check }> = [
  { value: "yes", label: "Katılacağım", icon: Check },
  { value: "no", label: "Katılmayacağım", icon: X },
  { value: "proxy", label: "Vekalet", icon: UserCheck },
];

export default function DaireMeetingsPage() {
  const { data, user, rsvp } = useStore();
  const [onlyUpcoming, setOnlyUpcoming] = useState(true);
  const now = useNow();

  if (!user) return null;

  const sorted = [...data.meetings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const upcoming = sorted.filter((meeting) => new Date(meeting.date).getTime() >= now);
  const past = sorted
    .filter((meeting) => new Date(meeting.date).getTime() < now)
    .reverse();
  const shown = onlyUpcoming ? upcoming : past;

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] bg-gradient-to-br from-sky-600 via-sky-700 to-blue-900 p-6 text-white shadow-xl shadow-sky-600/20">
        <div className="flex items-center gap-2 text-sky-100">
          <CalendarDays className="h-4 w-4" />
          <p className="text-xs font-medium">Toplantı & Katılım</p>
        </div>
        <h1 className="mt-2 text-xl font-bold">Toplantılar</h1>
        <p className="mt-1 text-[11px] text-sky-100">
          {upcoming.length} yaklaşan toplantı · Katılım durumunuzu bildirin.
        </p>
      </section>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setOnlyUpcoming(true)}
          className={cn(
            "flex-1 rounded-lg py-2 text-xs font-semibold transition",
            onlyUpcoming ? "bg-white text-sky-700 shadow-sm" : "text-slate-500"
          )}
        >
          Yaklaşan ({upcoming.length})
        </button>
        <button
          type="button"
          onClick={() => setOnlyUpcoming(false)}
          className={cn(
            "flex-1 rounded-lg py-2 text-xs font-semibold transition",
            !onlyUpcoming ? "bg-white text-sky-700 shadow-sm" : "text-slate-500"
          )}
        >
          Geçmiş ({past.length})
        </button>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-5 w-5" />}
          title={onlyUpcoming ? "Yaklaşan toplantı yok" : "Geçmiş toplantı yok"}
          description="Yeni bir toplantı planlandığında burada görünecek."
        />
      ) : (
        <div className="space-y-4">
          {shown.map((meeting) => {
            const counts = meetingCounts(meeting);
            const mine = meeting.attendance[user.id];
            const isPast = new Date(meeting.date).getTime() < now;
            return (
              <Card key={meeting.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                      <span className="text-[10px] font-semibold uppercase">
                        {new Date(meeting.date).toLocaleDateString("tr-TR", {
                          month: "short",
                        })}
                      </span>
                      <span className="text-sm font-bold leading-none">
                        {new Date(meeting.date).getDate()}
                      </span>
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {meeting.title}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(meeting.date)}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                        <MapPin className="h-3 w-3" />
                        {meeting.location}
                      </p>
                    </div>
                  </div>
                  {isPast ? (
                    <Badge className="bg-slate-100 text-slate-500 ring-slate-200">
                      Geçmiş
                    </Badge>
                  ) : mine ? (
                    <Badge className={attendanceMeta[mine].className}>
                      {attendanceMeta[mine].label}
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-50 text-amber-700 ring-amber-200">
                      Yanıt Bekliyor
                    </Badge>
                  )}
                </div>

                <div className="mt-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <p className="mb-2 text-[11px] font-bold text-slate-700">Gündem</p>
                  <ol className="space-y-1.5">
                    {meeting.agenda.map((item, index) => (
                      <li
                        key={item}
                        className="flex gap-2 text-[11px] leading-5 text-slate-500"
                      >
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white text-[9px] font-bold text-slate-400 ring-1 ring-slate-200">
                          {index + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {counts.yes} katılıyor
                  </span>
                  <span>{counts.proxy} vekalet</span>
                  <span>{counts.no} katılmıyor</span>
                </div>

                {!isPast ? (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {options.map((option) => {
                      const active = mine === option.value;
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => rsvp(meeting.id, option.value)}
                          className={cn(
                            "flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[10px] font-semibold transition",
                            active
                              ? "border-sky-200 bg-sky-50 text-sky-700"
                              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <SectionHeader title="Katılım Özeti" />
                    <p className="text-[11px] text-slate-500">
                      {counts.yes} katılım, {counts.proxy} vekalet, {counts.no} ret
                      bildirildi.
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
