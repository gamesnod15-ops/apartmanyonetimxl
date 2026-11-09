"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  Megaphone,
  Package,
  Plus,
  Wallet,
  Wrench,
} from "lucide-react";
import { useStore } from "@/app/lib/store";
import {
  Badge,
  Button,
  Card,
  Modal,
  Progress,
  SectionHeader,
  Textarea,
  cn,
} from "@/app/components/ui";
import {
  announcementCategoryMeta,
  currency,
  formatDate,
  formatDateTime,
  pollPercent,
  pollTotal,
  priorityMeta,
  relativeTime,
  remainingRights,
  ticketStatusMeta,
  visibleNotifications,
} from "@/app/lib/selectors";
import { useNow } from "@/app/lib/use-now";
import { ROOMS, SERVICES } from "@/app/lib/unit-options";

export default function DaireDashboard() {
  const { data, user, createTicket } = useStore();
  const now = useNow();
  const [roomKey, setRoomKey] = useState<string | null>(null);
  const [serviceKey, setServiceKey] = useState<string | null>(null);
  const [priority, setPriority] = useState<"medium" | "high">("medium");
  const [note, setNote] = useState("");
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<string | null>(null);
  if (!user) return null;

  const apartment = data.apartments.find((item) => item.id === user.apartmentId);
  const myTickets = data.tickets
    .filter((ticket) => ticket.apartmentId === apartment?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const openTickets = myTickets.filter((ticket) => ticket.status !== "resolved");
  const myPayments = data.payments
    .filter((payment) => payment.apartmentId === apartment?.id)
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  const unpaid = myPayments.filter((payment) => payment.status !== "paid");
  const nextPayment = unpaid[0];
  const myPackages = data.packages.filter(
    (item) => item.apartmentId === apartment?.id
  );
  const waitingPackages = myPackages.filter((item) => item.status === "security");
  const notifications = visibleNotifications(data, user);
  const unread = notifications.filter((item) => !item.read).length;
  const rights = remainingRights(apartment);
  const nextMeeting = [...data.meetings]
    .filter((meeting) => new Date(meeting.date).getTime() > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  const activePoll = data.polls.find(
    (poll) => new Date(poll.endsAt).getTime() > now
  );
  const latestAnnouncements = [...data.announcements]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2);

  const activeRoom = ROOMS.find((item) => item.key === roomKey) ?? null;
  const activeService = SERVICES.find((item) => item.key === serviceKey) ?? null;
  const roomOpenIssues = activeRoom
    ? openTickets.filter((ticket) => ticket.location === activeRoom.label)
    : [];

  const openRoom = (key: string) => {
    setRoomKey(key);
    setServiceKey(null);
    setPriority("medium");
    setNote("");
    setTicketError(null);
    setCreatedTicket(null);
  };

  const closeRoom = () => {
    setRoomKey(null);
    setServiceKey(null);
    setPriority("medium");
    setNote("");
    setTicketError(null);
    setCreatedTicket(null);
  };

  const submitTicket = () => {
    if (!apartment || !activeRoom || !activeService) return;
    const result = createTicket({
      apartmentId: apartment.id,
      title: `${activeService.label} arızası · ${activeRoom.label}`,
      description:
        note.trim() ||
        `${apartment.id} dairesinde ${activeRoom.label.toLocaleLowerCase(
          "tr-TR"
        )} bölümünde ${activeService.label.toLocaleLowerCase("tr-TR")} sorunu bildirildi.`,
      category: activeService.category,
      location: activeRoom.label,
      priority,
    });
    if (!result.ok) {
      setTicketError(result.error ?? "Arıza kaydı oluşturulamadı.");
      return;
    }
    setTicketError(null);
    setNote("");
    setCreatedTicket(`${activeService.label} · ${activeRoom.label}`);
  };

  const stats = [
    {
      label: "Açık arıza",
      value: String(openTickets.length),
      icon: Wrench,
      href: "/daire/arizalar",
      className: "bg-blue-50 text-blue-600",
    },
    {
      label: "Bekleyen ödeme",
      value: nextPayment ? currency(nextPayment.amount) : "Yok",
      icon: Wallet,
      href: "/daire/odemeler",
      className: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Güvenlikte kargo",
      value: String(waitingPackages.length),
      icon: Package,
      href: "/daire/kargolar",
      className: "bg-amber-50 text-amber-600",
    },
    {
      label: "Okunmamış bildirim",
      value: String(unread),
      icon: Bell,
      href: "/daire/bildirimler",
      className: "bg-violet-50 text-violet-600",
    },
  ];

  const quickActions = [
    { label: "Arıza Bildir", icon: Plus, href: "/daire/arizalar", className: "bg-blue-600" },
    { label: "Ödeme Yap", icon: Wallet, href: "/daire/odemeler", className: "bg-emerald-600" },
    {
      label: "Hak Devret",
      icon: ArrowLeftRight,
      href: "/daire/hak-transfer",
      className: "bg-violet-600",
    },
    { label: "Anketler", icon: BarChart3, href: "/daire/anketler", className: "bg-amber-500" },
  ];

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-6 text-white shadow-lg shadow-blue-600/20">
        <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative">
          <p className="text-xs font-medium text-blue-100">
            {new Date().toLocaleDateString("tr-TR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Merhaba, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-blue-100">
            Daire {apartment?.id} · {apartment?.block} Blok
          </p>

          <div className="mt-5 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-blue-100">Kullanılabilir arıza hakkı</span>
              <span className="font-bold">
                {rights} / {apartment?.rights.total ?? 0}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white"
                style={{
                  width: `${
                    apartment && apartment.rights.total > 0
                      ? Math.round((rights / apartment.rights.total) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Link
              href="/daire/arizalar"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" />
              Arıza Bildir
            </Link>
            <Link
              href="/daire/odemeler"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-500/40 px-4 py-3 text-xs font-bold text-white ring-1 ring-inset ring-white/25 transition hover:bg-blue-500/60"
            >
              <Wallet className="h-4 w-4" />
              Ödeme Yap
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl",
                stat.className
              )}
            >
              <stat.icon className="h-4 w-4" />
            </span>
            <p className="mt-3 text-lg font-bold leading-tight text-slate-900">
              {stat.value}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">
              {stat.label}
            </p>
          </Link>
        ))}
      </section>

      <section>
        <SectionHeader title="Hızlı İşlemler" />
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl text-white",
                  action.className
                )}
              >
                <action.icon className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-semibold leading-tight text-slate-600">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Dairem"
          subtitle={`${apartment?.block} Blok · ${apartment?.id}`}
          action={
            <Badge
              className={
                rights > 0
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-red-50 text-red-700 ring-red-200"
              }
            >
              {rights} arıza hakkı
            </Badge>
          }
        />
        <Card className="p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Building2 className="h-4 w-4 text-blue-600" />
              Daire yerleşimi
            </p>
            <p className="text-[10px] text-slate-400">Bölüme dokun, arıza bildir</p>
          </div>
          <div className="mt-4 grid auto-rows-[74px] grid-cols-4 gap-2 sm:auto-rows-[84px]">
            {ROOMS.map((room) => {
              const openCount = openTickets.filter(
                (ticket) => ticket.location === room.label
              ).length;
              return (
                <button
                  key={room.key}
                  type="button"
                  onClick={() => openRoom(room.key)}
                  className={cn(
                    "group relative flex flex-col items-start justify-between rounded-xl p-2.5 text-left ring-1 transition",
                    room.span,
                    openCount > 0
                      ? "bg-red-50 ring-red-200 hover:bg-red-100"
                      : "bg-slate-50 ring-slate-200 hover:bg-white hover:shadow-sm hover:ring-blue-300"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg",
                      openCount > 0
                        ? "bg-red-100 text-red-600"
                        : "bg-white text-blue-600 ring-1 ring-slate-200"
                    )}
                  >
                    <room.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex w-full items-end justify-between gap-1">
                    <span
                      className={cn(
                        "text-[11px] font-semibold leading-tight",
                        openCount > 0 ? "text-red-700" : "text-slate-700"
                      )}
                    >
                      {room.label}
                    </span>
                    {openCount > 0 ? (
                      <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        {openCount}
                      </span>
                    ) : (
                      <Plus className="h-3 w-3 text-slate-300 transition group-hover:text-blue-500" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section>
          <SectionHeader
            title="Arıza Kayıtlarım"
            subtitle={`${openTickets.length} açık kayıt`}
            action={
              <Link
                href="/daire/arizalar"
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600"
              >
                Tümü <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <Card className="divide-y divide-slate-100 p-0">
            {myTickets.slice(0, 3).map((ticket) => (
              <Link
                key={ticket.id}
                href="/daire/arizalar"
                className="flex items-start gap-3 p-4 transition hover:bg-slate-50"
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    ticket.priority === "high"
                      ? "bg-red-50 text-red-600"
                      : ticket.priority === "medium"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-slate-100 text-slate-500"
                  )}
                >
                  <Wrench className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-slate-800">
                      {ticket.title}
                    </span>
                    <Badge className={ticketStatusMeta[ticket.status].className}>
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          ticketStatusMeta[ticket.status].dot
                        )}
                      />
                      {ticketStatusMeta[ticket.status].label}
                    </Badge>
                  </span>
                  <span className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                    {ticket.location ? (
                      <>
                        <span>{ticket.location}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                      </>
                    ) : null}
                    <span>{ticket.category}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{relativeTime(ticket.createdAt)}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span className="font-medium">{priorityMeta[ticket.priority].label}</span>
                  </span>
                </span>
              </Link>
            ))}
            {myTickets.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">
                Henüz arıza kaydınız bulunmuyor.
              </p>
            ) : null}
          </Card>
        </section>

        <section>
          <SectionHeader
            title="Aidat Durumu"
            action={
              <Link
                href="/daire/odemeler"
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600"
              >
                Tümü <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <Card>
            {nextPayment ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      {nextPayment.period}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {currency(nextPayment.amount)}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Son ödeme: {formatDate(nextPayment.dueDate)}
                    </p>
                  </div>
                  <Badge className="bg-amber-50 text-amber-700 ring-amber-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Bekliyor
                  </Badge>
                </div>
                <Link href="/daire/odemeler" className="mt-4 block">
                  <Button variant="blue" className="w-full">
                    <Wallet className="h-4 w-4" />
                    Hemen Öde
                  </Button>
                </Link>
                {unpaid.length > 1 ? (
                  <p className="mt-3 text-center text-[11px] text-slate-500">
                    Toplam {unpaid.length} bekleyen ödemeniz var.
                  </p>
                ) : null}
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <p className="text-sm font-semibold text-slate-800">
                  Tüm ödemeleriniz tamam
                </p>
                <p className="text-[11px] text-slate-500">
                  Bekleyen aidat borcunuz bulunmuyor.
                </p>
              </div>
            )}
          </Card>
        </section>

        <section>
          <SectionHeader
            title="Son Duyurular"
            action={
              <Link
                href="/daire/duyurular"
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600"
              >
                Tümü <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <div className="space-y-3">
            {latestAnnouncements.map((announcement) => (
              <Card key={announcement.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    className={announcementCategoryMeta[announcement.category].className}
                  >
                    {announcementCategoryMeta[announcement.category].label}
                  </Badge>
                  <span className="text-[10px] text-slate-400">
                    {relativeTime(announcement.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {announcement.title}
                </p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">
                  {announcement.body}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Kargo & Toplantı" />
          <div className="space-y-3">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Package className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {waitingPackages.length > 0
                      ? `${waitingPackages.length} kargo güvenlikte`
                      : "Bekleyen kargo yok"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {waitingPackages[0]
                      ? `${waitingPackages[0].courier} · ${relativeTime(waitingPackages[0].receivedAt)}`
                      : "Kargonuz teslim alındığında bildirim alırsınız."}
                  </p>
                </div>
                <Link
                  href="/daire/kargolar"
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Card>

            {nextMeeting ? (
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {nextMeeting.title}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {formatDateTime(nextMeeting.date)} · {nextMeeting.location}
                    </p>
                  </div>
                  <Link
                    href="/daire/toplantilar"
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Card>
            ) : null}
          </div>
        </section>
      </div>

      {activePoll ? (
        <section>
          <SectionHeader
            title="Aktif Anket"
            subtitle={`${pollTotal(activePoll)} oy kullanıldı`}
            action={
              <Link
                href="/daire/anketler"
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600"
              >
                Oy Ver <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <Card>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <BarChart3 className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {activePoll.question}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Bitiş: {formatDate(activePoll.endsAt)}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2.5">
              {activePoll.options.map((option) => (
                <div key={option.id}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-600">{option.label}</span>
                    <span className="font-semibold text-slate-700">
                      %{pollPercent(activePoll, option.id)}
                    </span>
                  </div>
                  <Progress value={pollPercent(activePoll, option.id)} barClassName="bg-violet-500" />
                </div>
              ))}
            </div>
          </Card>
        </section>
      ) : null}

      <section>
        <SectionHeader
          title="Son Bildirimler"
          action={
            <Link
              href="/daire/bildirimler"
              className="flex items-center gap-1 text-[11px] font-semibold text-blue-600"
            >
              Tümü <ArrowRight className="h-3 w-3" />
            </Link>
          }
        />
        <Card className="divide-y divide-slate-100 p-0">
          {notifications.slice(0, 4).map((notification) => (
            <div key={notification.id} className="flex gap-3 p-4">
              <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                {notification.type === "payment" ? (
                  <Wallet className="h-3.5 w-3.5" />
                ) : notification.type === "package" ? (
                  <Package className="h-3.5 w-3.5" />
                ) : notification.type === "announcement" ? (
                  <Megaphone className="h-3.5 w-3.5" />
                ) : (
                  <Bell className="h-3.5 w-3.5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800">
                  {notification.title}
                </p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">
                  {notification.body}
                </p>
              </div>
              <span className="text-[10px] text-slate-400">
                {relativeTime(notification.at)}
              </span>
            </div>
          ))}
          {notifications.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-400">Bildirim yok.</p>
          ) : null}
        </Card>
      </section>

      <Modal
        open={activeRoom !== null}
        onClose={closeRoom}
        title={activeRoom ? `${activeRoom.label} · Daire ${apartment?.id}` : "Dairem"}
        description={
          createdTicket
            ? "Arıza kaydınız oluşturuldu."
            : "Hizmet türünü ve konumu seçerek arıza bildirin."
        }
      >
        {activeRoom ? (
          createdTicket ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <p className="text-sm font-bold text-slate-900">Arıza kaydınız alındı</p>
              <p className="text-xs text-slate-500">
                {createdTicket} için yönetim bilgilendirildi.
              </p>
              <div className="mt-2 flex w-full gap-2">
                <Button variant="outline" className="flex-1" onClick={closeRoom}>
                  Kapat
                </Button>
                <Link href="/daire/arizalar" className="flex-1">
                  <Button variant="blue" className="w-full">
                    Arızalarım
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {rights <= 0 ? (
                <div className="rounded-xl bg-red-50 p-3 text-[11px] font-medium text-red-700 ring-1 ring-red-200">
                  Arıza hakkınız kalmadı.{" "}
                  <Link href="/daire/hak-transfer" className="underline">
                    Hak transferi yapın
                  </Link>
                  .
                </div>
              ) : null}

              {roomOpenIssues.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Bu bölümdeki açık kayıtlar
                  </p>
                  {roomOpenIssues.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2"
                    >
                      <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-slate-700">
                        {ticket.title}
                      </span>
                      <Badge className={ticketStatusMeta[ticket.status].className}>
                        {ticketStatusMeta[ticket.status].label}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : null}

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  1 · Hizmet türü
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {SERVICES.map((service) => (
                    <button
                      key={service.key}
                      type="button"
                      onClick={() => setServiceKey(service.key)}
                      disabled={rights <= 0}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl px-2 py-2.5 text-[10px] font-semibold ring-1 transition disabled:cursor-not-allowed disabled:opacity-50",
                        serviceKey === service.key
                          ? "bg-blue-50 text-blue-700 ring-blue-300"
                          : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <service.icon className="h-4 w-4" />
                      {service.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  2 · Konum
                </p>
                <div className="flex flex-wrap gap-2">
                  {ROOMS.map((room) => (
                    <button
                      key={room.key}
                      type="button"
                      onClick={() => setRoomKey(room.key)}
                      disabled={rights <= 0}
                      className={cn(
                        "flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold ring-1 transition disabled:cursor-not-allowed disabled:opacity-50",
                        room.key === activeRoom.key
                          ? "bg-blue-50 text-blue-700 ring-blue-300"
                          : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <room.icon className="h-3.5 w-3.5" />
                      {room.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  3 · Öncelik
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { key: "medium", label: "Normal" },
                      { key: "high", label: "Acil" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setPriority(option.key)}
                      disabled={rights <= 0}
                      className={cn(
                        "rounded-xl px-3 py-2 text-[11px] font-semibold ring-1 transition disabled:cursor-not-allowed disabled:opacity-50",
                        priority === option.key
                          ? option.key === "high"
                            ? "bg-red-50 text-red-700 ring-red-300"
                            : "bg-blue-50 text-blue-700 ring-blue-300"
                          : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Kısa not (opsiyonel)
                </p>
                <Textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Sorunu kısaca anlatın..."
                  rows={3}
                  disabled={rights <= 0}
                />
              </div>

              {ticketError ? (
                <p className="text-[11px] font-medium text-red-600">{ticketError}</p>
              ) : null}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={closeRoom}>
                  Vazgeç
                </Button>
                <Button
                  variant="blue"
                  className="flex-1"
                  disabled={!activeService || rights <= 0}
                  onClick={submitTicket}
                >
                  <Wrench className="h-4 w-4" />
                  Arıza Bildir
                </Button>
              </div>
            </div>
          )
        ) : null}
      </Modal>
    </div>
  );
}
