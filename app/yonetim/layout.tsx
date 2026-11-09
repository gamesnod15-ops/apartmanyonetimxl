import { AppShell } from "@/app/components/app-shell";

export const instant = false;

export default function YonetimLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="admin">{children}</AppShell>;
}
