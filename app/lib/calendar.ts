import { currency, paymentStatusMeta } from "./selectors";
import type { AppData, BuildingEventType, User } from "./types";

export type CalendarEventKind = "meeting" | "payment" | "poll" | "building";

export interface CalendarEventItem {
  id: string;
  refId?: string;
  kind: CalendarEventKind;
  title: string;
  start: string;
  end?: string;
  location?: string;
  detail?: string;
  tone?: "paid" | "unpaid";
  buildingType?: BuildingEventType;
}

export function toDateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function buildCalendarEvents(data: AppData, user: User): CalendarEventItem[] {
  const events: CalendarEventItem[] = [];

  data.meetings.forEach((meeting) => {
    events.push({
      id: `meeting-${meeting.id}`,
      kind: "meeting",
      title: meeting.title,
      start: meeting.date,
      location: meeting.location,
      detail: meeting.agenda.slice(0, 2).join(" · "),
    });
  });

  data.polls.forEach((poll) => {
    events.push({
      id: `poll-${poll.id}`,
      kind: "poll",
      title: `Anket bitişi · ${poll.question}`,
      start: poll.endsAt,
      detail: "Oylama bu tarihte sona eriyor.",
    });
  });

  if (user.role === "admin") {
    const groups = new Map<
      string,
      { period: string; dueDate: string; count: number; paid: number; total: number }
    >();

    data.payments.forEach((payment) => {
      const key = `${toDateKey(payment.dueDate)}|${payment.period}`;
      const group =
        groups.get(key) ?? {
          period: payment.period,
          dueDate: payment.dueDate,
          count: 0,
          paid: 0,
          total: 0,
        };
      group.count += 1;
      group.total += payment.amount;
      if (payment.status === "paid") group.paid += 1;
      groups.set(key, group);
    });

    groups.forEach((group, key) => {
      const allPaid = group.paid === group.count;
      events.push({
        id: `payment-${key}`,
        kind: "payment",
        title: `Aidat son ödeme · ${group.period}`,
        start: group.dueDate,
        detail: `${group.count} daire · ${currency(group.total)} · ${group.paid}/${group.count} ödendi`,
        tone: allPaid ? "paid" : "unpaid",
      });
    });
  } else {
    data.payments
      .filter((payment) => payment.apartmentId === user.apartmentId)
      .forEach((payment) => {
        events.push({
          id: `payment-${payment.id}`,
          kind: "payment",
          title: `Aidat · ${payment.period}`,
          start: payment.dueDate,
          detail: `${currency(payment.amount)} · ${paymentStatusMeta[payment.status].label}`,
          tone: payment.status === "paid" ? "paid" : "unpaid",
        });
      });
  }

  (data.calendarEvents ?? []).forEach((event) => {
    events.push({
      id: `building-${event.id}`,
      refId: event.id,
      kind: "building",
      title: event.title,
      start: event.start,
      end: event.end,
      location: event.location,
      detail: event.description,
      buildingType: event.type,
    });
  });

  return events.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );
}

export function eventsOnDay(events: CalendarEventItem[], date: Date) {
  const key = toDateKey(date);
  return events.filter((event) => toDateKey(event.start) === key);
}
