"use client";

import { useState } from "react";
import { BarChart3, CheckCircle2, Clock, Vote } from "lucide-react";
import { useStore } from "@/app/lib/store";
import { Badge, Card, EmptyState, Progress, cn } from "@/app/components/ui";
import {
  formatDate,
  pollPercent,
  pollTotal,
} from "@/app/lib/selectors";
import { useNow } from "@/app/lib/use-now";

export default function DairePollsPage() {
  const { data, user, vote } = useStore();
  const [tab, setTab] = useState<"active" | "ended">("active");
  const now = useNow();

  if (!user) return null;

  const sorted = [...data.polls].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const active = sorted.filter((poll) => new Date(poll.endsAt).getTime() > now);
  const ended = sorted.filter((poll) => new Date(poll.endsAt).getTime() <= now);
  const shown = tab === "active" ? active : ended;

  return (
    <div className="space-y-4">
      <section className="hero-soft p-6">
        <div className="flex items-center gap-2 text-rose-100">
          <BarChart3 className="h-4 w-4" />
          <p className="text-xs font-medium">Apartman İçi Anketler</p>
        </div>
        <h1 className="mt-2 text-xl font-bold">Anketler</h1>
        <p className="mt-1 text-[11px] text-rose-100">
          {active.length} aktif anket · Oyunuzu kullanın, sonuçları canlı izleyin.
        </p>
      </section>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setTab("active")}
          className={cn(
            "flex-1 rounded-lg py-2 text-xs font-semibold transition",
            tab === "active" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500"
          )}
        >
          Aktif ({active.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("ended")}
          className={cn(
            "flex-1 rounded-lg py-2 text-xs font-semibold transition",
            tab === "ended" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500"
          )}
        >
          Sonuçlanan ({ended.length})
        </button>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="h-5 w-5" />}
          title={tab === "active" ? "Aktif anket yok" : "Sonuçlanan anket yok"}
          description="Yönetim yeni bir anket açtığında burada görünecek."
        />
      ) : (
        <div className="space-y-4">
          {shown.map((poll) => {
            const total = pollTotal(poll);
            const myVote = poll.voters[user.id];
            const isEnded = new Date(poll.endsAt).getTime() <= now;
            const showResults = Boolean(myVote) || isEnded;

            return (
              <Card key={poll.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={
                          isEnded
                            ? "bg-slate-100 text-slate-500 ring-slate-200"
                            : "bg-rose-50 text-rose-600 ring-rose-200"
                        }
                      >
                        {isEnded ? "Sonuçlandı" : "Aktif"}
                      </Badge>
                      {myVote ? (
                        <Badge className="bg-emerald-50 text-emerald-600 ring-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Oy kullandınız
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {poll.question}
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      {poll.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Vote className="h-3 w-3" />
                      {total} oy
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(poll.endsAt)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {poll.options.map((option) => {
                    const percent = pollPercent(poll, option.id);
                    const selected = myVote === option.id;
                    if (!showResults) {
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => vote(poll.id, option.id)}
                          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left text-xs font-medium text-slate-700 transition hover:border-rose-300 hover:bg-rose-50/50 hover:text-rose-700"
                        >
                          {option.label}
                          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300" />
                        </button>
                      );
                    }
                    return (
                      <div key={option.id}>
                        <div className="mb-1 flex items-center justify-between text-[11px]">
                          <span
                            className={cn(
                              "font-medium",
                              selected ? "text-rose-600" : "text-slate-600"
                            )}
                          >
                            {option.label}
                            {selected ? " · Oyunuz" : ""}
                          </span>
                          <span className="font-semibold text-slate-700">
                            %{percent} · {option.votes}
                          </span>
                        </div>
                        <Progress
                          value={percent}
                          barClassName={selected ? "bg-rose-500" : "bg-slate-300"}
                        />
                      </div>
                    );
                  })}
                </div>

                <p className="mt-3 text-[10px] text-slate-400">
                  {showResults
                    ? isEnded
                      ? "Anket sonuçlandı, sonuçlar kesinleşti."
                      : "Sonuçlar canlı olarak güncelleniyor."
                    : "Oy verdikten sonra sonuçları görebilirsiniz."}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
