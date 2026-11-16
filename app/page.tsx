"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { useStore } from "@/app/lib/store";

export default function Home() {
  const { user, hydrated } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    router.replace(user.role === "admin" ? "/yonetim" : "/daire");
  }, [hydrated, user, router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-100">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-slate-900/15">
        <Building2 className="h-6 w-6" />
      </span>
      <p className="text-[16px] font-medium text-slate-500">Apartman Yönetim yükleniyor…</p>
    </div>
  );
}
