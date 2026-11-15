"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  Megaphone,
  Package,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { useStore } from "@/app/lib/store";
import {
  Badge,
  Button,
  Card,
  Progress,
  SectionHeader,
  cn,
} from "@/app/components/ui";
import {
  CATEGORIES,
  collectionStats,
  currency,
  formatDateTime,
  priorityMeta,
  relativeTime,
  ticketStatusMeta,
  visibleNotifications,
} from "@/app/lib/selectors";
import { useNow } from "@/app/lib/use-now";

export default function AdminDashboard() {
  const { data, user, sendPaymentReminder } = useStore();
  const [reminded, setReminded] = useState<string[]>([]);
  const now = useNow();

  if (!user) return null;

  const collection = collectionStats(data.payments);
  const openTickets = data.tickets.filter((ticket) => ticket.status !== "resolved");
  const waitingPackages = data.packages.filter((item) => item.status === "security");
  const activePolls = data.polls.filter(
    (poll) => new Date(poll.endsAt).getTime() > now
  );
  const unpaidPayments = data.payments
    .filter((payment) => payment.status !== "paid")
    .sort((a, b) => a.apartmentId.localeCompare(b.apartmentId, "tr"));
  const notifications = visibleNotifications(data, user).slice(0, 4);

  const statusGroups = [
    {
      label: "Beklemede",
      count: data.tickets.filter((ticket) => ticket.status === "pending").length,
      color: "#f59e0b",
    },
    {
      label: "İşleme Alındı",
      count: data.tickets.filter((ticket) => ticket.status === "in_progress").length,
      color: "#3b82f6",
    },
    {
      label: "Çözüldü",
      count: data.tickets.filter((ticket) => ticket.status === "resolved").length,
      color: "#10b981",
    },
  ];
  const totalTickets = data.tickets.length;
  const segments = statusGroups.map((group) => ({
    ...group,
    percent: totalTickets ? (group.count / totalTickets) * 100 : 0,
  }));
  let cursor = 0;
  const gradientStops = segments.map((segment) => {
    const start = cursor;
    cursor += segment.percent;
    return `${segment.color} ${start}% ${cursor}%`;
  });
  const donutGradient = `conic-gradient(${gradientStops.join(", ")})`;

  const categoryCounts = CATEGORIES.map((category) => ({
    category,
    count: data.tickets.filter((ticket) => ticket.category === category).length,
  }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
  const maxCategory = Math.max(1, ...categoryCounts.map((item) => item.count));

  const recentTickets = [...data.tickets]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const unpaidApartments = Object.values(
    unpaidPayments.reduce<Record<string, { apartmentId: string; total: number }>>(
      (accumulator, payment) => {
        const current = accumulator[payment.apartmentId] ?? {
          apartmentId: payment.apartmentId,
          total: 0,
        };
        current.total += payment.amount;
        accumulator[payment.apartmentId] = current;
        return accumulator;
      },
      {}
    )
  )
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  const stats = [
    {
      label: "Tahsilat Oranı",
      value: `%${collection.rate}`,
      hint: `${currency(collection.paid)} tahsil edildi`,
      icon: TrendingUp,
      className: "bg-emerald-50 text-emerald-600",
      href: "/yonetim/finans",
    },
    {
      label: "Açık Arıza",
      value: String(openTickets.length),
      hint: `${data.tickets.filter((ticket) => ticket.priority === "high" && ticket.status !== "resolved").length} yüksek öncelikli`,
      icon: Wrench,
      className: "bg-red-50 text-red-600",
      href: "/yonetim/arizalar",
    },
    {
      label: "Bekleyen Kargo",
      value: String(waitingPackages.length),
      hint: "Güvenlikte bekliyor",
      icon: Package,
      className: "bg-amber-50 text-amber-600",
      href: "/yonetim/kargolar",
    },
    {
      label: "Aktif Anket",
      value: String(activePolls.length),
      hint: `${data.polls.length} toplam anket`,
      icon: BarChart3,
      className: "bg-violet-50 text-violet-600",
      href: "/yonetim/anketler",
    },
  ];

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden hero-soft p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-red-500/20 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-medium text-red-300">
            {new Date().toLocaleDateString("tr-TR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Yönetim Paneli
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {user.name} · {user.title ?? "Yönetici"}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/yonetim/arizalar"
              className="flex items-center gap-2 rounded-[12px] bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
            >
              <Wrench className="h-4 w-4" />
              Arızalara Git
            </Link>
            <Link
              href="/yonetim/finans"
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white ring-1 ring-inset ring-white/15 transition hover:bg-white/20"
            >
              <Wallet className="h-4 w-4" />
              Finans
            </Link>
            <Link
              href="/yonetim/duyurular"
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white ring-1 ring-inset ring-white/15 transition hover:bg-white/20"
            >
              <Megaphone className="h-4 w-4" />
              Duyuru Yayınla
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> {data.apartments.length} daire
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />{" "}
              {data.users.filter((entry) => entry.role === "resident").length} sakin
            </span>
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />{" "}
              {unpaidPayments.length} bekleyen ödeme
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl",
                stat.className
              )}
            >
              <stat.icon className="h-4 w-4" />
            </span>
            <p className="mt-3 text-xl font-bold leading-tight text-slate-900">
              {stat.value}
            </p>
            <p className="text-[11px] font-medium text-slate-500">{stat.label}</p>
            <p className="mt-0.5 truncate text-[10px] text-slate-400">{stat.hint}</p>
          </Link>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader
            title="Aidat Tahsilat Durumu"
            subtitle={`${currency(collection.outstanding)} bekliyor`}
            action={
              <Link
                href="/yonetim/finans"
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600"
              >
                Detay <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <div className="flex items-center gap-5">
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full" style={{ background: donutGradient }}>
              <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-lg font-bold text-slate-900">%{collection.rate}</span>
                <span className="text-[9px] text-slate-400">tahsilat</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Toplam tahakkuk</span>
                <span className="font-semibold text-slate-800">
                  {currency(collection.total)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Tahsil edilen</span>
                <span className="font-semibold text-emerald-600">
                  {currency(collection.paid)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Bekleyen</span>
                <span className="font-semibold text-red-600">
                  {currency(collection.outstanding)}
                </span>
              </div>
              <Progress value={collection.rate} barClassName="bg-emerald-500" />
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Arıza Durum Dağılımı" subtitle={`${totalTickets} toplam kayıt`} />
          <div className="flex items-center gap-5">
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full" style={{ background: donutGradient }}>
              <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-lg font-bold text-slate-900">{totalTickets}</span>
                <span className="text-[9px] text-slate-400">arıza</span>
              </div>
            </div>
            <div className="flex-1 space-y-2.5">
              {segments.map((segment) => (
                <div key={segment.label} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-2 text-slate-500">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    {segment.label}
                  </span>
                  <span className="font-semibold text-slate-800">{segment.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {categoryCounts.slice(0, 4).map((item) => (
              <div key={item.category}>
                <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{item.category}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
                <Progress
                  value={(item.count / maxCategory) * 100}
                  className="h-1.5"
                  barClassName="bg-blue-500"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section>
          <SectionHeader
            title="Son Arıza Kayıtları"
            action={
              <Link
                href="/yonetim/arizalar"
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600"
              >
                Tümü <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <Card className="divide-y divide-slate-100 p-0">
            {recentTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href="/yonetim/arizalar"
                className="flex items-center gap-3 p-4 transition hover:bg-slate-50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <Wrench className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-800">
                    {ticket.title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {ticket.apartmentId} · {ticket.category} ·{" "}
                    {relativeTime(ticket.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={ticketStatusMeta[ticket.status].className}>
                    {ticketStatusMeta[ticket.status].label}
                  </Badge>
                  <span className={cn("text-[9px] font-semibold", priorityMeta[ticket.priority].className, "rounded-full px-1.5 py-0.5")}>
                    {priorityMeta[ticket.priority].label}
                  </span>
                </div>
              </Link>
            ))}
          </Card>
        </section>

        <section>
          <SectionHeader
            title="Aidat Hatırlatma"
            subtitle="Gecikmiş / bekleyen ödemeler"
            action={
              <Link
                href="/yonetim/finans"
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600"
              >
                Finans <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <Card className="space-y-2 p-4">
            {unpaidApartments.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                <p className="text-xs font-semibold text-slate-700">
                  Bekleyen ödeme yok
                </p>
              </div>
            ) : (
              unpaidApartments.map((item) => {
                const apartment = data.apartments.find(
                  (entry) => entry.id === item.apartmentId
                );
                const isReminded = reminded.includes(item.apartmentId);
                return (
                  <div
                    key={item.apartmentId}
                    className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800">
                        {item.apartmentId}
                      </p>
                      <p className="truncate text-[10px] text-slate-400">
                        {apartment?.ownerName} · {currency(item.total)}
                      </p>
                    </div>
                    <Button
                      variant={isReminded ? "soft" : "danger"}
                      size="sm"
                      disabled={isReminded}
                      onClick={() => {
                        sendPaymentReminder(item.apartmentId);
                        setReminded((prev) => [...prev, item.apartmentId]);
                      }}
                    >
                      {isReminded ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Gönderildi
                        </>
                      ) : (
                        <>
                          <Bell className="h-3.5 w-3.5" />
                          Hatırlat
                        </>
                      )}
                    </Button>
                  </div>
                );
              })
            )}
          </Card>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section>
          <SectionHeader
            title="Bekleyen Kargolar"
            action={
              <Link
                href="/yonetim/kargolar"
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600"
              >
                Tümü <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <Card className="divide-y divide-slate-100 p-0">
            {waitingPackages.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Package className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800">
                    {item.apartmentId} · {item.courier}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {item.description} · {relativeTime(item.receivedAt)}
                  </p>
                </div>
                <Badge className="bg-amber-50 text-amber-700 ring-amber-200">
                  Kod {item.code}
                </Badge>
              </div>
            ))}
            {waitingPackages.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">
                Bekleyen kargo yok.
              </p>
            ) : null}
          </Card>
        </section>

        <section>
          <SectionHeader
            title="Yönetim Bildirimleri"
            action={
              <Link
                href="/yonetim"
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600"
              >
                <Bell className="h-3 w-3" /> Merkez
              </Link>
            }
          />
          <Card className="divide-y divide-slate-100 p-0">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex gap-3 p-4">
                <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <Bell className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800">
                    {notification.title}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">
                    {notification.body}
                  </p>
                </div>
                <span className="text-[9px] text-slate-400">
                  {relativeTime(notification.at)}
                </span>
              </div>
            ))}
            {notifications.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">
                Bildirim yok.
              </p>
            ) : null}
          </Card>
        </section>
      </div>

      <section>
        <SectionHeader title="Yaklaşan Toplantılar" />
        <Card className="divide-y divide-slate-100 p-0">
          {data.meetings
            .filter((meeting) => new Date(meeting.date).getTime() > now)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3)
            .map((meeting) => (
              <Link
                key={meeting.id}
                href="/yonetim/toplantilar"
                className="flex items-center gap-3 p-4 transition hover:bg-slate-50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-800">
                    {meeting.title}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatDateTime(meeting.date)} · {meeting.location}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </Link>
            ))}
        </Card>
      </section>
    </div>
  );
}
