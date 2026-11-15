"use client";

import { useState } from "react";
import { AlertTriangle, Megaphone, Plus, Send } from "lucide-react";
import { useStore } from "@/app/lib/store";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Label,
  Modal,
  Select,
  Textarea,
  cn,
} from "@/app/components/ui";
import {
  announcementCategoryMeta,
  formatDateTime,
  relativeTime,
} from "@/app/lib/selectors";
import type { AnnouncementCategory } from "@/app/lib/types";

const categories: AnnouncementCategory[] = [
  "genel",
  "bakim",
  "toplanti",
  "finans",
  "guvenlik",
];

export default function AdminAnnouncementsPage() {
  const { data, createAnnouncement } = useStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<AnnouncementCategory>("genel");
  const [important, setImportant] = useState(false);
  const [blocks, setBlocks] = useState<string[]>(["A", "B"]);
  const [error, setError] = useState<string | null>(null);

  const announcements = [...data.announcements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const reset = () => {
    setTitle("");
    setBody("");
    setCategory("genel");
    setImportant(false);
    setBlocks(["A", "B"]);
    setError(null);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (title.trim().length < 5) {
      setError("Duyuru başlığı en az 5 karakter olmalı.");
      return;
    }
    if (body.trim().length < 15) {
      setError("Duyuru içeriği en az 15 karakter olmalı.");
      return;
    }
    if (blocks.length === 0) {
      setError("En az bir blok seçmelisiniz.");
      return;
    }
    createAnnouncement({ title, body, category, important, blocks });
    reset();
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <section className="flex items-start justify-between gap-3 rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 p-6 text-white shadow-xl shadow-red-950/30">
        <div>
          <p className="text-xs font-medium text-red-300">İletişim</p>
          <h1 className="mt-1 text-xl font-bold">Duyuru Yönetimi</h1>
          <p className="mt-1 text-[11px] text-slate-400">
            {announcements.length} duyuru · {data.apartments.length} daireye ulaşın
          </p>
        </div>
        <Button
          onClick={() => {
            reset();
            setOpen(true);
          }}
          variant="red"
          size="sm"
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
          Yeni Duyuru
        </Button>
      </section>

      {announcements.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-5 w-5" />}
          title="Henüz duyuru yok"
          description="İlk duyuruyu oluşturarak sakinleri bilgilendirin."
        />
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => {
            const meta = announcementCategoryMeta[announcement.category];
            return (
              <Card key={announcement.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      announcement.important
                        ? "bg-red-50 text-red-600"
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    <Megaphone className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge className={meta.className}>{meta.label}</Badge>
                      {announcement.important ? (
                        <Badge className="bg-red-50 text-red-600 ring-red-200">
                          <AlertTriangle className="h-3 w-3" />
                          Önemli
                        </Badge>
                      ) : null}
                      <span className="text-[10px] text-slate-400">
                        {relativeTime(announcement.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-slate-800">
                      {announcement.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">
                      {announcement.body}
                    </p>
                    <p className="mt-2 text-[10px] text-slate-400">
                      Hedef: {announcement.blocks.join(", ")} Blok ·{" "}
                      {formatDateTime(announcement.createdAt)}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Yeni Duyuru"
        description="Duyuru tüm seçili bloklardaki sakinlere bildirim olarak gönderilir."
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Örn. Asansör bakımı hakkında"
            />
          </div>
          <div>
            <Label htmlFor="body">İçerik</Label>
            <Textarea
              id="body"
              rows={5}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Duyuru metnini yazın…"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="category">Kategori</Label>
              <Select
                id="category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as AnnouncementCategory)
                }
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {announcementCategoryMeta[item].label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Hedef Bloklar</Label>
              <div className="flex gap-2">
                {["A", "B"].map((block) => {
                  const active = blocks.includes(block);
                  return (
                    <button
                      key={block}
                      type="button"
                      onClick={() =>
                        setBlocks((prev) =>
                          active ? prev.filter((item) => item !== block) : [...prev, block]
                        )
                      }
                      className={cn(
                        "flex-1 rounded-xl border px-3 py-2.5 text-xs font-semibold transition",
                        active
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-slate-200 bg-white text-slate-500"
                      )}
                    >
                      {block} Blok
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setImportant((value) => !value)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-xs font-semibold transition",
              important
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-slate-200 bg-white text-slate-500"
            )}
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Önemli duyuru olarak işaretle
            </span>
            <span
              className={cn(
                "flex h-5 w-9 items-center rounded-full p-0.5 transition",
                important ? "bg-red-500" : "bg-slate-300"
              )}
            >
              <span
                className={cn(
                  "h-4 w-4 rounded-full bg-white transition",
                  important && "translate-x-4"
                )}
              />
            </span>
          </button>

          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600 ring-1 ring-red-100">
              {error}
            </p>
          ) : null}

          <Button type="submit" variant="red" className="w-full">
            <Send className="h-4 w-4" />
            Duyuruyu Yayınla
          </Button>
        </form>
      </Modal>
    </div>
  );
}
