"use client";

import Link from "next/link";
import {
  ArrowLeftRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarClock,
  CalendarDays,
  House,
  Megaphone,
  Package,
  Plus,
  Settings,
  ShieldCheck,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useStore } from "@/app/lib/store";
import { cn } from "@/app/components/ui";
import {
  currency,
  formatDate,
  remainingRights,
  visibleNotifications,
} from "@/app/lib/selectors";
import { useNow } from "@/app/lib/use-now";

interface PanelTile {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  tone: string;
  /** Number shown as a red badge when the section needs attention. */
  alert?: number;
}

export default function DaireDashboard() {
  const { data, user } = useStore();
  const now = useNow();
  if (!user) return null;

  const apartment = data.apartments.find((item) => item.id === user.apartmentId);
  const myTickets = data.tickets.filter((ticket) => ticket.apartmentId === apartment?.id);
  const openTickets = myTickets.filter((ticket) => ticket.status !== "resolved");
  const unpaid = data.payments
    .filter((payment) => payment.apartmentId === apartment?.id && payment.status !== "paid")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const unpaidTotal = unpaid.reduce((sum, payment) => sum + payment.amount, 0);
  const waitingPackages = data.packages.filter(
    (item) => item.apartmentId === apartment?.id && item.status === "security"
  );
  const unread = visibleNotifications(data, user).filter((item) => !item.read).length;
  const rights = remainingRights(apartment);
  const totalRights = apartment?.rights.total ?? 0;
  const nextMeeting = [...data.meetings]
    .filter((meeting) => new Date(meeting.date).getTime() > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  const activePolls = data.polls.filter((poll) => new Date(poll.endsAt).getTime() > now);

  const tiles: PanelTile[] = [
    {
      href: "/daire/arizalar",
      label: "Arızalarım",
      hint: openTickets.length > 0 ? `${openTickets.length} açık kayıt` : "Açık kayıt yok",
      icon: Wrench,
      tone: "bg-blue-600 text-white",
    },
    {
      href: "/daire/odemeler",
      label: "Ödemeler",
      hint: unpaid.length > 0 ? `${currency(unpaidTotal)} bekliyor` : "Borcunuz yok",
      icon: Wallet,
      tone: "bg-blue-600 text-white",
      alert: unpaid.length,
    },
    {
      href: "/daire/kargolar",
      label: "Kargolar",
      hint:
        waitingPackages.length > 0
          ? `${waitingPackages.length} kargo güvenlikte`
          : "Bekleyen kargo yok",
      icon: Package,
      tone: "bg-blue-600 text-white",
      alert: waitingPackages.length,
    },
    {
      href: "/daire/duyurular",
      label: "Duyurular",
      hint: `${data.announcements.length} duyuru`,
      icon: Megaphone,
      tone: "bg-blue-600 text-white",
    },
    {
      href: "/daire/toplantilar",
      label: "Toplantılar",
      hint: nextMeeting ? `Sıradaki: ${formatDate(nextMeeting.date)}` : "Planlı toplantı yok",
      icon: CalendarDays,
      tone: "bg-blue-600 text-white",
    },
    {
      href: "/daire/anketler",
      label: "Anketler",
      hint: activePolls.length > 0 ? `${activePolls.length} aktif anket` : "Aktif anket yok",
      icon: BarChart3,
      tone: "bg-blue-600 text-white",
      alert: activePolls.length,
    },
    {
      href: "/daire/hak-transfer",
      label: "Hak Transferi",
      hint: `${rights} hak kullanılabilir`,
      icon: ArrowLeftRight,
      tone: "bg-blue-600 text-white",
    },
    {
      href: "/daire/dairem",
      label: "Dairem",
      hint: apartment ? `${apartment.block} Blok · ${apartment.id}` : "Daire bilgileri",
      icon: House,
      tone: "bg-blue-600 text-white",
    },
    {
      href: "/daire/takvim",
      label: "Takvim",
      hint: "Etkinlik ve tarihler",
      icon: CalendarClock,
      tone: "bg-blue-600 text-white",
    },
    {
      href: "/daire/bildirimler",
      label: "Bildirimler",
      hint: unread > 0 ? `${unread} okunmamış` : "Hepsi okundu",
      icon: Bell,
      tone: "bg-blue-600 text-white",
      alert: unread,
    },
    {
      href: "/daire/ayarlar",
      label: "Ayarlar",
      hint: "Hesap ve tercihler",
      icon: Settings,
      tone: "bg-blue-600 text-white",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden hero-soft p-6 md:p-8">
        <div className="hero-texture pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="h-4 text-xs font-medium text-blue-100">
              {now
                ? new Date(now).toLocaleDateString("tr-TR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                : null}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              Merhaba, {user.name.split(" ")[0]} 👋
            </h1>
            <p className="mt-1 text-sm text-blue-100">
              Daire {apartment?.id} · {apartment?.block} Blok
            </p>
          </div>

          <div className="w-full rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur md:max-w-xs">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-blue-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                Ücretsiz arıza hakkı
              </span>
              <span className="font-bold">
                {rights} / {totalRights}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{
                  width: `${totalRights > 0 ? Math.round((rights / totalRights) * 100) : 0}%`,
                }}
              />
            </div>
            <Link
              href="/daire/arizalar/yeni"
              className="mt-4 flex items-center justify-center gap-2 rounded-[14px] bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Arıza Bildir
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-slate-900">Menü</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              İşlem yapmak istediğiniz bölümü seçin
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {tiles.map((tile, index) => (
            <Link
              key={tile.href}
              href={tile.href}
              style={{ animationDelay: `${index * 30}ms` }}
              className="group relative flex min-h-[8.5rem] flex-col justify-between rounded-[22px] bg-white p-4 shadow-soft transition duration-200 animate-fade-up hover:-translate-y-0.5 hover:shadow-lift active:scale-[0.98] md:p-5"
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-[13px] shadow-sm",
                    tile.tone
                  )}
                >
                  <tile.icon className="h-5 w-5" />
                </span>
                {tile.alert ? (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white">
                    {tile.alert}
                  </span>
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm font-bold tracking-tight text-slate-900">{tile.label}</p>
                <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">
                  {tile.hint}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
