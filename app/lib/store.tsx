"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createSeedData } from "./mock";
import { remainingRights } from "./selectors";
import type {
  AnnouncementCategory,
  AppData,
  AppNotification,
  AttendanceStatus,
  BuildingEvent,
  Meeting,
  NewCalendarEventInput,
  NewTicketInput,
  OccupancyType,
  PackageItem,
  Payment,
  Poll,
  RegistrationRequest,
  Ticket,
  TicketStatus,
  User,
} from "./types";

const DATA_KEY = "apartmanyonetim:data:v1";
const SESSION_KEY = "apartmanyonetim:session:v1";

type Result = { ok: boolean; error?: string };

type LoginResult = { ok: boolean; error?: string; user?: User };

type ActionResult = Result & { id?: string };

interface StoreValue {
  data: AppData;
  user: User | null;
  hydrated: boolean;
  login: (email: string, password: string) => LoginResult;
  registerResident: (input: {
    block: string;
    no: string;
    ownerName: string;
    residentCount: number;
    occupancyType: OccupancyType;
    name: string;
    email: string;
    phone: string;
    password: string;
    vehiclePlate?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    note?: string;
  }) => Result;
  approveRegistration: (requestId: string, reviewNote?: string) => Result;
  rejectRegistration: (requestId: string, reviewNote?: string) => Result;
  updateProfile: (input: {
    name: string;
    email: string;
    phone: string;
  }) => Result;
  logout: () => void;
  createTicket: (input: NewTicketInput) => ActionResult;
  addTicketMessage: (ticketId: string, text: string) => void;
  updateTicketStatus: (
    ticketId: string,
    status: TicketStatus,
    assignedTo?: string
  ) => void;
  payPayment: (paymentId: string) => void;
  addPayment: (input: {
    apartmentId: string;
    period: string;
    amount: number;
    dueDate: string;
  }) => Result;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  transferRights: (input: {
    toApartmentId: string;
    count: number;
    note: string;
  }) => Result;
  addPackage: (input: {
    apartmentId: string;
    courier: string;
    description: string;
  }) => ActionResult;
  deliverPackage: (packageId: string, code: string) => Result;
  vote: (pollId: string, optionId: string) => void;
  createPoll: (input: {
    question: string;
    description: string;
    options: string[];
    endsAt: string;
  }) => void;
  createAnnouncement: (input: {
    title: string;
    body: string;
    category: AnnouncementCategory;
    important: boolean;
    blocks: string[];
  }) => void;
  sendPaymentReminder: (apartmentId: string) => void;
  rsvp: (meetingId: string, status: AttendanceStatus) => void;
  createMeeting: (input: {
    title: string;
    date: string;
    location: string;
    agenda: string[];
  }) => void;
  addCalendarEvent: (input: NewCalendarEventInput) => ActionResult;
  removeCalendarEvent: (eventId: string) => void;
  createApartment: (input: {
    block: string;
    no: string;
    ownerName: string;
    residentCount: number;
    totalRights: number;
  }) => Result;
  addResident: (input: {
    name: string;
    email: string;
    phone: string;
    apartmentId: string;
  }) => Result;
  updateRights: (apartmentId: string, total: number) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function uid(prefix: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`;
}

function normalizeEmail(value: string) {
  return value.trim().toLocaleLowerCase("tr-TR");
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => createSeedData());
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let loaded = createSeedData();
    try {
      const raw = window.localStorage.getItem(DATA_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppData;
        if (parsed && Array.isArray(parsed.apartments) && Array.isArray(parsed.users)) {
          loaded = {
            ...parsed,
            calendarEvents: parsed.calendarEvents ?? createSeedData().calendarEvents,
            registrations: parsed.registrations ?? createSeedData().registrations,
          };
        }
      }
    } catch {
      loaded = createSeedData();
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate persisted data after mount
    setData(loaded);

    try {
      const sessionId = window.localStorage.getItem(SESSION_KEY);
      if (sessionId) {
        setUser(loaded.users.find((item) => item.id === sessionId) ?? null);
      }
    } catch {
      setUser(null);
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(DATA_KEY, JSON.stringify(data));
    } catch {
      // storage full or unavailable; the app keeps running in memory
    }
  }, [data, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (user) window.localStorage.setItem(SESSION_KEY, user.id);
      else window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }, [user, hydrated]);

  const login = (email: string, password: string): LoginResult => {
    const found = data.users.find(
      (item) =>
        normalizeEmail(item.email) === normalizeEmail(email) &&
        item.password === password
    );
    if (found) {
      setUser(found);
      return { ok: true, user: found };
    }
    const request = (data.registrations ?? []).find(
      (item) =>
        normalizeEmail(item.email) === normalizeEmail(email) &&
        item.password === password
    );
    if (request?.status === "pending") {
      return {
        ok: false,
        error: "Kayıt talebiniz yönetim onayı bekliyor. Onaylandığında giriş yapabilirsiniz.",
      };
    }
    if (request?.status === "rejected") {
      return {
        ok: false,
        error: "Kayıt talebiniz reddedildi. Ayrıntı için yönetimle iletişime geçin.",
      };
    }
    return { ok: false, error: "E-posta veya şifre hatalı." };
  };

  const registerResident = (input: {
    block: string;
    no: string;
    ownerName: string;
    residentCount: number;
    occupancyType: OccupancyType;
    name: string;
    email: string;
    phone: string;
    password: string;
    vehiclePlate?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    note?: string;
  }): Result => {
    const block = input.block.trim().toLocaleUpperCase("tr-TR");
    const no = input.no.trim();
    const name = input.name.trim();
    const email = input.email.trim();
    const phone = input.phone.trim();
    const ownerName = input.ownerName.trim();

    if (!block || !no) return { ok: false, error: "Blok ve daire numarası zorunlu." };
    if (ownerName.length < 3) {
      return { ok: false, error: "Daire sahibi ad soyad en az 3 karakter olmalı." };
    }
    if (name.length < 3) return { ok: false, error: "Ad soyad en az 3 karakter olmalı." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: "Geçerli bir e-posta adresi girin." };
    }
    if (data.users.some((item) => normalizeEmail(item.email) === normalizeEmail(email))) {
      return { ok: false, error: "Bu e-posta ile kayıtlı bir hesap var." };
    }
    if (
      (data.registrations ?? []).some(
        (item) =>
          normalizeEmail(item.email) === normalizeEmail(email) &&
          item.status === "pending"
      )
    ) {
      return {
        ok: false,
        error: "Bu e-posta ile onay bekleyen bir kayıt talebiniz var.",
      };
    }
    if (input.password.length < 4) {
      return { ok: false, error: "Şifre en az 4 karakter olmalı." };
    }

    const now = new Date().toISOString();
    const request: RegistrationRequest = {
      id: uid("reg"),
      block,
      no,
      ownerName,
      residentCount: Math.max(1, input.residentCount),
      occupancyType: input.occupancyType,
      name,
      email,
      phone,
      vehiclePlate: input.vehiclePlate?.trim() || undefined,
      emergencyContactName: input.emergencyContactName?.trim() || undefined,
      emergencyContactPhone: input.emergencyContactPhone?.trim() || undefined,
      note: input.note?.trim() || undefined,
      password: input.password,
      status: "pending",
      submittedAt: now,
    };

    setData((prev) => ({
      ...prev,
      registrations: [request, ...(prev.registrations ?? [])],
      notifications: [
        {
          id: uid("n"),
          title: "Yeni kayıt talebi",
          body: `${block}-${no} dairesinden ${name} kayıt talebi gönderdi.`,
          type: "system",
          at: now,
          read: false,
          audience: "admin",
        },
        ...prev.notifications,
      ],
    }));

    return { ok: true };
  };

  const approveRegistration = (requestId: string, reviewNote?: string): Result => {
    if (!user || user.role !== "admin") {
      return { ok: false, error: "Kayıt onaylamak için yönetici girişi gerekli." };
    }
    const request = (data.registrations ?? []).find((item) => item.id === requestId);
    if (!request) return { ok: false, error: "Kayıt talebi bulunamadı." };
    if (request.status !== "pending") {
      return { ok: false, error: "Bu talep daha önce sonuçlandırılmış." };
    }
    if (
      data.users.some(
        (item) => normalizeEmail(item.email) === normalizeEmail(request.email)
      )
    ) {
      return { ok: false, error: "Bu e-posta ile kayıtlı bir hesap zaten var." };
    }

    const apartmentId = `${request.block}-${request.no}`;
    const existingApartment = data.apartments.find((item) => item.id === apartmentId);
    const colors = ["bg-blue-500", "bg-sky-500", "bg-indigo-500", "bg-teal-500"];
    const newUser: User = {
      id: uid("u"),
      name: request.name,
      role: "resident",
      email: request.email,
      password: request.password,
      phone: request.phone,
      apartmentId,
      title: request.occupancyType === "owner" ? "Malik" : "Kiracı",
      avatarColor: colors[data.users.length % colors.length],
    };
    const now = new Date().toISOString();

    setData((prev) => ({
      ...prev,
      apartments: existingApartment
        ? prev.apartments.map((item) =>
            item.id === apartmentId
              ? {
                  ...item,
                  ownerName: request.ownerName || item.ownerName,
                  residentCount: Math.max(item.residentCount, request.residentCount),
                }
              : item
          )
        : [
            ...prev.apartments,
            {
              id: apartmentId,
              block: request.block,
              no: request.no,
              ownerName: request.ownerName || request.name,
              residentCount: request.residentCount,
              balance: 0,
              rights: { total: 6, used: 0 },
            },
          ].sort((a, b) => a.id.localeCompare(b.id, "tr")),
      users: [...prev.users, newUser],
      registrations: (prev.registrations ?? []).map((item) =>
        item.id === requestId
          ? {
              ...item,
              status: "approved",
              reviewedAt: now,
              reviewNote: reviewNote?.trim() || undefined,
            }
          : item
      ),
      notifications: [
        {
          id: uid("n"),
          title: "Kaydınız onaylandı",
          body: "Apartman uygulamasına hoş geldiniz. Artık e-posta ve şifrenizle giriş yapabilirsiniz.",
          type: "system",
          at: now,
          read: false,
          audience: "resident",
          userId: newUser.id,
        },
        ...prev.notifications,
      ],
    }));

    return { ok: true };
  };

  const rejectRegistration = (requestId: string, reviewNote?: string): Result => {
    if (!user || user.role !== "admin") {
      return { ok: false, error: "Kayıt reddetmek için yönetici girişi gerekli." };
    }
    const request = (data.registrations ?? []).find((item) => item.id === requestId);
    if (!request) return { ok: false, error: "Kayıt talebi bulunamadı." };
    if (request.status !== "pending") {
      return { ok: false, error: "Bu talep daha önce sonuçlandırılmış." };
    }
    const now = new Date().toISOString();
    setData((prev) => ({
      ...prev,
      registrations: (prev.registrations ?? []).map((item) =>
        item.id === requestId
          ? {
              ...item,
              status: "rejected",
              reviewedAt: now,
              reviewNote: reviewNote?.trim() || undefined,
            }
          : item
      ),
    }));
    return { ok: true };
  };

  const updateProfile = (input: {
    name: string;
    email: string;
    phone: string;
  }): Result => {
    if (!user) return { ok: false, error: "Oturum bulunamadı." };
    const name = input.name.trim();
    const email = input.email.trim();
    const phone = input.phone.trim();

    if (name.length < 3) {
      return { ok: false, error: "Ad soyad en az 3 karakter olmalı." };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: "Geçerli bir e-posta adresi girin." };
    }
    if (
      data.users.some(
        (item) =>
          item.id !== user.id &&
          normalizeEmail(item.email) === normalizeEmail(email)
      )
    ) {
      return { ok: false, error: "Bu e-posta başka bir hesapta kullanılıyor." };
    }

    const updated: User = { ...user, name, email, phone };
    setData((prev) => ({
      ...prev,
      users: prev.users.map((item) => (item.id === user.id ? updated : item)),
    }));
    setUser(updated);
    return { ok: true };
  };

  const logout = () => setUser(null);

  const createTicket = (input: NewTicketInput): ActionResult => {
    if (!user) return { ok: false, error: "ArÄ±za kaydÄ± iÃ§in giriÅŸ gerekli." };
    const apartmentId =
      user.role === "admin" ? input.apartmentId : user.apartmentId;
    if (!apartmentId) {
      return { ok: false, error: "ArÄ±za kaydÄ± iÃ§in daire seÃ§melisiniz." };
    }
    if (!data.apartments.some((item) => item.id === apartmentId)) {
      return { ok: false, error: "Daire bulunamadÄ±." };
    }
    const resident = data.users.find(
      (item) => item.role === "resident" && item.apartmentId === apartmentId
    );
    const now = new Date().toISOString();
    const ticket: Ticket = {
      id: uid("t"),
      apartmentId,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      location: input.location?.trim() || undefined,
      priority: input.priority,
      status: "pending",
      photo: input.photo,
      createdAt: now,
      updatedAt: now,
      messages: [],
    };

    const notification: AppNotification =
      user.role === "admin"
        ? {
            id: uid("n"),
            title: "Yeni arÄ±za kaydÄ±",
            body: `${apartmentId} dairesi iÃ§in "${ticket.title}" kaydÄ± oluÅŸturuldu.`,
            type: "ticket",
            at: now,
            read: false,
            audience: "resident",
            userId: resident?.id,
          }
        : {
            id: uid("n"),
            title: "Yeni arÄ±za kaydÄ±",
            body: `${apartmentId} dairesinden "${ticket.title}" arÄ±zasÄ± bildirildi.`,
            type: "ticket",
            at: now,
            read: false,
            audience: "admin",
          };

    setData((prev) => {
      const apartment = prev.apartments.find((item) => item.id === apartmentId);
      const hasRight = apartment ? remainingRights(apartment) > 0 : false;
      return {
        ...prev,
        apartments: prev.apartments.map((item) =>
          item.id === apartmentId && hasRight
            ? { ...item, rights: { ...item.rights, used: item.rights.used + 1 } }
            : item
        ),
        tickets: [ticket, ...prev.tickets],
        notifications: [notification, ...prev.notifications],
      };
    });

    return { ok: true, id: ticket.id };
  };

  const addTicketMessage = (ticketId: string, text: string) => {
    if (!user) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();

    setData((prev) => {
      const ticket = prev.tickets.find((item) => item.id === ticketId);
      if (!ticket) return prev;
      const resident = prev.users.find(
        (item) => item.role === "resident" && item.apartmentId === ticket.apartmentId
      );
      return {
        ...prev,
        tickets: prev.tickets.map((item) =>
          item.id === ticketId
            ? {
                ...item,
                updatedAt: now,
                status:
                  user.role === "admin" && item.status === "pending"
                    ? "in_progress"
                    : item.status,
                messages: [
                  ...item.messages,
                  {
                    id: uid("tm"),
                    authorId: user.id,
                    authorName: user.name,
                    text: trimmed,
                    at: now,
                  },
                ],
              }
            : item
        ),
        notifications: [
          {
            id: uid("n"),
            title: "ArÄ±za kaydÄ±na yeni mesaj",
            body: `${ticket.title} kaydÄ±na yeni bir mesaj eklendi.`,
            type: "ticket",
            at: now,
            read: false,
            audience: user.role === "admin" ? "resident" : "admin",
            userId: user.role === "admin" ? resident?.id : undefined,
          },
          ...prev.notifications,
        ],
      };
    });
  };

  const updateTicketStatus = (
    ticketId: string,
    status: TicketStatus,
    assignedTo?: string
  ) => {
    if (!user || user.role !== "admin") return;
    const now = new Date().toISOString();

    setData((prev) => {
      const ticket = prev.tickets.find((item) => item.id === ticketId);
      if (!ticket) return prev;
      const resident = prev.users.find(
        (item) => item.role === "resident" && item.apartmentId === ticket.apartmentId
      );
      const labels: Record<TicketStatus, string> = {
        pending: "Beklemede",
        in_progress: "Ä°ÅŸleme AlÄ±ndÄ±",
        resolved: "Ã‡Ã¶zÃ¼ldÃ¼",
      };
      return {
        ...prev,
        tickets: prev.tickets.map((item) =>
          item.id === ticketId
            ? {
                ...item,
                status,
                assignedTo: assignedTo ?? item.assignedTo,
                updatedAt: now,
              }
            : item
        ),
        notifications: [
          {
            id: uid("n"),
            title: "ArÄ±za durumu gÃ¼ncellendi",
            body: `"${ticket.title}" kaydÄ±nÄ±z "${labels[status]}" olarak gÃ¼ncellendi.`,
            type: "ticket",
            at: now,
            read: false,
            audience: "resident",
            userId: resident?.id,
          },
          ...prev.notifications,
        ],
      };
    });
  };

  const payPayment = (paymentId: string) => {
    const now = new Date().toISOString();
    setData((prev) => {
      const payment = prev.payments.find((item) => item.id === paymentId);
      if (!payment) return prev;
      return {
        ...prev,
        payments: prev.payments.map((item) =>
          item.id === paymentId
            ? {
                ...item,
                status: "paid",
                paidAt: now,
                method: "Kredi KartÄ±",
              }
            : item
        ),
        apartments: prev.apartments.map((apartment) =>
          apartment.id === payment.apartmentId
            ? { ...apartment, balance: Math.min(0, apartment.balance + payment.amount) }
            : apartment
        ),
        notifications: [
          {
            id: uid("n"),
            title: "Ã–demeniz alÄ±ndÄ±",
            body: `${payment.period} aidat Ã¶demeniz baÅŸarÄ±yla tamamlandÄ±.`,
            type: "payment",
            at: now,
            read: false,
            audience: "resident",
            userId: user?.id,
          },
          {
            id: uid("n"),
            title: "Ã–deme alÄ±ndÄ±",
            body: `${payment.apartmentId} dairesi ${payment.period} aidatÄ±nÄ± Ã¶dedi.`,
            type: "payment",
            at: now,
            read: false,
            audience: "admin",
          },
          ...prev.notifications,
        ],
      };
    });
  };

  const addPayment = (input: {
    apartmentId: string;
    period: string;
    amount: number;
    dueDate: string;
  }): Result => {
    if (!user || user.role !== "admin") {
      return { ok: false, error: "BorÃ§landÄ±rma iÃ§in yÃ¶netici giriÅŸi gerekli." };
    }
    const apartment = data.apartments.find((item) => item.id === input.apartmentId);
    if (!apartment) return { ok: false, error: "Daire bulunamadÄ±." };
    if (!input.period.trim()) return { ok: false, error: "DÃ¶nem bilgisi zorunlu." };
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      return { ok: false, error: "Tutar 0'dan bÃ¼yÃ¼k olmalÄ±dÄ±r." };
    }
    if (!input.dueDate) return { ok: false, error: "Son Ã¶deme tarihi zorunlu." };

    const now = new Date().toISOString();
    const payment: Payment = {
      id: uid("pay"),
      apartmentId: apartment.id,
      period: input.period.trim(),
      amount: input.amount,
      dueDate: new Date(input.dueDate).toISOString(),
      status: "pending",
      invoiceNo: `AID-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    const resident = data.users.find(
      (entry) => entry.role === "resident" && entry.apartmentId === apartment.id
    );

    setData((prev) => ({
      ...prev,
      payments: [payment, ...prev.payments],
      apartments: prev.apartments.map((item) =>
        item.id === apartment.id
          ? { ...item, balance: item.balance - payment.amount }
          : item
      ),
      notifications: [
        {
          id: uid("n"),
          title: "Yeni aidat borcu",
          body: `${apartment.id} dairesine ${payment.period} iÃ§in ${payment.amount} TL borÃ§ tanÄ±mlandÄ±.`,
          type: "payment",
          at: now,
          read: false,
          audience: "resident",
          userId: resident?.id,
        },
        ...prev.notifications,
      ],
    }));

    return { ok: true };
  };

