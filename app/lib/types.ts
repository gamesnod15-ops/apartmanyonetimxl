export type Role = "resident" | "admin";

export type TicketStatus = "pending" | "in_progress" | "resolved";
export type Priority = "low" | "medium" | "high";
export type PaymentStatus = "paid" | "pending" | "overdue";
export type PackageStatus = "security" | "delivered";
export type AttendanceStatus = "yes" | "no" | "proxy";
export type NotificationType =
  | "ticket"
  | "payment"
  | "package"
  | "announcement"
  | "meeting"
  | "poll"
  | "system";
export type AnnouncementCategory =
  | "genel"
  | "bakim"
  | "toplanti"
  | "finans"
  | "guvenlik";

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  password: string;
  phone: string;
  apartmentId?: string;
  title?: string;
  avatarColor: string;
}

export interface Apartment {
  id: string;
  block: string;
  no: string;
  ownerName: string;
  residentCount: number;
  balance: number;
  rights: { total: number; used: number };
}

export interface TicketMessage {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  at: string;
}

export interface Ticket {
  id: string;
  apartmentId: string;
  title: string;
  description: string;
  category: string;
  location?: string;
  priority: Priority;
  status: TicketStatus;
  photo?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  messages: TicketMessage[];
}

export interface Payment {
  id: string;
  apartmentId: string;
  period: string;
  amount: number;
  dueDate: string;
  paidAt?: string;
  status: PaymentStatus;
  method?: string;
  invoiceNo: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  createdAt: string;
  important: boolean;
  blocks: string[];
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  description: string;
  options: PollOption[];
  createdAt: string;
  endsAt: string;
  voters: Record<string, string>;
}

export interface PackageItem {
  id: string;
  apartmentId: string;
  courier: string;
  code: string;
  status: PackageStatus;
  receivedAt: string;
  deliveredAt?: string;
  description: string;
  receivedBy: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  location: string;
  agenda: string[];
  attendance: Record<string, AttendanceStatus>;
}

export type BuildingEventType =
  | "maintenance"
  | "cleaning"
  | "inspection"
  | "social"
  | "other";

export interface BuildingEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  type: BuildingEventType;
  location?: string;
  description?: string;
  createdAt: string;
}

export type RegistrationStatus = "pending" | "approved" | "rejected";
export type OccupancyType = "owner" | "tenant";

export interface RegistrationRequest {
  id: string;
  block: string;
  no: string;
  ownerName: string;
  residentCount: number;
  occupancyType: OccupancyType;
  name: string;
  email: string;
  phone: string;
  vehiclePlate?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  note?: string;
  password: string;
  status: RegistrationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  at: string;
  read: boolean;
  audience: "all" | "admin" | "resident";
  userId?: string;
}

export interface Transfer {
  id: string;
  fromApartmentId: string;
  toApartmentId: string;
  count: number;
  note: string;
  createdAt: string;
}

export interface AppData {
  apartments: Apartment[];
  users: User[];
  tickets: Ticket[];
  payments: Payment[];
  announcements: Announcement[];
  polls: Poll[];
  packages: PackageItem[];
  meetings: Meeting[];
  calendarEvents: BuildingEvent[];
  registrations: RegistrationRequest[];
  notifications: AppNotification[];
  transfers: Transfer[];
}

export interface NewCalendarEventInput {
  title: string;
  start: string;
  end?: string;
  type: BuildingEventType;
  location?: string;
  description?: string;
}

export interface NewTicketInput {
  apartmentId?: string;
  title: string;
  description: string;
  category: string;
  location?: string;
  priority: Priority;
  photo?: string;
}
