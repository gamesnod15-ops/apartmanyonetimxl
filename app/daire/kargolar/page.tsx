"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Package,
  PackageCheck,
  QrCode,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useStore } from "@/app/lib/store";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Label,
  Modal,
  Segmented,
  cn,
} from "@/app/components/ui";
import {
  formatDateTime,
  packageStatusMeta,
  relativeTime,
} from "@/app/lib/selectors";

type Filter = "all" | "security" | "delivered";

function QrBlock({ value }: { value: string }) {
  const cells = useMemo(() => {
    const size = 21;
    let seed = 0;
    for (let index = 0; index < value.length; index += 1) {
      seed = (seed * 31 + value.charCodeAt(index)) % 2147483647;
    }
    const result: boolean[] = [];
    for (let index = 0; index < size * size; index += 1) {
      seed = (seed * 1103515245 + 12345) % 2147483647;
      result.push(seed % 3 !== 0);
    }
    const inFinder = (row: number, col: number, top: number, left: number) =>
      row >= top && row < top + 7 && col >= left && col < left + 7;
    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        const index = row * size + col;
        if (
          inFinder(row, col, 0, 0) ||
          inFinder(row, col, 0, size - 7) ||
          inFinder(row, col, size - 7, 0)
        ) {
          const localRow = row % (size - 7 > 0 ? 7 : 7);
          const localCol = col % 7;
          const edge = localRow === 0 || localRow === 6 || localCol === 0 || localCol === 6;
          const center = localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4;
          result[index] = edge || center;
        }
      }
    }
    return result;
  }, [value]);

  return (
    <div className="grid w-36 grid-cols-[repeat(21,minmax(0,1fr))] gap-px rounded-lg bg-white p-2 ring-1 ring-slate-200">
      {cells.map((filled, index) => (
        <span
          key={index}
          className={cn("aspect-square", filled ? "bg-slate-900" : "bg-white")}
        />
      ))}
    </div>
  );
}

export default function DairePackagesPage() {
  const { data, user, deliverPackage } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  const packages = data.packages
    .filter((item) => item.apartmentId === user.apartmentId)
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  const waiting = packages.filter((item) => item.status === "security");
  const delivered = packages.filter((item) => item.status === "delivered");
  const filtered =
    filter === "all" ? packages : filter === "security" ? waiting : delivered;
  const selected = packages.find((item) => item.id === selectedId) ?? null;

  const closeModal = () => {
    setSelectedId(null);
    setCode("");
    setError(null);
    setSuccess(false);
  };

  const confirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    const result = deliverPackage(selected.id, code);
    if (!result.ok) {
      setError(result.error ?? "Teslim onaylanamadı.");
      return;
    }
    setError(null);
    setSuccess(true);
  };

  return (
    <div className="space-y-4">
      <section className="hero-soft hero-amber p-6">
        <div className="flex items-center gap-2 text-amber-100">
          <Truck className="h-4 w-4" />
          <p className="text-xs font-medium">Kargo Teslim Yönetimi</p>
        </div>
        <h1 className="mt-2 text-xl font-bold">Kargolarım</h1>
        <p className="mt-1 text-[11px] text-amber-100">
          {waiting.length} güvenlikte bekleyen · {delivered.length} teslim alınan
        </p>
      </section>

      <Segmented
        options={[
          { value: "all", label: "Tümü", count: packages.length },
          { value: "security", label: "Güvenlikte", count: waiting.length },
          { value: "delivered", label: "Teslim Alındı", count: delivered.length },
        ]}
        value={filter}
        onChange={setFilter}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="h-5 w-5" />}
          title="Kargo kaydı yok"
          description="Güvenliğe kargo bırakıldığında burada görünecek."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const meta = packageStatusMeta[item.status];
            return (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        item.status === "security"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-emerald-50 text-emerald-600"
                      )}
                    >
                      {item.status === "security" ? (
                        <ShieldCheck className="h-4 w-4" />
                      ) : (
                        <PackageCheck className="h-4 w-4" />
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {item.courier}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {item.description} · {relativeTime(item.receivedAt)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Teslim alan: {item.receivedBy}
                      </p>
                    </div>
                  </div>
                  <Badge className={meta.className}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                    {meta.label}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  {item.status === "security" ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setRevealed((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                        }
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500"
                      >
                        {revealed[item.id] ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                        Teslim kodu: {revealed[item.id] ? item.code : "••••"}
                      </button>
                      <Button
                        variant="blue"
                        size="sm"
                        onClick={() => {
                          setSelectedId(item.id);
                          setCode("");
                          setError(null);
                          setSuccess(false);
                        }}
                      >
                        <QrCode className="h-3.5 w-3.5" />
                        Teslim Onayı
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {item.deliveredAt
                          ? `Teslim: ${formatDateTime(item.deliveredAt)}`
                          : "Teslim edildi"}
                      </span>
                      <span className="text-[10px] text-slate-400">{item.apartmentId}</span>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(selected) && !success}
        onClose={closeModal}
        title="Kargo Teslim Onayı"
        description={
          selected
            ? `${selected.courier} · ${selected.description}`
            : undefined
        }
      >
        {selected ? (
          <form onSubmit={confirm} className="space-y-4">
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <QrBlock value={selected.code} />
              <p className="text-center text-[11px] leading-5 text-slate-500">
                Güvenlik görevlisinden aldığınız 4 haneli teslim kodunu girin veya
                QR kodu okutun.
              </p>
            </div>
            <div>
              <Label htmlFor="code">Teslim Kodu</Label>
              <Input
                id="code"
                inputMode="numeric"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="••••"
                className="text-center text-lg tracking-[0.5em]"
                required
              />
            </div>
            {error ? (
              <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600 ring-1 ring-red-100">
                {error}
              </p>
            ) : null}
            <Button type="submit" variant="blue" className="w-full">
              <CheckCircle2 className="h-4 w-4" />
              Teslimi Onayla
            </Button>
          </form>
        ) : null}
      </Modal>

      <Modal
        open={success}
        onClose={closeModal}
        title="Teslim Onaylandı"
        description="Kargonuz teslim alındı olarak işaretlendi."
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
            <PackageCheck className="h-8 w-8" />
          </span>
          <p className="text-sm font-semibold text-slate-800">Afiyet olsun!</p>
          <p className="text-[11px] text-slate-500">
            Kargo kaydı güvenlik ve yönetim tarafında da güncellendi.
          </p>
          <Button variant="blue" className="mt-2 w-full" onClick={closeModal}>
            Tamam
          </Button>
        </div>
      </Modal>
    </div>
  );
}
