import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/app/lib/store";
import { PWARegister } from "@/app/components/pwa-register";
import { AutoInstallPrompt } from "@/app/components/auto-install-prompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Apartman Yönetim",
    template: "%s · Apartman Yönetim",
  },
  description:
    "Apartman ve site yönetimi: aidat takibi, arıza kayıtları, kargo, ziyaretçi ve toplantı yönetimi tek uygulamada.",
  applicationName: "Apartman Yönetim",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Apartman Yönetim",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh text-slate-900">
        <StoreProvider>
          <PWARegister />
          <AutoInstallPrompt />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
