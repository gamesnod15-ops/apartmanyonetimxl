"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Building2,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  Home,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Settings,
  UserPlus,
  Users,
  Wallet,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { useStore } from "@/app/lib/store";
import {
  relativeTime,
  notificationMeta,
  unreadCount,
  visibleNotifications,
} from "@/app/lib/selectors";
import type { Role } from "@/app/lib/types";
import { Avatar, cn } from "./ui";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const residentNav: NavItem[] = [
  { href: "/daire", label: "Ana Sayfa", icon: Home },
  { href: "/daire/arizalar", label: "Arızalar", icon: Wrench },
  { href: "/daire/odemeler", label: "Ödemeler", icon: Wallet },
  { href: "/daire/hak-transfer", label: "Hak Transferi", icon: ArrowLeftRight },
  { href: "/daire/kargolar", label: "Kargolar", icon: Package },
  { href: "/daire/toplantilar", label: "Toplantılar", icon: CalendarDays },
  { href: "/daire/anketler", label: "Anketler", icon: BarChart3 },
];

const adminNav: NavItem[] = [
  { href: "/yonetim", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/yonetim/arizalar", label: "Arıza Yönetimi", icon: Wrench },
  { href: "/yonetim/finans", label: "Finans & Aidat", icon: Wallet },
  { href: "/yonetim/kargolar", label: "Kargo Yönetimi", icon: Package },
  { href: "/yonetim/anketler", label: "Anketler", icon: BarChart3 },
  { href: "/yonetim/toplantilar", label: "Toplantılar", icon: CalendarDays },
  { href: "/yonetim/kayitlar", label: "Kayıt Talepleri", icon: UserPlus },
  { href: "/yonetim/kullanicilar", label: "Kullanıcı & Daire", icon: Users },
];

const residentQuickNav: NavItem[] = [
  { href: "/daire/bildirimler", label: "Bildirimler", icon: Bell },
  { href: "/daire/takvim", label: "Takvim", icon: CalendarClock },
  { href: "/daire/duyurular", label: "Duyurular", icon: Megaphone },
];

const adminQuickNav: NavItem[] = [
  { href: "/yonetim/bildirimler", label: "Bildirimler", icon: Bell },
  { href: "/yonetim/takvim", label: "Takvim", icon: CalendarClock },
  { href: "/yonetim/duyurular", label: "Duyurular", icon: Megaphone },
];

function isActive(pathname: string, item: NavItem, root: string) {
  if (item.href === root) return pathname === root;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppShell({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const { user, hydrated, logout, data, markNotificationRead, markAllNotificationsRead } =
    useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const admin = role === "admin";
  const nav = admin ? adminNav : residentNav;
  const quickNav = admin ? adminQuickNav : residentQuickNav;
  const settingsHref = admin ? "/yonetim/ayarlar" : "/daire/ayarlar";
  const root = admin ? "/yonetim" : "/daire";
  const allNav = [
    ...nav,
    ...quickNav,
    { href: settingsHref, label: "Ayarlar", icon: Settings },
  ];

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== role) {
      router.replace(user.role === "admin" ? "/yonetim" : "/daire");
    }
  }, [hydrated, user, role, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close overlays after navigation
    setBellOpen(false);
    setProfileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  if (!hydrated || !user || user.role !== role) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          <p className="text-xs font-medium text-slate-500">Yükleniyor…</p>
        </div>
      </div>
    );
  }

  const bottomNav = nav.slice(0, 4);
  const extraNav = nav.slice(4);
  const unread = unreadCount(data, user);
  const notifications = visibleNotifications(data, user).slice(0, 8);
  const activeItem =
    allNav.find((item) => isActive(pathname, item, root)) ?? nav[0];

  return (
    <div className="min-h-dvh bg-slate-100">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-72 flex-col md:flex",
          admin
            ? "bg-slate-950 text-slate-300"
            : "border-r border-slate-200 bg-white text-slate-700"
        )}
      >
        <div className="flex items-center gap-3 px-6 py-6">
          <span
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg",
              admin
                ? "bg-gradient-to-br from-red-500 to-red-700 shadow-red-900/40"
                : "bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/30"
            )}
          >
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <p
              className={cn(
                "text-sm font-bold leading-tight",
                admin ? "text-white" : "text-slate-900"
              )}
            >
              Apartman Yönetim
            </p>
            <p
              className={cn(
                "text-[11px]",
                admin ? "text-red-300" : "text-blue-600"
              )}
            >
              {admin ? "Uygulama Yönetimi" : "Daire Paneli"}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 no-scrollbar">
          {nav.map((item) => {
            const active = isActive(pathname, item, root);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? admin
                      ? "bg-red-500/15 text-white ring-1 ring-inset ring-red-500/30"
                      : "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100"
                    : admin
                      ? "text-slate-400 hover:bg-white/5 hover:text-white"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="md:pl-72">
        <header className="safe-top sticky top-0 z-30 border-b border-slate-200 bg-white">
          <div className="flex h-14 w-full items-center justify-between gap-3 px-4 md:h-16 md:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl text-white md:hidden",
                  admin
                    ? "bg-gradient-to-br from-red-500 to-red-700"
                    : "bg-gradient-to-br from-blue-500 to-blue-700"
                )}
              >
                <Building2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  {admin ? "Uygulama Yönetimi" : "Daire"}
                </p>
                <h1 className="text-base font-bold leading-tight text-slate-900">
                  {activeItem.label}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    setBellOpen((value) => !value);
                  }}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200/60 hover:text-slate-700"
                  aria-label="Bildirimler"
                >
                  <Bell className="h-5 w-5" />
                  {unread > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                      {unread}
                    </span>
                  ) : null}
                </button>

                {bellOpen ? (
                  <div className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-pop">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <p className="text-sm font-bold text-slate-900">Bildirimler</p>
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Tümünü okundu yap
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-8 text-center text-xs text-slate-400">
                          Henüz bildirim yok.
                        </p>
                      ) : (
                        notifications.map((notification) => {
                          const meta = notificationMeta(notification.type);
                          return (
                            <button
                              key={notification.id}
                              type="button"
                              onClick={() => markNotificationRead(notification.id)}
                              className={cn(
                                "flex w-full gap-3 px-4 py-3 text-left transition hover:bg-slate-50",
                                !notification.read && "bg-blue-50/40"
                              )}
                            >
                              <span
                                className={cn(
                                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                  meta.className
                                )}
                              >
                                <Bell className="h-3.5 w-3.5" />
                              </span>
                              <span className="min-w-0">
                                <span className="flex items-center gap-2">
                                  <span className="truncate text-xs font-semibold text-slate-800">
                                    {notification.title}
                                  </span>
                                  {!notification.read ? (
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                                  ) : null}
                                </span>
                                <span className="mt-0.5 line-clamp-2 block text-[11px] leading-4 text-slate-500">
                                  {notification.body}
                                </span>
                                <span className="mt-1 block text-[10px] text-slate-400">
                                  {relativeTime(notification.at)}
                                </span>
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                    <Link
                      href={quickNav[0].href}
                      onClick={() => setBellOpen(false)}
                      className="block border-t border-slate-100 px-4 py-2.5 text-center text-[11px] font-semibold text-blue-600 transition hover:bg-slate-50"
                    >
                      Tüm bildirimleri gör
                    </Link>
                  </div>
                ) : null}
              </div>

              {quickNav.slice(1).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={item.label}
                    title={item.label}
                    className="hidden h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200/60 hover:text-slate-700 md:flex"
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  setBellOpen(false);
                  setMenuOpen(true);
                }}
                aria-label="Menü"
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200/60 hover:text-slate-700 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setBellOpen(false);
                    setProfileOpen((value) => !value);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition hover:opacity-80"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                >
                  <Avatar
                    name={user.name}
                    color={user.avatarColor}
                    className="h-7 w-7 text-[10px]"
                  />
                </button>

                {profileOpen ? (
                  <>
                    <button
                      type="button"
                      aria-label="Menüyü kapat"
                      onClick={() => setProfileOpen(false)}
                      className="fixed inset-0 z-40 cursor-default"
                    />
                    <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-pop">
                      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                        <Avatar name={user.name} color={user.avatarColor} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {user.name}
                          </p>
                          <p className="truncate text-[11px] text-slate-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="p-1.5">
                        <Link
                          href={settingsHref}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          <Settings className="h-4 w-4" />
                          Ayarlar
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            logout();
                            router.replace("/login");
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Çıkış Yap
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="w-full px-4 pb-safe pt-4 md:px-6 md:pb-10 md:pt-6 lg:px-8">
          <div key={pathname} className="animate-fade-up">
            {children}
          </div>
        </main>
      </div>

      <nav
        className="fixed inset-x-2 z-40 mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:inset-x-3 sm:rounded-3xl sm:p-1.5 md:hidden"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      >
        <div className="grid grid-cols-4 gap-0.5">
          {bottomNav.map((item) => {
            const active = isActive(pathname, item, root);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[9px] font-semibold transition active:scale-95 min-[360px]:py-2 min-[360px]:text-[10px] sm:rounded-2xl",
                  active
                    ? admin
                      ? "bg-red-50 text-red-600"
                      : "bg-blue-50 text-blue-700"
                    : "text-slate-400"
                )}
              >
                <Icon className={cn("h-[18px] w-[18px] min-[360px]:h-5 min-[360px]:w-5", active && "stroke-[2.4]")} />
                <span className="max-w-full truncate px-0.5">
                  {item.label.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Kapat"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-3xl bg-white p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-slide-up sm:rounded-t-[2rem] sm:p-5">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={user.name} color={user.avatarColor} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {user.name}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">{user.email}</p>
                </div>
              </div>
              <Link
                href={settingsHref}
                onClick={() => setMenuOpen(false)}
                aria-label="Ayarlar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 transition hover:bg-slate-200"
                aria-label="Kapat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-2 mt-5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Tüm Sayfalar
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[...extraNav, ...quickNav].map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item, root);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-xl p-2 text-center text-[10px] font-semibold ring-1 transition active:scale-95 min-[360px]:gap-2 min-[360px]:p-3 min-[360px]:text-[11px] sm:rounded-2xl",
                      active
                        ? admin
                          ? "bg-red-50 text-red-700 ring-red-100"
                          : "bg-blue-50 text-blue-700 ring-blue-100"
                        : "bg-slate-50 text-slate-600 ring-slate-100"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        active
                          ? admin
                            ? "text-red-600"
                            : "text-blue-600"
                          : admin
                            ? "text-red-500"
                            : "text-blue-600"
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                  router.replace("/login");
                }}
                className="flex w-full items-center justify-between rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                <span className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Çıkış Yap
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
