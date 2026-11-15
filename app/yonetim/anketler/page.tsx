"use client";

import { useState } from "react";
import { BarChart3, Plus, Vote } from "lucide-react";
import { useStore } from "@/app/lib/store";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Label,
  Modal,
  Textarea,
  cn,
} from "@/app/components/ui";
import { formatDate, pollPercent, relativeTime } from "@/app/lib/selectors";
import { useNow } from "@/app/lib/use-now";

export default function AdminPollsPage() {
  const { data, createPoll } = useStore();
  const now = useNow();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [endsAt, setEndsAt] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().slice(0, 10);
  });
  const [error, setError] = useState<string | null>(null);

  const polls = [...data.polls].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const residentCount = data.users.filter((item) => item.role === "resident").length;

  const reset = () => {
    setQuestion("");
    setDescription("");
    setOptions(["", ""]);
    const date = new Date();
    date.setDate(date.getDate() + 7);
    setEndsAt(date.toISOString().slice(0, 10));
    setError(null);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (question.trim().length < 5) {
      setError("Soru en az 5 karakter olmalı.");
      return;
    }
    const clean = options.map((option) => option.trim()).filter(Boolean);
    if (clean.length < 2) {
      setError("En az 2 seçenek girmelisiniz.");
      return;
    }
    createPoll({ question, description, options: clean, endsAt });
    reset();
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <section className="flex items-start justify-between gap-3 rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 p-6 text-white shadow-xl shadow-red-950/30">
        <div>
          <p className="text-xs font-medium text-red-300">Katılım</p>
          <h1 className="mt-1 text-xl font-bold">Anket Yönetimi</h1>
          <p className="mt-1 text-[11px] text-slate-400">
            {polls.length} anket · {residentCount} sakin oy kullanabilir
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
          Yeni Anket
        </Button>
      </section>

      {polls.length === 0 ? (
        <EmptyState
          icon={<Vote className="h-5 w-5" />}
          title="Henüz anket yok"
          description="İlk anketi oluşturarak sakin görüşlerini toplayın."
        />
      ) : (
        <div className="space-y-3">
          {polls.map((poll) => {
            const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
            const voterCount = Object.keys(poll.voters).length;
            const expired = new Date(poll.endsAt).getTime() < now;
            return (
              <Card key={poll.id} className="p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{poll.question}</p>
                    {poll.description ? (
                      <p className="mt-0.5 text-[11px] text-slate-500">{poll.description}</p>
                    ) : null}
                  </div>
                  <Badge
                    className={cn(
                      "shrink-0",
                      expired
                        ? "bg-slate-100 text-slate-500 ring-slate-200"
                        : "bg-emerald-50 text-emerald-600 ring-emerald-200"
                    )}
                  >
                    {expired ? "Kapandı" : "Açık"}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {poll.options.map((option) => {
                    const percent = pollPercent(poll, option.id);
                    return (
                      <div key={option.id}>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-medium text-slate-600">{option.label}</span>
                          <span className="font-bold text-slate-800">
                            %{percent}
                            <span className="ml-1 font-normal text-slate-400">
                              ({option.votes})
                            </span>
                          </span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-600 transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5" />
                    {totalVotes} oy · {voterCount}/{residentCount} katılım
                  </span>
                  <span>
                    Bitiş {formatDate(poll.endsAt)} · {relativeTime(poll.createdAt)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Yeni Anket"
        description="Anket tüm sakinlere bildirim olarak gönderilir."
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="question">Soru</Label>
            <Input
              id="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Örn. Kapıcı çalışma saatleri nasıl olmalı?"
            />
          </div>
          <div>
            <Label htmlFor="description">Açıklama (opsiyonel)</Label>
            <Textarea
              id="description"
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Anket hakkında kısa bilgi…"
            />
          </div>
          <div className="space-y-2">
            <Label>Seçenekler</Label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(event) =>
                    setOptions((prev) =>
                      prev.map((item, itemIndex) =>
                        itemIndex === index ? event.target.value : item
                      )
                    )
                  }
                  placeholder={`${index + 1}. seçenek`}
                />
                {options.length > 2 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Seçeneği kaldır"
                    onClick={() =>
                      setOptions((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
                    }
                  >
                    ×
                  </Button>
                ) : null}
              </div>
            ))}
            {options.length < 5 ? (
              <Button
                type="button"
                variant="soft"
                size="sm"
                onClick={() => setOptions((prev) => [...prev, ""])}
              >
                <Plus className="h-3.5 w-3.5" />
                Seçenek Ekle
              </Button>
            ) : null}
          </div>
          <div>
            <Label htmlFor="endsAt">Bitiş Tarihi</Label>
            <Input
              id="endsAt"
              type="date"
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
            />
          </div>
          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600 ring-1 ring-red-100">
              {error}
            </p>
          ) : null}
          <Button type="submit" variant="red" className="w-full">
            <Vote className="h-4 w-4" />
            Anketi Başlat
          </Button>
        </form>
      </Modal>
    </div>
  );
}
