import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Apartman Yönetim",
    short_name: "Apartman",
    description:
      "Aidat takibi, arıza kayıtları, kargo ve toplantı yönetimi tek uygulamada.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f1f5f9",
    theme_color: "#1d4ed8",
    lang: "tr",
    dir: "ltr",
    categories: ["productivity", "utilities"],
    icons: [
      {
        src: "/icons/icon-96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Arıza Kayıtları",
        short_name: "Arızalar",
        url: "/daire/arizalar",
        icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }],
      },
      {
        name: "Ödemeler",
        short_name: "Ödemeler",
        url: "/daire/odemeler",
        icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }],
      },
    ],
  };
}
