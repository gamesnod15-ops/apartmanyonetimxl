"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  ImageIcon,
  MapPin,
  Search,
  Send,
  UserCheck,
  Wrench,
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
  cn,
} from "@/app/components/ui";
import {
  formatDateTime,
  priorityMeta,
  relativeTime,
  ticketStatusMeta,
} from "@/app/lib/selectors";
import type { TicketStatus } from "@/app/lib/types";

type Filter = "all" | TicketStatus;

export default function AdminTicketsPage() {
  const { data, updateTicketStatus, addTicketMessage } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const tickets = [...data.tickets].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const filtered = tickets.filter((ticket) => {
    const statusMatch = filter === "all" || ticket.status === filter;
    const search = query.trim().toLocaleLowerCase("tr-TR");
    const queryMatch =
      !search ||
      ticket.title.toLocaleLowerCase("tr-TR").includes(search) ||
      ticket.apartmentId.toLocaleLowerCase("tr-TR").includes(search) ||
      ticket.category.toLocaleLowerCase("tr-TR").includes(search);
    return statusMatch && queryMatch;
  });

  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null;
  const assignees = [
    ...data.users.filter((entry) => entry.role === "admin").map((entry) => entry.name),
    "Dış Servis Ekibi",
  ];

  const filters: Array<{ value: Filter; label: string; count: number }> = [
    { value: "all", label: "Tümü", count: tickets.length },
    {
      value: "pending",
      label: "Beklemede",
      count: tickets.filter((ticket) => ticket.status === "pending").length,
    },
    {
      value: "in_progress",
      label: "İşleme Alındı",
      count: tickets.filter((ticket) => ticket.status === "in_progress").length,
    },
    {
      value: "resolved",
      label: "Çözüldü",
      count: tickets.filter((ticket) => ticket.status === "resolved").length,
    },
  ];

  const resolutionTime = (createdAt: string, updatedAt: string) => {
    const diff = new Date(updatedAt).getTime() - new Date(createdAt).getTime();
    const hours = Math.round(diff / 3600000);
    if (hours < 24) return `${hours} saat`;
    return `${Math.round(hours / 24)} gün`;
  };

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 p-6 text-white shadow-xl shadow-red-950/30">
        <p className="text-xs font-medium text-red-300">Ticket Yönetimi</p>
        <h1 className="mt-1 text-xl font-bold">Arıza & Talep Yönetimi</h1>
        <p className="mt-1 text-[11px] text-slate-400">
          Tüm dairelerden gelen talepleri tek ekrandan yönetin.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            {data.tickets.filter((ticket) => ticket.status === "pending").length} beklemede
          </span>
          <span className="flex items-center gap-1.5">
            <Wrench className="h-3.5 w-3.5 text-blue-400" />
            {data.tickets.filter((ticket) => ticket.status === "in_progress").length} işlemde
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            {data.tickets.filter((ticket) => ticket.status === "resolved").length} çözüldü
          </span>
        </div>
      </section>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Daire, başlık veya kategori ara…"
          className="pl-9"
        />
      </div>

      <Segmented options={filters} value={filter} onChange={setFilter} tone="red" />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Wrench className="h-5 w-5" />}
          title="Kayıt bulunamadı"
          description="Arama veya filtre kriterlerine uygun arıza kaydı yok."
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
                      ticket.priority === "high"
                        ? "bg-red-50 text-red-600"
                        : ticket.priority === "medium"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-slate-100 text-slate-500"
                    )}
                  >
                    <Wrench className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {ticket.title}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <MapPin className="h-3 w-3" />
                        {ticket.apartmentId}
                      </span>
                      · {ticket.location ? `${ticket.location} · ` : ""}
                      {ticket.category} · {relativeTime(ticket.createdAt)}
                    </p>
                    {ticket.assignedTo ? (
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                        <UserCheck className="h-3 w-3" />
                        {ticket.assignedTo}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Badge className={ticketStatusMeta[ticket.status].className}>
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        ticketStatusMeta[ticket.status].dot
                      )}
                    />
                    {ticketStatusMeta[ticket.status].label}
                  </Badge>
                  <Badge className={priorityMeta[ticket.priority].className}>
                    {priorityMeta[ticket.priority].label}
                  </Badge>
                  {ticket.photo ? (
                    <span className="flex items-center gap-1 text-[9px] text-slate-400">
                      <ImageIcon className="h-3 w-3" /> Fotoğraf
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => {
          setSelectedId(null);
          setMessage("");
        }}
        title={selected?.title ?? "Arıza Detayı"}
        description={
          selected
            ? `${selected.apartmentId} · ${selected.location ? `${selected.location} · ` : ""}${selected.category} · ${formatDateTime(selected.createdAt)}`
            : undefined
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className={ticketStatusMeta[selected.status].className}>
                {ticketStatusMeta[selected.status].label}
              </Badge>
              <Badge className={priorityMeta[selected.priority].className}>
                {priorityMeta[selected.priority].label} öncelik
              </Badge>
              {selected.status === "resolved" ? (
                <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">
                  Çözüm süresi: {resolutionTime(selected.createdAt, selected.updatedAt)}
                </Badge>
              ) : (
                <Badge className="bg-slate-100 text-slate-600 ring-slate-200">
                  Açık: {relativeTime(selected.createdAt)}
                </Badge>
              )}
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="assignee">Teknik Ekibe Ata</Label>
                <Select
                  id="assignee"
                  value={selected.assignedTo ?? ""}
                  onChange={(event) =>
                    updateTicketStatus(
                      selected.id,
                      selected.status === "pending" ? "in_progress" : selected.status,
                      event.target.value
                    )
                  }
                >
                  <option value="">Atanmadı</option>
                  {assignees.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Durum Güncelle</Label>
                <Select
                  value={selected.status}
                  onChange={(event) =>
                    updateTicketStatus(
                      selected.id,
                      event.target.value as TicketStatus,
                      selected.assignedTo
                    )
                  }
                >
                  <option value="pending">Beklemede</option>
                  <option value="in_progress">İşleme Alındı</option>
                  <option value="resolved">Çözüldü</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(["pending", "in_progress", "resolved"] as TicketStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    updateTicketStatus(selected.id, status, selected.assignedTo)
                  }
                  className={cn(
                    "rounded-xl border px-2 py-2.5 text-[10px] font-semibold transition",
                    selected.status === status
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  )}
                >
                  {ticketStatusMeta[status].label}
                </button>
              ))}
            </div>

            <div>
              <p className="mb-2 text-xs font-bold text-slate-700">Mesajlar</p>
              <div className="space-y-2">
                {selected.messages.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 px-3 py-3 text-center text-[11px] text-slate-400">
                    Henüz mesaj yok.
                  </p>
                ) : (
                  selected.messages.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] leading-5 text-slate-700 ring-1 ring-slate-100"
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
                  placeholder="Daire sakine mesaj yazın…"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      if (message.trim()) {
                        addTicketMessage(selected.id, message);
                        setMessage("");
                      }
                    }
                  }}
                />
                <Button
                  variant="red"
                  size="icon"
                  aria-label="Gönder"
                  onClick={() => {
                    if (!message.trim()) return;
                    addTicketMessage(selected.id, message);
                    setMessage("");
                  }}
                >
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
