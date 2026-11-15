"use client";

import { useState } from "react";
import { CalendarDays, MapPin, Plus, Users, Vote, X } from "lucide-react";
import { useStore } from "@/app/lib/store";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Label,
  Modal,
  cn,
} from "@/app/components/ui";
import {
  attendanceMeta,
  formatDateTime,
  meetingCounts,
  relativeTime,
} from "@/app/lib/selectors";
import { useNow } from "@/app/lib/use-now";
import type { AttendanceStatus } from "@/app/lib/types";

export default function AdminMeetingsPage() {
  const { data, createMeeting } = useStore();
  const now = useNow();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => {
    const value = new Date();
    value.setDate(value.getDate() + 1);
    value.setHours(19, 0, 0, 0);
    return value.toISOString().slice(0, 16);
  });
  const [location, setLocation] = useState("Apartman Toplantı Salonu");
  const [agenda, setAgenda] = useState([""]);
  const [error, setError] = useState<string | null>(null);

  const meetings = [...data.meetings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const reset = () => {
    setTitle("");
    const value = new Date();
    value.setDate(value.getDate() + 1);
    value.setHours(19, 0, 0, 0);
    setDate(value.toISOString().slice(0, 16));
    setLocation("Apartman Toplantı Salonu");
    setAgenda([""]);
    setError(null);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (title.trim().length < 5) {
      setError("Toplantı başlığı en az 5 karakter olmalı.");
      return;
    }
    if (!date) {
      setError("Toplantı tarihi zorunlu.");
      return;
    }
    const cleanAgenda = agenda.map((item) => item.trim()).filter(Boolean);
    if (cleanAgenda.length === 0) {
      setError("En az bir gündem maddesi girin.");
      return;
    }
    createMeeting({
      title,
      date: new Date(date).toISOString(),
      location,
      agenda: cleanAgenda,
    });
    reset();
    setOpen(false);
  };

  const statusOrder: AttendanceStatus[] = ["yes", "proxy", "no"];

  return (
    <div className="space-y-4">
      <section className="flex items-start justify-between gap-3 hero-soft hero-red p-6">
        <div>
          <p className="text-xs font-medium text-red-300">Yönetim</p>
          <h1 className="mt-1 text-xl font-bold">Toplantı Yönetimi</h1>
          <p className="mt-1 text-[11px] text-slate-400">
            {meetings.length} toplantı planlandı
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
          Yeni Toplantı
        </Button>
      </section>

      {meetings.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-5 w-5" />}
          title="Toplantı yok"
          description="İlk toplantıyı planlayarak sakinleri davet edin."
        />
      ) : (
        <div className="space-y-3">
          {meetings.map((meeting) => {
            const counts = meetingCounts(meeting);
            const isPast = new Date(meeting.date).getTime() < now;
            const attendees = Object.entries(meeting.attendance)
              .map(([userId, status]) => ({
                status,
                user: data.users.find((item) => item.id === userId),
              }))
              .filter((entry) => entry.user);
            return (
              <Card key={meeting.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{meeting.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDateTime(meeting.date)} · {relativeTime(meeting.date)}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {meeting.location}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "shrink-0",
                      isPast
                        ? "bg-slate-100 text-slate-500 ring-slate-200"
                        : "bg-sky-50 text-sky-700 ring-sky-200"
                    )}
                  >
                    {isPast ? "Geçmiş" : "Yaklaşan"}
                  </Badge>
                </div>

                <div className="mt-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Gündem
                  </p>
                  <ol className="space-y-1 text-[11px] text-slate-600">
                    {meeting.agenda.map((item, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="font-bold text-slate-400">{index + 1}.</span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {statusOrder.map((status) => (
                    <div
                      key={status}
                      className="rounded-xl bg-white px-2 py-2 ring-1 ring-slate-100"
                    >
                      <p className="text-sm font-bold text-slate-800">{counts[status]}</p>
                      <p className="text-[9px] text-slate-400">
                        {attendanceMeta[status].label}
                      </p>
                    </div>
                  ))}
                </div>

                {attendees.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {attendees.map((entry) => (
                      <span
                        key={entry.user!.id}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[9px] font-medium ring-1",
                          attendanceMeta[entry.status].className
                        )}
                      >
                        {entry.user!.name.split(" ")[0]} ·{" "}
                        {entry.status === "yes"
                          ? "Katılıyor"
                          : entry.status === "proxy"
                            ? "Vekalet"
                            : "Katılmıyor"}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-center text-[10px] text-slate-400">
                    Henüz katılım bildirimi yok.
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Yeni Toplantı"
        description="Toplantı tüm sakinlere davet olarak gönderilir."
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Örn. Olağan kat malikleri toplantısı"
            />
          </div>
          <div>
            <Label htmlFor="date">Tarih & Saat</Label>
            <Input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="location">Yer</Label>
            <Input
              id="location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Gündem Maddeleri</Label>
            {agenda.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(event) =>
                    setAgenda((prev) =>
                      prev.map((entry, entryIndex) =>
                        entryIndex === index ? event.target.value : entry
                      )
                    )
                  }
                  placeholder={`${index + 1}. madde`}
                />
                {agenda.length > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Maddeyi kaldır"
                    onClick={() =>
                      setAgenda((prev) => prev.filter((_, entryIndex) => entryIndex !== index))
                    }
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                ) : null}
              </div>
            ))}
            <Button
              type="button"
              variant="soft"
              size="sm"
              onClick={() => setAgenda((prev) => [...prev, ""])}
            >
              <Plus className="h-3.5 w-3.5" />
              Madde Ekle
            </Button>
          </div>
          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600 ring-1 ring-red-100">
              {error}
            </p>
          ) : null}
          <Button type="submit" variant="red" className="w-full">
            <Vote className="h-4 w-4" />
            Toplantı Oluştur
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <Users className="h-3 w-3" />
            Katılım bildirimleri toplantı kartında görünür.
          </p>
        </form>
      </Modal>
    </div>
  );
}
