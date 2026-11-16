"use client";

import { useState } from "react";
import {
  Bell,
  BellRing,
  CheckCheck,
  Megaphone,
  Package,
  Ticket,
  Wallet,
} from "lucide-react";
import { useStore } from "@/app/lib/store";
import { Button, Card, EmptyState, Segmented, cn } from "./ui";
import {
  notificationMeta,
  relativeTime,
  visibleNotifications,
} from "@/app/lib/selectors";
import type { NotificationType } from "@/app/lib/types";

type Filter = "all" | "unread";

function NotificationIcon({ type }: { type: NotificationType }) {
  const icons: Record<NotificationType, typeof Bell> = {
    ticket: Ticket,
    payment: Wallet,
    package: Package,
    announcement: Megaphone,
    meeting: Bell,
    poll: BellRing,
    system: Bell,
  };
  const Icon = icons[type];
  const meta = notificationMeta(type);
  return (
    <span
      className={cn(
        "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
        meta.className
      )}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

export function NotificationsCenter() {
  const { data, user, markNotificationRead, markAllNotificationsRead } = useStore();
  const [filter, setFilter] = useState<Filter>("all");

  if (!user) return null;

  const notifications = visibleNotifications(data, user);
  const unread = notifications.filter((item) => !item.read);
  const filtered = filter === "unread" ? unread : notifications;

  return (
    <div className="space-y-4">
      <section className="flex items-center justify-between gap-3 hero-soft p-6">
        <div>
          <p className="text-[14px] font-medium text-slate-300">Bildirim Merkezi</p>
          <h1 className="mt-1 text-xl font-bold">Bildirimler</h1>
          <p className="mt-1 text-[13.5px] text-slate-400">
            {unread.length} okunmamış · {notifications.length} toplam
          </p>
        </div>
        <Button
          variant="soft"
          size="sm"
          onClick={markAllNotificationsRead}
          className="bg-white/10 text-white hover:bg-white/20"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          Tümünü Oku
        </Button>
      </section>

      <Segmented
        options={[
          { value: "all", label: "Tümü", count: notifications.length },
          { value: "unread", label: "Okunmamış", count: unread.length },
        ]}
        value={filter}
        onChange={setFilter}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-5 w-5" />}
          title={filter === "unread" ? "Okunmamış bildirim yok" : "Bildirim yok"}
          description="Yeni gelişmeler olduğunda burada görünecek."
        />
      ) : (
        <Card className="divide-y divide-slate-100 p-0">
          {filtered.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => markNotificationRead(notification.id)}
              className={cn(
                "flex w-full gap-3 p-4 text-left transition hover:bg-slate-50",
                !notification.read && "bg-blue-50/40"
              )}
            >
              <NotificationIcon type={notification.type} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[16px] font-semibold text-slate-800">
                    {notification.title}
                  </span>
                  {!notification.read ? (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  ) : null}
                </span>
                <span className="mt-1 block text-[13.5px] leading-5 text-slate-500">
                  {notification.body}
                </span>
                <span className="mt-1 block text-[12.5px] text-slate-400">
                  {relativeTime(notification.at)}
                </span>
              </span>
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}
