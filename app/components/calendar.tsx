"use client";

import { useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Badge, Button, Card, Modal, cn } from "@/app/components/ui";
import {
  eventsOnDay,
  toDateKey,
  type CalendarEventItem,
} from "@/app/lib/calendar";
import type { BuildingEventType } from "@/app/lib/types";

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

const BUILDING_TYPE_LABEL: Record<BuildingEventType, string> = {
  maintenance: "Bakım",
  cleaning: "Temizlik",
  inspection: "Denetim",
  social: "Etkinlik",
  other: "Diğer",
};

const BUILDING_ICON: Record<BuildingEventType, LucideIcon> = {
  maintenance: Wrench,
  cleaning: Sparkles,
  inspection: ShieldCheck,
  social: PartyPopper,
  other: CalendarDays,
};

function metaFor(event: CalendarEventItem) {
  if (event.kind === "meeting") {
    return {
      label: "Toplantı",
      icon: Users,
      chip: "bg-violet-100 text-violet-700",
      dot: "bg-violet-500",
    };
  }
  if (event.kind === "payment") {
    return event.tone === "paid"
      ? {
          label: "Aidat · Ödendi",
          icon: Wallet,
          chip: "bg-emerald-100 text-emerald-700",
          dot: "bg-emerald-500",
        }
      : {
          label: "Aidat",
          icon: Wallet,
          chip: "bg-amber-100 text-amber-700",
          dot: "bg-amber-500",
        };
  }
  if (event.kind === "poll") {
    return {
      label: "Anket",
      icon: BarChart3,
      chip: "bg-sky-100 text-sky-700",
      dot: "bg-sky-500",
    };
  }
  const buildingType = event.buildingType ?? "other";
  return {
    label: BUILDING_TYPE_LABEL[buildingType],
    icon: BUILDING_ICON[buildingType],
    chip: "bg-indigo-100 text-indigo-700",
    dot: "bg-indigo-500",
  };
}

function formatTime(event: CalendarEventItem) {
  if (event.kind === "payment") return "Son ödeme günü";
  const start = new Date(event.start).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (!event.end) return start;
  const end = new Date(event.end).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${start} – ${end}`;
}

export function CalendarView({
  events,
  onDelete,
}: {
  events: CalendarEventItem[];
  onDelete?: (eventId: string) => void;
}) {
  const [cursor, setCursor] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selected, setSelected] = useState(() => new Date());
  const [open, setOpen] = useState(false);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const leading = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayKey = toDateKey(new Date());
  const selectedKey = toDateKey(selected);
  const selectedEvents = eventsOnDay(events, selected);

  const moveMonth = (delta: number) => {
    const next = new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1);
    setCursor(next);
    setSelected(next);
    setOpen(false);
  };

  const goToday = () => {
    const today = new Date();
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelected(today);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[16px] font-bold capitalize tracking-tight text-slate-900">
              {cursor.toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}
            </p>
            <p className="mt-0.5 text-[13.5px] text-slate-500">
              {events.filter((event) => {
                const date = new Date(event.start);
                return date.getFullYear() === year && date.getMonth() === month;
              }).length}{" "}
              etkinlik
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goToday}
              className="rounded-lg px-2.5 py-1.5 text-[13.5px] font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              Bugün
            </button>
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              aria-label="Önceki ay"
              className="rounded-lg p-2 text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              aria-label="Sonraki ay"
              className="rounded-lg p-2 text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-1 text-center text-[12.5px] font-semibold uppercase tracking-wide text-slate-400"
            >
              {day}
            </div>
          ))}
          {cells.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} className="rounded-lg" />;
            const key = toDateKey(day);
            const dayEvents = eventsOnDay(events, day);
            const isToday = key === todayKey;
            const isSelected = key === selectedKey;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelected(day);
                  setOpen(true);
                }}
                className={cn(
                  "min-h-16 rounded-lg p-1 text-left align-top ring-1 transition sm:min-h-20 sm:p-1.5",
                  isSelected
                    ? "bg-blue-50 ring-blue-400"
                    : "bg-white ring-slate-200 hover:bg-slate-50"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-5 w-5 items-center justify-center rounded-full text-[12.5px] font-semibold sm:h-6 sm:w-6 sm:text-[13.5px]",
                    isToday
                      ? "bg-blue-600 text-white"
                      : isSelected
                        ? "bg-blue-100 text-blue-700"
                        : "text-slate-600"
                  )}
                >
                  {day.getDate()}
                </span>
                <span className="mt-0.5 flex gap-0.5 sm:hidden">
                  {dayEvents.slice(0, 4).map((event) => (
                    <span
                      key={event.id}
                      className={cn("h-1 w-1 rounded-full", metaFor(event).dot)}
                    />
                  ))}
                </span>
                <span className="mt-1 hidden flex-col gap-0.5 sm:flex">
                  {dayEvents.slice(0, 2).map((event) => (
                    <span
                      key={event.id}
                      className={cn(
                        "truncate rounded px-1 py-0.5 text-[12.5px] font-medium",
                        metaFor(event).chip
                      )}
                    >
                      {event.title}
                    </span>
                  ))}
                  {dayEvents.length > 2 ? (
                    <span className="px-1 text-[12.5px] font-medium text-slate-400">
                      +{dayEvents.length - 2} daha
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={selected.toLocaleDateString("tr-TR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        description={`${selectedEvents.length} etkinlik · ${
          selectedKey === todayKey ? "Bugün" : "Gün ajandası"
        }`}
        footer={
          <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
            Kapat
          </Button>
        }
      >
        <div className="space-y-2">
          {selectedEvents.map((event) => {
            const meta = metaFor(event);
            return (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    meta.chip
                  )}
                >
                  <meta.icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[14px] font-semibold text-slate-800">{event.title}</p>
                    <Badge className={cn("shrink-0", meta.chip)}>{meta.label}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3 w-3" />
                      {formatTime(event)}
                    </span>
                    {event.location ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    ) : null}
                  </div>
                  {event.detail ? (
                    <p className="mt-1 text-[13.5px] leading-4 text-slate-500">
                      {event.detail}
                    </p>
                  ) : null}
                </div>
                {onDelete && event.kind === "building" ? (
                  <button
                    type="button"
                    onClick={() => onDelete(event.refId ?? event.id)}
                    aria-label="Etkinliği sil"
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            );
          })}
          {selectedEvents.length === 0 ? (
            <p className="py-6 text-center text-[14px] text-slate-400">
              Bu gün için etkinlik yok.
            </p>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
