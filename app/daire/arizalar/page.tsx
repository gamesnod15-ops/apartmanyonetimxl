"use client";

import { useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Clock,
  ImageIcon,
  Plus,
  Send,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import { useStore } from "@/app/lib/store";
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Label,
  Modal,
  Segmented,
  Select,
  Textarea,
  cn,
} from "@/app/components/ui";
import {
  CATEGORIES,
  formatDateTime,
  priorityMeta,
  relativeTime,
  remainingRights,
  ticketStatusMeta,
} from "@/app/lib/selectors";
import type { Priority, TicketStatus } from "@/app/lib/types";

type Filter = "all" | TicketStatus;

export default function DaireTicketsPage() {
  const { data, user, createTicket, addTicketMessage } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [priority, setPriority] = useState<Priority>("medium");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const apartment = data.apartments.find((item) => item.id === user.apartmentId);
  const myTickets = data.tickets
    .filter((ticket) => ticket.apartmentId === apartment?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const filtered =
    filter === "all" ? myTickets : myTickets.filter((ticket) => ticket.status === filter);
  const selected = myTickets.find((ticket) => ticket.id === selectedId) ?? null;
  const rights = remainingRights(apartment);

  const resetForm = () => {
    setTitle("");
    setCategory(CATEGORIES[0]);
    setPriority("medium");
    setDescription("");
    setPhoto(undefined);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Lütfen bir görsel dosyası seçin.");
      return;
    }
    if (file.size > 900 * 1024) {
      setError("Fotoğraf boyutu en fazla 900 KB olabilir.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(typeof reader.result === "string" ? reader.result : undefined);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (title.trim().length < 5) {
      setError("Arıza başlığı en az 5 karakter olmalı.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Lütfen arızayı en az 10 karakterle açıklayın.");
      return;
    }
    const result = createTicket({
      title,
      description,
      category,
      priority,
      photo,
    });
    if (!result.ok) {
      setError(result.error ?? "Arıza kaydı oluşturulamadı.");
      return;
    }
    resetForm();
    setCreateOpen(false);
  };

  const sendMessage = () => {
    if (!selected || !message.trim()) return;
    addTicketMessage(selected.id, message);
    setMessage("");
  };

  const filters: Array<{ value: Filter; label: string; count: number }> = [
    { value: "all", label: "Tümü", count: myTickets.length },
    {
      value: "pending",
      label: "Beklemede",
      count: myTickets.filter((ticket) => ticket.status === "pending").length,
    },
    {
      value: "in_progress",
      label: "İşleme Alındı",
      count: myTickets.filter((ticket) => ticket.status === "in_progress").length,
    },
    {
      value: "resolved",
      label: "Çözüldü",
      count: myTickets.filter((ticket) => ticket.status === "resolved").length,
    },
  ];

  const timeline: Array<{ status: TicketStatus; label: string; description: string }> = [
    {
      status: "pending",
      label: "Talep Alındı",
      description: "Kaydınız yönetime iletildi.",
    },
    {
      status: "in_progress",
      label: "İşleme Alındı",
      description: "Teknik ekip arızayla ilgileniyor.",
    },
    {
      status: "resolved",
      label: "Çözüldü",
      description: "Arıza giderildi olarak işaretlendi.",
    },
  ];
  const currentIndex = selected
    ? timeline.findIndex((step) => step.status === selected.status)
    : -1;

  return (
    <div className="space-y-4">
      <section className="flex items-start justify-between gap-3 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white shadow-lg shadow-blue-600/20">
        <div>
          <p className="text-xs font-medium text-blue-100">Teknik Destek</p>
          <h1 className="mt-1 text-xl font-bold">Arıza Kayıtlarım</h1>
          <p className="mt-1 text-[11px] text-blue-100">
            {rights} kullanılabilir ücretsiz hak · {myTickets.length} kayıt
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setCreateOpen(true);
          }}
          className="shrink-0 bg-white text-blue-700 hover:bg-blue-50"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Yeni Kayıt
        </Button>
      </section>

      <Segmented options={filters} value={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Wrench className="h-5 w-5" />}
          title="Bu filtrede arıza kaydı yok"
          description="Yeni bir arıza bildirerek teknik ekibi haberdar edebilirsiniz."
          action={
            <Button variant="blue" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Arıza Bildir
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => setSelectedId(ticket.id)}
              className="w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      priorityMeta[ticket.priority].className
                    )}
                  >
                    <Wrench className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {ticket.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {ticket.location ? `${ticket.location} · ` : ""}
                      {ticket.category} · {relativeTime(ticket.createdAt)}
                    </p>
                  </div>
                </div>
                <Badge className={ticketStatusMeta[ticket.status].className}>
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      ticketStatusMeta[ticket.status].dot
                    )}
                  />
                  {ticketStatusMeta[ticket.status].label}
                </Badge>
              </div>
              <p className="mt-2 line-clamp-2 pl-13 text-[11px] leading-5 text-slate-500">
                {ticket.description}
              </p>
              <div className="mt-2.5 flex items-center gap-3 pl-13 text-[10px] text-slate-400">
                <span>{ticket.messages.length} mesaj</span>
                {ticket.assignedTo ? <span>Atanan: {ticket.assignedTo}</span> : null}
                {ticket.photo ? (
                  <span className="flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" /> Fotoğraf
                  </span>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Yeni Arıza Kaydı"
        description="Arızanızı fotoğrafla birlikte bildirin; teknik ekip en kısa sürede ilgilenecek."
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-xl bg-blue-50 px-3 py-2.5 text-[11px] font-medium text-blue-700 ring-1 ring-blue-100">
            <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
            {rights > 0
              ? `${rights} ücretsiz arıza hakkınız kullanılabilir.`
              : "Ücretsiz hakkınız kalmadı; talep ücretli destek olarak değerlendirilecek."}
          </div>

          <div>
            <Label htmlFor="title">Arıza Başlığı</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Örn. Banyo musluğu su kaçırıyor"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="category">Kategori</Label>
              <Select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Öncelik</Label>
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
                {(["low", "medium", "high"] as Priority[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPriority(item)}
                    className={cn(
                      "rounded-lg py-2 text-[11px] font-semibold transition",
                      priority === item
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500"
                    )}
                  >
                    {priorityMeta[item].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Arızanın ne zaman başladığını ve nerede olduğunu yazın…"
            />
          </div>

          <div>
            <Label hint="Opsiyonel · maks. 900 KB">Fotoğraf</Label>
            {photo ? (
              <div className="relative overflow-hidden rounded-xl ring-1 ring-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt="Arıza fotoğrafı" className="h-40 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(undefined);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="absolute right-2 top-2 rounded-lg bg-slate-900/70 p-1.5 text-white"
                  aria-label="Fotoğrafı kaldır"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-6 text-slate-500 transition hover:border-blue-400 hover:text-blue-600"
              >
                <Camera className="h-5 w-5" />
                <span className="text-[11px] font-medium">Fotoğraf ekle</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPhoto}
              className="hidden"
            />
          </div>

          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600 ring-1 ring-red-100">
              {error}
            </p>
          ) : null}

          <Button type="submit" variant="blue" className="w-full">
            Arıza Kaydını Gönder
          </Button>
        </form>
      </Modal>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.title ?? "Arıza Detayı"}
        description={selected ? `${selected.location ? `${selected.location} · ` : ""}${selected.category} · ${formatDateTime(selected.createdAt)}` : undefined}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className={ticketStatusMeta[selected.status].className}>
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    ticketStatusMeta[selected.status].dot
                  )}
                />
                {ticketStatusMeta[selected.status].label}
              </Badge>
              <Badge className={priorityMeta[selected.priority].className}>
                {priorityMeta[selected.priority].label} öncelik
              </Badge>
              {selected.assignedTo ? (
                <Badge className="bg-slate-100 text-slate-600 ring-slate-200">
                  Atanan: {selected.assignedTo}
                </Badge>
              ) : null}
            </div>

            <p className="rounded-xl bg-slate-50 px-3.5 py-3 text-xs leading-6 text-slate-600 ring-1 ring-slate-100">
              {selected.description}
            </p>

            {selected.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.photo}
                alt="Arıza fotoğrafı"
                className="max-h-56 w-full rounded-xl object-cover ring-1 ring-slate-200"
              />
            ) : null}

            <div className="space-y-3 rounded-xl border border-slate-100 p-3.5">
              {timeline.map((step, index) => {
                const done = index <= currentIndex;
                return (
                  <div key={step.status} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full ring-2",
                          done
                            ? "bg-blue-600 text-white ring-blue-100"
                            : "bg-white text-slate-300 ring-slate-100"
                        )}
                      >
                        {done ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                      </span>
                      {index < timeline.length - 1 ? (
                        <span
                          className={cn(
                            "mt-1 h-6 w-0.5 rounded-full",
                            index < currentIndex ? "bg-blue-200" : "bg-slate-100"
                          )}
                        />
                      ) : null}
                    </div>
                    <div className="pb-1">
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          done ? "text-slate-800" : "text-slate-400"
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="text-[10px] text-slate-400">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <p className="mb-2 text-xs font-bold text-slate-700">Mesajlar</p>
              <div className="space-y-2">
                {selected.messages.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 px-3 py-3 text-center text-[11px] text-slate-400">
                    Henüz mesaj yok. Teknik ekibe not bırakabilirsiniz.
                  </p>
                ) : (
                  selected.messages.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-xl px-3 py-2.5 text-[11px] leading-5",
                        item.authorId === user.id
                          ? "bg-blue-50 text-blue-800 ring-1 ring-blue-100"
                          : "bg-slate-50 text-slate-700 ring-1 ring-slate-100"
                      )}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-semibold">{item.authorName}</span>
                        <span className="text-[9px] text-slate-400">
                          {relativeTime(item.at)}
                        </span>
                      </div>
                      {item.text}
                    </div>
                  ))
                )}
              </div>
              <div className="mt-2 flex gap-2">
                <Input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Mesaj yazın…"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button variant="blue" size="icon" onClick={sendMessage} aria-label="Gönder">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
