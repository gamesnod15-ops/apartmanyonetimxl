"use client";

import { useEffect } from "react";

type PromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __deferredInstallPrompt?: PromptEvent;
  }
}

export function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      window.__deferredInstallPrompt = event as PromptEvent;
      window.dispatchEvent(new Event("apartman:installable"));
    };

    window.addEventListener("beforeinstallprompt", onPrompt);

    return () => {
      window.removeEventListener("load", register);
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  return null;
}
