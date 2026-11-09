import {
  Bath,
  BedDouble,
  DoorOpen,
  Droplets,
  Flame,
  Sofa,
  Thermometer,
  Utensils,
  Wifi,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface ServiceOption {
  key: string;
  label: string;
  category: string;
  icon: LucideIcon;
}

export const SERVICES: ServiceOption[] = [
  { key: "elektrik", label: "Elektrik", category: "Elektrik", icon: Zap },
  { key: "su", label: "Su", category: "Su", icon: Droplets },
  { key: "dogalgaz", label: "Doğalgaz", category: "Isıtma", icon: Flame },
  { key: "internet", label: "İnternet", category: "Diğer", icon: Wifi },
  { key: "tesisat", label: "Tesisat", category: "Tesisat", icon: Wrench },
  { key: "isitma", label: "Isıtma", category: "Isıtma", icon: Thermometer },
];

export interface RoomOption {
  key: string;
  label: string;
  icon: LucideIcon;
  span: string;
}

export const ROOMS: RoomOption[] = [
  { key: "salon", label: "Salon", icon: Sofa, span: "col-span-2 row-span-2" },
  { key: "mutfak", label: "Mutfak", icon: Utensils, span: "col-span-2" },
  { key: "banyo", label: "Banyo", icon: Bath, span: "col-span-1" },
  { key: "koridor", label: "Koridor", icon: DoorOpen, span: "col-span-1" },
  { key: "yatak", label: "Yatak Odası", icon: BedDouble, span: "col-span-2" },
  { key: "balkon", label: "Balkon", icon: Wind, span: "col-span-2" },
];

export function floorOf(no: string) {
  const parsed = Number.parseInt(no, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.max(1, Math.ceil(parsed / 4));
}