  const markNotificationRead = (notificationId: string) => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item
      ),
    }));
  };

  const markAllNotificationsRead = () => {
    if (!user) return;
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) =>
        item.audience === "all" ||
        item.audience === user.role ||
        item.userId === user.id
          ? { ...item, read: true }
          : item
      ),
    }));
  };

  const transferRights = (input: {
    toApartmentId: string;
    count: number;
    note: string;
  }): Result => {
    if (!user || user.role !== "resident" || !user.apartmentId) {
      return { ok: false, error: "Hak devri iÃ§in sakin giriÅŸi gerekli." };
    }
    const from = data.apartments.find((item) => item.id === user.apartmentId);
    if (!from) return { ok: false, error: "Daire bulunamadÄ±." };
    if (input.toApartmentId === from.id) {
      return { ok: false, error: "HaklarÄ±nÄ±zÄ± kendi dairenize devredemezsiniz." };
    }
    const to = data.apartments.find((item) => item.id === input.toApartmentId);
    if (!to) return { ok: false, error: "Hedef daire bulunamadÄ±." };
    if (input.count < 1) return { ok: false, error: "En az 1 hak devredilmelidir." };
    if (remainingRights(from) < input.count) {
      return { ok: false, error: "Yeterli kullanÄ±labilir hakkÄ±nÄ±z yok." };
    }

    const now = new Date().toISOString();
    const targetUser = data.users.find(
      (item) => item.role === "resident" && item.apartmentId === to.id
    );

    setData((prev) => ({
      ...prev,
      apartments: prev.apartments.map((apartment) => {
        if (apartment.id === from.id) {
          return {
            ...apartment,
            rights: { ...apartment.rights, used: apartment.rights.used + input.count },
          };
        }
        if (apartment.id === to.id) {
          return {
            ...apartment,
            rights: {
              ...apartment.rights,
              total: apartment.rights.total + input.count,
            },
          };
        }
        return apartment;
      }),
      transfers: [
        {
          id: uid("tr"),
          fromApartmentId: from.id,
          toApartmentId: to.id,
          count: input.count,
          note: input.note.trim(),
          createdAt: now,
        },
        ...prev.transfers,
      ],
      notifications: [
        {
          id: uid("n"),
          title: "ArÄ±za hakkÄ± devri",
          body: `${from.id} dairesi size ${input.count} adet arÄ±za hakkÄ± devretti.`,
          type: "system",
          at: now,
          read: false,
          audience: "resident",
          userId: targetUser?.id,
        },
        ...prev.notifications,
      ],
    }));

    return { ok: true };
  };

  const addPackage = (input: {
    apartmentId: string;
    courier: string;
    description: string;
  }): ActionResult => {
    if (!user || user.role !== "admin") {
      return { ok: false, error: "Kargo giriÅŸi iÃ§in yÃ¶netici giriÅŸi gerekli." };
    }
    const apartment = data.apartments.find((item) => item.id === input.apartmentId);
    if (!apartment) return { ok: false, error: "Daire bulunamadÄ±." };
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const now = new Date().toISOString();
    const item: PackageItem = {
      id: uid("pk"),
      apartmentId: apartment.id,
      courier: input.courier.trim(),
      code,
      status: "security",
      receivedAt: now,
      description: input.description.trim() || "Kargo",
      receivedBy: user.name,
    };
    const resident = data.users.find(
      (entry) => entry.role === "resident" && entry.apartmentId === apartment.id
    );

    setData((prev) => ({
      ...prev,
      packages: [item, ...prev.packages],
      notifications: [
        {
          id: uid("n"),
          title: "Kargonuz gÃ¼venlikte",
          body: `${item.courier} paketiniz gÃ¼venliÄŸe teslim edildi. Teslim kodu: ${code}`,
          type: "package",
          at: now,
          read: false,
          audience: "resident",
          userId: resident?.id,
        },
        ...prev.notifications,
      ],
    }));

    return { ok: true, id: item.id };
  };

  const deliverPackage = (packageId: string, code: string): Result => {
    const item = data.packages.find((entry) => entry.id === packageId);
    if (!item) return { ok: false, error: "Kargo kaydÄ± bulunamadÄ±." };
    if (item.status === "delivered") {
      return { ok: false, error: "Bu kargo zaten teslim edilmiÅŸ." };
    }
    if (code.trim() !== item.code) {
      return { ok: false, error: "Teslim kodu hatalÄ±. GÃ¼venlikten aldÄ±ÄŸÄ±nÄ±z kodu girin." };
    }

    const now = new Date().toISOString();
    const resident = data.users.find(
      (entry) => entry.role === "resident" && entry.apartmentId === item.apartmentId
    );

    setData((prev) => ({
      ...prev,
      packages: prev.packages.map((entry) =>
        entry.id === packageId
          ? { ...entry, status: "delivered", deliveredAt: now }
          : entry
      ),
      notifications: [
        {
          id: uid("n"),
          title: "Kargo teslim edildi",
          body: `${item.courier} paketi teslim alÄ±ndÄ± olarak iÅŸaretlendi.`,
          type: "package",
          at: now,
          read: false,
          audience: "resident",
          userId: resident?.id,
        },
        ...prev.notifications,
      ],
    }));

    return { ok: true };
  };

  const vote = (pollId: string, optionId: string) => {
    if (!user) return;
    setData((prev) => {
      const poll = prev.polls.find((item) => item.id === pollId);
      if (!poll || poll.voters[user.id]) return prev;
      return {
        ...prev,
        polls: prev.polls.map((item) =>
          item.id === pollId
            ? {
                ...item,
                options: item.options.map((option) =>
                  option.id === optionId
                    ? { ...option, votes: option.votes + 1 }
                    : option
                ),
                voters: { ...item.voters, [user.id]: optionId },
              }
            : item
        ),
      };
    });
  };

  const createPoll = (input: {
    question: string;
    description: string;
    options: string[];
    endsAt: string;
  }) => {
    if (!user || user.role !== "admin") return;
    const now = new Date().toISOString();
    const poll: Poll = {
      id: uid("p"),
      question: input.question.trim(),
      description: input.description.trim(),
      options: input.options
        .map((label) => label.trim())
        .filter(Boolean)
        .map((label) => ({ id: uid("po"), label, votes: 0 })),
      createdAt: now,
      endsAt: input.endsAt,
      voters: {},
    };

    setData((prev) => ({
      ...prev,
      polls: [poll, ...prev.polls],
      notifications: [
        {
          id: uid("n"),
          title: "Yeni anket aÃ§Ä±ldÄ±",
          body: poll.question,
          type: "poll",
          at: now,
          read: false,
          audience: "all",
        },
        ...prev.notifications,
      ],
    }));
  };

  const createAnnouncement = (input: {
    title: string;
    body: string;
    category: AnnouncementCategory;
    important: boolean;
    blocks: string[];
  }) => {
    if (!user || user.role !== "admin") return;
    const now = new Date().toISOString();

    setData((prev) => ({
      ...prev,
      announcements: [
        {
          id: uid("a"),
          title: input.title.trim(),
          body: input.body.trim(),
          category: input.category,
          createdAt: now,
          important: input.important,
          blocks: input.blocks,
        },
        ...prev.announcements,
      ],
      notifications: [
        {
          id: uid("n"),
          title: "Yeni duyuru",
          body: input.title.trim(),
          type: "announcement",
          at: now,
          read: false,
          audience: "all",
        },
        ...prev.notifications,
      ],
    }));
  };

  const sendPaymentReminder = (apartmentId: string) => {
    if (!user || user.role !== "admin") return;
    const resident = data.users.find(
      (entry) => entry.role === "resident" && entry.apartmentId === apartmentId
    );
    const now = new Date().toISOString();
    setData((prev) => ({
      ...prev,
      notifications: [
        {
          id: uid("n"),
          title: "Aidat hatÄ±rlatmasÄ±",
          body: `${apartmentId} dairesi iÃ§in gecikmiÅŸ aidat hatÄ±rlatmasÄ± gÃ¶nderildi.`,
          type: "payment",
          at: now,
          read: false,
          audience: "resident",
          userId: resident?.id,
        },
        {
          id: uid("n"),
          title: "HatÄ±rlatma gÃ¶nderildi",
          body: `${apartmentId} dairesine aidat hatÄ±rlatmasÄ± iletildi.`,
          type: "payment",
          at: now,
          read: false,
          audience: "admin",
        },
        ...prev.notifications,
      ],
    }));
  };

  const rsvp = (meetingId: string, status: AttendanceStatus) => {
    if (!user) return;
    setData((prev) => ({
      ...prev,
      meetings: prev.meetings.map((item) =>
        item.id === meetingId
          ? { ...item, attendance: { ...item.attendance, [user.id]: status } }
          : item
      ),
    }));
  };

  const createMeeting = (input: {
    title: string;
    date: string;
    location: string;
    agenda: string[];
  }) => {
    if (!user || user.role !== "admin") return;
    const meeting: Meeting = {
      id: uid("m"),
      title: input.title.trim(),
      date: input.date,
      location: input.location.trim(),
      agenda: input.agenda.map((item) => item.trim()).filter(Boolean),
      attendance: {},
    };
    const now = new Date().toISOString();

    setData((prev) => ({
      ...prev,
      meetings: [meeting, ...prev.meetings].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
      notifications: [
        {
          id: uid("n"),
          title: "ToplantÄ± daveti",
          body: meeting.title,
          type: "meeting",
          at: now,
          read: false,
          audience: "all",
        },
        ...prev.notifications,
      ],
    }));
  };

  const addCalendarEvent = (input: NewCalendarEventInput): ActionResult => {
    if (!user || user.role !== "admin") {
      return { ok: false, error: "Etkinlik eklemek iÃ§in yÃ¶netici giriÅŸi gerekli." };
    }
    const title = input.title.trim();
    if (title.length < 3) {
      return { ok: false, error: "Etkinlik baÅŸlÄ±ÄŸÄ± en az 3 karakter olmalÄ±." };
    }
    if (!input.start || Number.isNaN(new Date(input.start).getTime())) {
      return { ok: false, error: "GeÃ§erli bir tarih seÃ§in." };
    }

    const now = new Date().toISOString();
    const event: BuildingEvent = {
      id: uid("ce"),
      title,
      start: input.start,
      end: input.end,
      type: input.type,
      location: input.location?.trim() || undefined,
      description: input.description?.trim() || undefined,
      createdAt: now,
    };

    setData((prev) => ({
      ...prev,
      calendarEvents: [...(prev.calendarEvents ?? []), event].sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      ),
      notifications: [
        {
          id: uid("n"),
          title: "Takvime yeni etkinlik eklendi",
          body: `${event.title} · ${new Date(event.start).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
          })}`,
          type: "system",
          at: now,
          read: false,
          audience: "all",
        },
        ...prev.notifications,
      ],
    }));

    return { ok: true, id: event.id };
  };

  const removeCalendarEvent = (eventId: string) => {
    if (!user || user.role !== "admin") return;
    setData((prev) => ({
      ...prev,
      calendarEvents: (prev.calendarEvents ?? []).filter((event) => event.id !== eventId),
    }));
  };

  const createApartment = (input: {
    block: string;
    no: string;
    ownerName: string;
    residentCount: number;
    totalRights: number;
  }): Result => {
    if (!user || user.role !== "admin") {
      return { ok: false, error: "Daire eklemek iÃ§in yÃ¶netici giriÅŸi gerekli." };
    }
    const block = input.block.trim().toLocaleUpperCase("tr-TR");
    const no = input.no.trim();
    const id = `${block}-${no}`;
    if (!block || !no) return { ok: false, error: "Blok ve daire numarasÄ± zorunlu." };
    if (data.apartments.some((item) => item.id === id)) {
      return { ok: false, error: `${id} dairesi zaten kayÄ±tlÄ±.` };
    }

    setData((prev) => ({
      ...prev,
      apartments: [
        ...prev.apartments,
        {
          id,
          block,
          no,
          ownerName: input.ownerName.trim() || "Belirtilmedi",
          residentCount: Math.max(1, input.residentCount),
          balance: 0,
          rights: { total: Math.max(1, input.totalRights), used: 0 },
        },
      ].sort((a, b) => a.id.localeCompare(b.id, "tr")),
    }));

    return { ok: true };
  };

  const addResident = (input: {
    name: string;
    email: string;
    phone: string;
    apartmentId: string;
  }): Result => {
    if (!user || user.role !== "admin") {
      return { ok: false, error: "Sakin eklemek iÃ§in yÃ¶netici giriÅŸi gerekli." };
    }
    const apartment = data.apartments.find((item) => item.id === input.apartmentId);
    if (!apartment) return { ok: false, error: "Daire bulunamadÄ±." };
    if (
      data.users.some(
        (item) => normalizeEmail(item.email) === normalizeEmail(input.email)
      )
    ) {
      return { ok: false, error: "Bu e-posta ile kayÄ±tlÄ± bir kullanÄ±cÄ± var." };
    }

    const colors = ["bg-blue-500", "bg-sky-500", "bg-indigo-500", "bg-teal-500"];
    const newUser: User = {
      id: uid("u"),
      name: input.name.trim(),
      role: "resident",
      email: input.email.trim(),
      password: "1234",
      phone: input.phone.trim(),
      apartmentId: apartment.id,
      avatarColor: colors[data.users.length % colors.length],
    };

    setData((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
      apartments: prev.apartments.map((item) =>
        item.id === apartment.id
          ? { ...item, residentCount: item.residentCount + 1 }
          : item
      ),
    }));

    return { ok: true };
  };

  const updateRights = (apartmentId: string, total: number) => {
    if (!user || user.role !== "admin") return;
    setData((prev) => ({
      ...prev,
      apartments: prev.apartments.map((apartment) =>
        apartment.id === apartmentId
          ? {
              ...apartment,
              rights: {
                total: Math.max(apartment.rights.used, total),
                used: apartment.rights.used,
              },
            }
          : apartment
      ),
    }));
  };

  const resetDemo = () => {
    setData(createSeedData());
    setUser(null);
    try {
      window.localStorage.removeItem(DATA_KEY);
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <StoreContext.Provider
      value={{
        data,
        user,
        hydrated,
        login,
        registerResident,
        approveRegistration,
        rejectRegistration,
        updateProfile,
        logout,
        createTicket,
        addTicketMessage,
        updateTicketStatus,
        payPayment,
        addPayment,
        markNotificationRead,
        markAllNotificationsRead,
        transferRights,
        addPackage,
        deliverPackage,
        vote,
        createPoll,
        createAnnouncement,
        sendPaymentReminder,
        rsvp,
        createMeeting,
        addCalendarEvent,
        removeCalendarEvent,
        createApartment,
        addResident,
        updateRights,
        resetDemo,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context;
}
