"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";
import { cn } from "@/app/components/ui";

type PromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true
  );
}

export function InstallButton({ tone = "blue" }: { tone?: "blue" | "red" }) {
  const [promptEvent, setPromptEvent] = useState<PromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    const sync = () => {
      setInstalled(isStandalone());
      setPromptEvent(window.__deferredInstallPrompt ?? null);
    };

    sync();
    window.addEventListener("apartman:installable", sync);
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("apartman:installable", sync);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
        <Smartphone className="h-4 w-4" />
        Uygulama ana ekranınıza eklendi
      </div>
    );
  }

  const accent =
    tone === "red"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-blue-600 hover:bg-blue-700";

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={async () => {
          if (!promptEvent) {
            setHint((value) => !value);
            return;
          }
          await promptEvent.prompt();
          const choice = await promptEvent.userChoice;
          if (choice.outcome === "accepted") setInstalled(true);
          window.__deferredInstallPrompt = undefined;
          setPromptEvent(null);
        }}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition",
          accent
        )}
      >
        <Download className="h-4 w-4" />
        Ana Ekrana Ekle
      </button>
      {hint ? (
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500 ring-1 ring-slate-200">
          iPhone / iPad: Safari&apos;de <strong>Paylaş</strong> → <strong>Ana Ekrana Ekle</strong>.
          Android: tarayıcı menüsünden <strong>Uygulamayı yükle</strong>.
        </p>
      ) : null}
    </div>
  );
}
