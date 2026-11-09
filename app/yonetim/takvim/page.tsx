"use client";

import { useState, type FormEvent } from "react";
import { CalendarClock, Plus } from "lucide-react";
import {
  Button,
  Input,
  Label,
  Modal,
  Select,
  Textarea,
} from "@/app/components/ui";
import { CalendarView } from "@/app/components/calendar";
import { buildCalendarEvents, toDateKey } from "@/app/lib/calendar";
import { useStore } from "@/app/lib/store";
import type { BuildingEventType } from "@/app/lib/types";

const EVENT_TYPES: Array<{ value: BuildingEventType; label: string }> = [
  { value: "maintenance", label: "Bakım / Onarım" },
  { value: "cleaning", label: "Temizlik" },
  { value: "inspection", label: "Denetim / Tatbikat" },
  { value: "social", label: "Sosyal Etkinlik" },
  { value: "other", label: "Diğer" },
];

function defaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toDateKey(date);
}

export default function AdminCalendarPage() {
  const { data, user, addCalendarEvent, removeCalendarEvent } = useStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("10:00");
  const [endTime, setEndTime] = useState("");
  const [type, setType] = useState<BuildingEventType>("maintenance");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const events = buildCalendarEvents(data, user);
  const today = new Date();
  const upcoming = events.filter(
    (event) => new Date(event.start).getTime() >= today.getTime()
  ).length;

  const reset = () => {
    setTitle("");
    setDate(defaultDate());
    setTime("10:00");
    setEndTime("");
    setType("maintenance");
    setLocation("");
    setDescription("");
    setError(null);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!date || !time) {
      setError("Tarih ve saat zorunlu.");
      return;
    }
    const start = new Date(`${date}T${time}:00`);
    if (Number.isNaN(start.getTime())) {
      setError("Geçerli bir tarih ve saat girin.");
      return;
    }
    let end: string | undefined;
    if (endTime) {
      const endDate = new Date(`${date}T${endTime}:00`);
      if (endDate.getTime() <= start.getTime()) {
        setError("Bitiş saati başlangıçtan sonra olmalı.");
        return;
      }
      end = endDate.toISOString();
    }
    const result = addCalendarEvent({
      title,
      start: start.toISOString(),
      end,
      type,
      location,
      description,
    });
    if (!result.ok) {
      setError(result.error ?? "Etkinlik eklenemedi.");
      return;
    }
    reset();
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <section className="flex items-start justify-between gap-3 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 p-6 text-white shadow-lg shadow-red-950/30">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium text-red-300">
            <CalendarClock className="h-3.5 w-3.5" />
            Yönetim Takvimi
          </p>
          <h1 className="mt-1 text-xl font-bold">Takvim</h1>
          <p className="mt-1 text-[11px] text-slate-400">
            {upcoming} yaklaşan etkinlik · Toplantı, aidat, anket ve planlı işler
          </p>
        </div>
        <Button
          onClick={() => {
            reset();
            setOpen(true);
          }}
          variant="red"
          size="sm"
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
          Etkinlik Ekle
        </Button>
      </section>

      <CalendarView events={events} onDelete={removeCalendarEvent} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Yeni Takvim Etkinliği"
        description="Bakım, temizlik, denetim veya sosyal etkinlik planlayın; tüm sakinlere duyurulur."
      >
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label htmlFor="event-title">Başlık</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Örn. Asansör bakımı"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="event-date">Tarih</Label>
              <Input
                id="event-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="event-type">Tür</Label>
              <Select
                id="event-type"
                value={type}
                onChange={(event) => setType(event.target.value as BuildingEventType)}
                className="mt-1"
              >
                {EVENT_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="event-start">Başlangıç</Label>
              <Input
                id="event-start"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="event-end">Bitiş (opsiyonel)</Label>
              <Input
                id="event-end"
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="event-location">Konum</Label>
            <Input
              id="event-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Örn. A Blok otopark"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="event-description">Açıklama</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Sakinlerin bilmesi gereken detaylar..."
              className="mt-1"
            />
          </div>

          {error ? (
            <p className="text-[11px] font-medium text-red-600">{error}</p>
          ) : null}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Vazgeç
            </Button>
            <Button type="submit" variant="red" className="flex-1">
              <Plus className="h-4 w-4" />
              Takvime Ekle
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
