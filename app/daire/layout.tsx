import { AppShell } from "@/app/components/app-shell";

export const instant = false;

export default function DaireLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="resident">{children}</AppShell>;
}
