import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = {
  title: "Bağlantı Yok",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-slate-100 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
        <WifiOff className="h-9 w-9" />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-slate-900">Bağlantı yok</h1>
        <p className="max-w-xs text-[16px] leading-6 text-slate-500">
          İnternet bağlantın kesildi. Bağlantı sağlandığında uygulama kaldığın
          yerden devam eder.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-xl bg-blue-600 px-5 py-3 text-[16px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        Tekrar Dene
      </Link>
    </main>
  );
}
