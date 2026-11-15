"use client";

import { useState } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  Gift,
  Info,
  Minus,
  Plus,
  Users,
} from "lucide-react";
import { useStore } from "@/app/lib/store";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Label,
  Select,
  Textarea,
  cn,
} from "@/app/components/ui";
import {
  currency,
  formatDateTime,
  remainingRights,
} from "@/app/lib/selectors";

export default function RightsTransferPage() {
  const { data, user, transferRights } = useStore();
  const [targetId, setTargetId] = useState("");
  const [count, setCount] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  const apartment = data.apartments.find((item) => item.id === user.apartmentId);
  const rights = remainingRights(apartment);
  const others = data.apartments.filter((item) => item.id !== apartment?.id);
  const history = data.transfers
    .filter(
      (transfer) =>
        transfer.fromApartmentId === apartment?.id ||
        transfer.toApartmentId === apartment?.id
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(false);
    if (!targetId) {
      setError("Hak devretmek istediğiniz daireyi seçin.");
      return;
    }
    const result = transferRights({
      toApartmentId: targetId,
      count,
      note,
    });
    if (!result.ok) {
      setError(result.error ?? "Devir işlemi tamamlanamadı.");
      return;
    }
    setError(null);
    setSuccess(true);
    setTargetId("");
    setCount(1);
    setNote("");
  };

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden hero-soft p-6">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="flex items-center gap-2 text-violet-100">
          <ArrowLeftRight className="h-4 w-4" />
          <p className="text-xs font-medium">Arıza Hakkı Paylaşımı</p>
        </div>
        <h1 className="mt-2 text-xl font-bold">Hakkınızı komşunuza devredin</h1>
        <p className="mt-1 max-w-md text-[11px] leading-5 text-violet-100">
          Kullanmadığınız ücretsiz teknik destek hakkınızı daire numarası ile
          komşunuza devredebilirsiniz.
        </p>
        <div className="mt-5 inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
          <Gift className="h-5 w-5 text-violet-200" />
          <div>
            <p className="text-[10px] uppercase tracking-wide text-violet-200">
              Kullanılabilir hak
            </p>
            <p className="text-lg font-bold">
              {rights} / {apartment?.rights.total ?? 0}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Gift className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Yeni Devir</p>
              <p className="text-[11px] text-slate-500">
                Daire seçin ve hak sayısını belirleyin.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="target">Hedef Daire</Label>
              <Select
                id="target"
                value={targetId}
                onChange={(event) => {
                  setTargetId(event.target.value);
                  setSuccess(false);
                  setError(null);
                }}
              >
                <option value="">Daire seçin…</option>
                {others.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id} · {item.ownerName}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label hint={`En fazla ${rights}`}>Devredilecek Hak</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setCount((value) => Math.max(1, value - 1))}
                  aria-label="Azalt"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min={1}
                  max={Math.max(1, rights)}
                  value={count}
                  onChange={(event) =>
                    setCount(
                      Math.min(
                        Math.max(1, Number(event.target.value) || 1),
                        Math.max(1, rights)
                      )
                    )
                  }
                  className="text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCount((value) => Math.min(Math.max(1, rights), value + 1))
                  }
                  aria-label="Arttır"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="note" hint="Opsiyonel">
                Not
              </Label>
              <Textarea
                id="note"
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Örn. Bu ay kullanmayacağım, komşum faydalansın."
              />
            </div>

            {error ? (
              <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600 ring-1 ring-red-100">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                <CheckCircle2 className="h-4 w-4" />
                Hak devri başarıyla tamamlandı.
              </p>
            ) : null}

            <Button
              type="submit"
              className="w-full"
              disabled={rights < 1}
            >
              <ArrowRight className="h-4 w-4" />
              Hakkı Devret
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-bold text-slate-900">Nasıl çalışır?</p>
            </div>
            <ul className="space-y-2.5 text-[11px] leading-5 text-slate-500">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                Her dairenin aylık tanımlı ücretsiz arıza hakkı bulunur.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                Devrettiğiniz hak, seçtiğiniz dairenin hakkına eklenir.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                Devir işlemi geri alınamaz; komşunuz bilgilendirilir.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                Yeni arıza kaydı oluşturduğunuzda hakkınızdan düşülür.
              </li>
            </ul>
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <p className="text-sm font-bold text-slate-900">Devir Geçmişi</p>
              </div>
              <Badge className="bg-slate-100 text-slate-600 ring-slate-200">
                {history.length} kayıt
              </Badge>
            </div>
            {history.length === 0 ? (
              <EmptyState
                icon={<ArrowLeftRight className="h-5 w-5" />}
                title="Henüz devir yok"
                description="Yaptığınız hak devirleri burada listelenir."
              />
            ) : (
              <div className="space-y-2">
                {history.map((transfer) => {
                  const incoming = transfer.toApartmentId === apartment?.id;
                  return (
                    <div
                      key={transfer.id}
                      className="rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-700">
                          {incoming ? "Gelen devir" : "Giden devir"} ·{" "}
                          {transfer.count} hak
                        </p>
                        <span
                          className={cn(
                            "text-[10px] font-semibold",
                            incoming ? "text-emerald-600" : "text-violet-600"
                          )}
                        >
                          {incoming
                            ? `${transfer.fromApartmentId} → ${transfer.toApartmentId}`
                            : `${transfer.fromApartmentId} → ${transfer.toApartmentId}`}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {formatDateTime(transfer.createdAt)}
                      </p>
                      {transfer.note ? (
                        <p className="mt-1 text-[11px] text-slate-500">
                          {transfer.note}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Card>
        <p className="text-xs font-bold text-slate-900">Dairelerin Kullanılabilir Hakları</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {others.slice(0, 8).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100"
            >
              <div>
                <p className="text-[11px] font-semibold text-slate-700">{item.id}</p>
                <p className="text-[10px] text-slate-400">{item.ownerName}</p>
              </div>
              <span className="text-[11px] font-bold text-violet-600">
                {remainingRights(item)} hak
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-slate-400">
          Ortak gider dengesi: {currency(apartment?.balance ?? 0)}
        </p>
      </Card>
    </div>
  );
}
