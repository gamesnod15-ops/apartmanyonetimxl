"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Share, Smartphone, X } from "lucide-react";

type PromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "apartmanyonetim:install-dismissed";

function isStandalone() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true
  );
}

function isIOS() {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function AutoInstallPrompt() {
  const [open, setOpen] = useState(false);
  const [promptEvent, setPromptEvent] = useState<PromptEvent | null>(null);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isStandalone()) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const schedule = (event: PromptEvent | null) => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setPromptEvent(event);
        setShowHint(!event);
        setOpen(true);
      }, 900);
    };

    if (window.__deferredInstallPrompt) {
      schedule(window.__deferredInstallPrompt);
    } else if (isIOS()) {
      schedule(null);
    }

    const onInstallable = () => {
      if (window.__deferredInstallPrompt) schedule(window.__deferredInstallPrompt);
    };
    const onInstalled = () => {
      setOpen(false);
      setPromptEvent(null);
      sessionStorage.setItem(DISMISS_KEY, "installed");
    };

    window.addEventListener("apartman:installable", onInstallable);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      window.removeEventListener("apartman:installable", onInstallable);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!open) return null;

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  };

  const install = async () => {
    if (!promptEvent) {
      setShowHint(true);
      return;
    }
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      window.__deferredInstallPrompt = undefined;
      setPromptEvent(null);
      if (choice.outcome === "accepted") {
        setOpen(false);
      } else {
        dismiss();
      }
    } catch {
      setShowHint(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:items-center sm:pb-3">
      <button
        type="button"
        aria-label="Kapat"
        onClick={dismiss}
        className="absolute inset-0 cursor-default bg-slate-950/35 backdrop-blur-[10px]"
      />
      <div className="relative w-full max-w-sm overflow-hidden rounded-[28px] bg-white p-5 shadow-2xl animate-slide-up">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Kapat"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>

        <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-blue-600 text-white shadow-lg shadow-slate-900/15">
          <Smartphone className="h-6 w-6" />
        </span>

        <h2 className="mt-4 text-base font-bold text-slate-900">
          Ana ekrana ekle
        </h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Apartman Yönetim&apos;i telefonunuza uygulama gibi ekleyin; daha hızlı
          açılır ve bildirimleri kaçırmazsınız.
        </p>

        {showHint || !promptEvent ? (
          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-slate-900/[0.04] p-3 text-[11px] leading-5 text-slate-600">
            <Share className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <span>
              iPhone / iPad: Safari&apos;de <strong>Paylaş</strong> simgesine
              dokunup <strong>Ana Ekrana Ekle</strong>&apos;yi seçin. Android:
              tarayıcı menüsünden <strong>Uygulamayı yükle</strong>&apos;yi seçin.
            </span>
          </div>
        ) : null}

        <div className="mt-5 space-y-2">
          {promptEvent ? (
            <button
              type="button"
              onClick={install}
              className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-blue-600 px-4 py-3.5 text-[15px] font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99]"
            >
              <Download className="h-4 w-4" />
              Ana ekrana ekle
            </button>
          ) : (
            <button
              type="button"
              onClick={dismiss}
              className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-blue-600 px-4 py-3.5 text-[15px] font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99]"
            >
              Anladım
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            className="w-full rounded-[14px] px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-500/10"
          >
            Şimdi değil
          </button>
        </div>
      </div>
    </div>
  );
}
