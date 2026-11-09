import type {
  AnnouncementCategory,
  AppData,
  AppNotification,
  Apartment,
  AttendanceStatus,
  PackageStatus,
  Payment,
  PaymentStatus,
  Poll,
  Priority,
  TicketStatus,
  User,
} from "./types";

export const CATEGORIES = [
  "Elektrik",
  "Su",
  "Tesisat",
  "Isıtma",
  "Asansör",
  "Temizlik",
  "Güvenlik",
  "Diğer",
] as const;

export function currency(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "az önce";
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} gün önce`;
  return formatDate(value);
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("tr-TR");
}

export function getApartment(data: AppData, id?: string) {
  return data.apartments.find((apartment) => apartment.id === id);
}

export function remainingRights(apartment?: Apartment) {
  if (!apartment) return 0;
  return Math.max(0, apartment.rights.total - apartment.rights.used);
}

export const ticketStatusMeta: Record<
  TicketStatus,
  { label: string; className: string; dot: string }
> = {
  pending: {
    label: "Beklemede",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
  in_progress: {
    label: "İşleme Alındı",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
    dot: "bg-blue-500",
  },
  resolved: {
    label: "Çözüldü",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
};

export const priorityMeta: Record<
  Priority,
  { label: string; className: string; bar: string }
> = {
  low: {
    label: "Düşük",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
    bar: "bg-slate-400",
  },
  medium: {
    label: "Orta",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    bar: "bg-amber-500",
  },
  high: {
    label: "Yüksek",
    className: "bg-red-50 text-red-700 ring-red-200",
    bar: "bg-red-500",
  },
};

export const paymentStatusMeta: Record<
  PaymentStatus,
  { label: string; className: string; dot: string }
> = {
  paid: {
    label: "Ödendi",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  pending: {
    label: "Bekliyor",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
  overdue: {
    label: "Gecikmiş",
    className: "bg-red-50 text-red-700 ring-red-200",
    dot: "bg-red-500",
  },
};

export const announcementCategoryMeta: Record<
  AnnouncementCategory,
  { label: string; className: string }
> = {
  genel: { label: "Genel", className: "bg-slate-100 text-slate-600 ring-slate-200" },
  bakim: { label: "Bakım", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  toplanti: { label: "Toplantı", className: "bg-violet-50 text-violet-700 ring-violet-200" },
  finans: { label: "Finans", className: "bg-blue-50 text-blue-700 ring-blue-200" },
  guvenlik: { label: "Güvenlik", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
};

export const packageStatusMeta: Record<
  PackageStatus,
  { label: string; className: string; dot: string }
> = {
  security: {
    label: "Kargonuz Güvenlikte",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
  delivered: {
    label: "Teslim Alındı",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
};

export const attendanceMeta: Record<
  AttendanceStatus,
  { label: string; className: string }
> = {
  yes: { label: "Katılacağım", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  no: { label: "Katılmayacağım", className: "bg-red-50 text-red-700 ring-red-200" },
  proxy: { label: "Vekalet Vereceğim", className: "bg-amber-50 text-amber-700 ring-amber-200" },
};

export function visibleNotifications(data: AppData, user: User) {
  return data.notifications
    .filter(
      (notification) =>
        notification.audience === "all" ||
        notification.audience === user.role ||
        notification.userId === user.id
    )
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function unreadCount(data: AppData, user: User) {
  return visibleNotifications(data, user).filter((notification) => !notification.read)
    .length;
}

export function notificationMeta(type: AppNotification["type"]) {
  switch (type) {
    case "ticket":
      return { className: "bg-blue-50 text-blue-600", label: "Arıza" };
    case "payment":
      return { className: "bg-emerald-50 text-emerald-600", label: "Ödeme" };
    case "package":
      return { className: "bg-amber-50 text-amber-600", label: "Kargo" };
    case "announcement":
      return { className: "bg-violet-50 text-violet-600", label: "Duyuru" };
    case "meeting":
      return { className: "bg-sky-50 text-sky-600", label: "Toplantı" };
    case "poll":
      return { className: "bg-rose-50 text-rose-600", label: "Anket" };
    default:
      return { className: "bg-slate-100 text-slate-600", label: "Sistem" };
  }
}

export function collectionStats(payments: Payment[]) {
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const paid = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);
  return {
    total,
    paid,
    outstanding: total - paid,
    rate: total === 0 ? 0 : Math.round((paid / total) * 100),
  };
}

export function pollTotal(poll: Poll) {
  return poll.options.reduce((sum, option) => sum + option.votes, 0);
}

export function pollPercent(poll: Poll, optionId: string) {
  const total = pollTotal(poll);
  const option = poll.options.find((item) => item.id === optionId);
  if (!total || !option) return 0;
  return Math.round((option.votes / total) * 100);
}

export function meetingCounts(meeting: { attendance: Record<string, AttendanceStatus> }) {
  const values = Object.values(meeting.attendance);
  return {
    yes: values.filter((value) => value === "yes").length,
    no: values.filter((value) => value === "no").length,
    proxy: values.filter((value) => value === "proxy").length,
  };
}
