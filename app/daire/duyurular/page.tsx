"use client";

import { useState } from "react";
import { ChevronDown, Megaphone } from "lucide-react";
import { useStore } from "@/app/lib/store";
import { Badge, Card, EmptyState, Segmented, cn } from "@/app/components/ui";
import {
  announcementCategoryMeta,
  formatDateTime,
  relativeTime,
} from "@/app/lib/selectors";
import type { AnnouncementCategory } from "@/app/lib/types";

type Filter = "all" | AnnouncementCategory;

export default function DaireAnnouncementsPage() {
  const { data } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const announcements = [...data.announcements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const filtered = announcements.filter((announcement) =>
    filter === "all" ? true : announcement.category === filter
  );

  const filters: Array<{ value: Filter; label: string; count: number }> = [
    { value: "all", label: "Tümü", count: announcements.length },
    ...(
      [
        ["bakim", "Bakım"],
        ["toplanti", "Toplantı"],
        ["finans", "Finans"],
        ["guvenlik", "Güvenlik"],
        ["genel", "Genel"],
      ] as Array<[AnnouncementCategory, string]>
    ).map(([value, label]) => ({
      value,
      label,
      count: announcements.filter((announcement) => announcement.category === value)
        .length,
    })),
  ];

  return (
    <div className="space-y-4">
      <section className="hero-soft p-6">
        <p className="text-xs font-medium text-violet-100">Yönetimden</p>
        <h1 className="mt-1 text-xl font-bold">Duyurular</h1>
        <p className="mt-1 text-[11px] text-violet-100">
          Apartman ve site ile ilgili tüm güncel bilgilendirmeler.
        </p>
      </section>

      <Segmented options={filters} value={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-5 w-5" />}
          title="Duyuru bulunamadı"
          description="Bu kategoride yayınlanmış duyuru yok."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((announcement) => {
            const meta = announcementCategoryMeta[announcement.category];
            const open = expanded === announcement.id;
            return (
              <Card key={announcement.id} className="p-4">
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : announcement.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <Megaphone className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge className={meta.className}>{meta.label}</Badge>
                          {announcement.important ? (
                            <Badge className="bg-red-50 text-red-600 ring-red-200">
                              Önemli
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-1.5 text-sm font-semibold text-slate-800">
                          {announcement.title}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {formatDateTime(announcement.createdAt)} ·{" "}
                          {announcement.blocks.join(", ")} Blok
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-slate-400 transition",
                        open && "rotate-180"
                      )}
                    />
                  </div>
                  <p
                    className={cn(
                      "mt-2 pl-13 text-[11px] leading-5 text-slate-500",
                      !open && "line-clamp-2"
                    )}
                  >
                    {announcement.body}
                  </p>
                  {!open ? (
                    <p className="mt-1 pl-13 text-[10px] font-medium text-violet-600">
                      Devamını oku · {relativeTime(announcement.createdAt)}
                    </p>
                  ) : null}
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
