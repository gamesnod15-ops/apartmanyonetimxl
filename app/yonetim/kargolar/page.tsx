"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  KeyRound,
  Package,
  PackageCheck,
  Plus,
  Search,
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
  Select,
  cn,
} from "@/app/components/ui";
import { formatDateTime, packageStatusMeta, relativeTime } from "@/app/lib/selectors";
import type { PackageStatus } from "@/app/lib/types";

type Filter = "all" | PackageStatus;

export default function AdminPackagesPage() {
  const { data, addPackage, deliverPackage } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [apartmentId, setApartmentId] = useState(data.apartments[0]?.id ?? "");
  const [courier, setCourier] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [deliverOpen, setDeliverOpen] = useState<string | null>(null);
  const [deliverCode, setDeliverCode] = useState("");
  const [deliverError, setDeliverError] = useState<string | null>(null);
  const [deliverSuccess, setDeliverSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const packages = [...data.packages].sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  );
  const search = query.trim().toLocaleLowerCase("tr-TR");
  const filtered = packages.filter((item) => {
    const statusMatch = filter === "all" || item.status === filter;
    const queryMatch =
      !search ||
      item.apartmentId.toLocaleLowerCase("tr-TR").includes(search) ||
      item.courier.toLocaleLowerCase("tr-TR").includes(search) ||
      item.description.toLocaleLowerCase("tr-TR").includes(search);
    return statusMatch && queryMatch;
  });

  const created = createdId
    ? data.packages.find((item) => item.id === createdId) ?? null
    : null;
  const deliverTarget = deliverOpen
    ? data.packages.find((item) => item.id === deliverOpen) ?? null
    : null;

  const resetAdd = () => {
    setApartmentId(data.apartments[0]?.id ?? "");
    setCourier("");
    setDescription("");
    setError(null);
    setCreatedId(null);
    setCopied(false);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!courier.trim()) {
      setError("Kargo firması zorunlu.");
      return;
    }
    const result = addPackage({ apartmentId, courier, description });
    if (!result.ok || !result.id) {
      setError(result.error ?? "Kargo kaydı oluşturulamadı.");
      return;
    }
    setError(null);
    setCreatedId(result.id);
  };

  const submitDeliver = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!deliverOpen) return;
    const result = deliverPackage(deliverOpen, deliverCode);
    if (!result.ok) {
      setDeliverError(result.error ?? "Kargo teslim edilemedi.");
      return;
    }
    setDeliverError(null);
    setDeliverSuccess(true);
  };

  return (
    <div className="space-y-4">
      <section className="flex items-start justify-between gap-3 rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 p-6 text-white shadow-xl shadow-red-950/30">
        <div>
          <p className="text-xs font-medium text-red-300">Güvenlik</p>
          <h1 className="mt-1 text-xl font-bold">Kargo Yönetimi</h1>
          <p className="mt-1 text-[11px] text-slate-400">
            {packages.filter((item) => item.status === "security").length} güvenlikte ·{" "}
            {packages.filter((item) => item.status === "delivered").length} teslim edildi
          </p>
        </div>
        <Button
          onClick={() => {
            resetAdd();
            setAddOpen(true);
          }}
          variant="red"
          size="sm"
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
          Kargo Ekle
        </Button>
      </section>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Daire, firma veya açıklama ara…"
          className="pl-9"
        />
      </div>

      <Segmented
        options={[
          { value: "all", label: "Tümü", count: packages.length },
          {
            value: "security",
            label: "Güvenlikte",
            count: packages.filter((item) => item.status === "security").length,
          },
          {
            value: "delivered",
            label: "Teslim",
            count: packages.filter((item) => item.status === "delivered").length,
          },
        ]}
        value={filter}
        onChange={setFilter}
        tone="red"
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="h-5 w-5" />}
          title="Kargo kaydı yok"
          description="Bu filtrede gösterilecek kargo bulunmuyor."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const meta = packageStatusMeta[item.status];
            return (
              <Card key={item.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      item.status === "delivered"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    )}
                  >
                    <Package className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {item.apartmentId} · {item.description}
                      </p>
                      <Badge className={cn("shrink-0", meta.className)}>{meta.label}</Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Truck className="h-3 w-3" />
                      {item.courier}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Teslim alan: {item.receivedBy} · {relativeTime(item.receivedAt)}
                      {item.deliveredAt ? ` · Teslim ${relativeTime(item.deliveredAt)}` : ""}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-bold tracking-widest text-slate-700">
                        {item.code}
                      </span>
                      {item.status === "security" ? (
                        <Button
                          variant="soft"
                          size="sm"
                          onClick={() => {
                            setDeliverOpen(item.id);
                            setDeliverCode("");
                            setDeliverError(null);
                            setDeliverSuccess(false);
                          }}
                        >
                          <PackageCheck className="h-3.5 w-3.5" />
                          Teslim Et
                        </Button>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          {item.deliveredAt ? formatDateTime(item.deliveredAt) : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={created ? "Kargo Kaydedildi" : "Yeni Kargo"}
        description={
          created
            ? "Teslim kodunu dairenin sakinine iletin."
            : "Güvenliğe teslim edilen kargoyu kaydedin."
        }
      >
        {created ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-6 text-center ring-1 ring-emerald-100">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </span>
              <p className="text-xs font-medium text-emerald-700">
                {created.apartmentId} dairesi için kargo
              </p>
              <p className="font-mono text-3xl font-bold tracking-[0.35em] text-emerald-900">
                {created.code}
              </p>
              <p className="text-[10px] text-emerald-600">Teslim kodu</p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  navigator.clipboard.writeText(created.code).catch(() => undefined);
                  setCopied(true);
                }
              }}
            >
              <Copy className="h-4 w-4" />
              {copied ? "Kopyalandı" : "Kodu Kopyala"}
            </Button>
            <div className="flex gap-2">
              <Button variant="soft" className="flex-1" onClick={resetAdd}>
                Yeni Kargo
              </Button>
              <Button variant="red" className="flex-1" onClick={() => setAddOpen(false)}>
                Kapat
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="apartment">Daire</Label>
              <Select
                id="apartment"
                value={apartmentId}
                onChange={(event) => setApartmentId(event.target.value)}
              >
                {data.apartments.map((apartment) => (
                  <option key={apartment.id} value={apartment.id}>
                    {apartment.id} · {apartment.ownerName}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="courier">Kargo Firması</Label>
              <Input
                id="courier"
                value={courier}
                onChange={(event) => setCourier(event.target.value)}
                placeholder="Örn. Yurtiçi Kargo"
              />
            </div>
            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Input
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Örn. Orta boy koli"
              />
            </div>
            {error ? (
              <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600 ring-1 ring-red-100">
                {error}
              </p>
            ) : null}
            <Button type="submit" variant="red" className="w-full">
              <Package className="h-4 w-4" />
              Kargoyu Kaydet
            </Button>
          </form>
        )}
      </Modal>

      <Modal
        open={Boolean(deliverTarget)}
        onClose={() => setDeliverOpen(null)}
        title="Kargo Teslimi"
        description={
          deliverTarget
            ? `${deliverTarget.apartmentId} · ${deliverTarget.courier}`
            : undefined
        }
      >
        {deliverSuccess ? (
          <div className="flex flex-col items-center gap-3 py-3 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
              <PackageCheck className="h-8 w-8" />
            </span>
            <p className="text-sm font-semibold text-slate-800">Kargo teslim edildi</p>
            <p className="text-[11px] text-slate-500">
              Sakin bilgilendirildi ve kayıt güncellendi.
            </p>
            <Button variant="red" className="mt-2 w-full" onClick={() => setDeliverOpen(null)}>
              Kapat
            </Button>
          </div>
        ) : (
          <form onSubmit={submitDeliver} className="space-y-4">
            <div className="rounded-xl bg-slate-50 px-3.5 py-3 text-[11px] leading-5 text-slate-600 ring-1 ring-slate-100">
              Teslimden önce daire sakininden aldığınız 4 haneli teslim kodunu girin.
            </div>
            <div>
              <Label htmlFor="deliverCode">Teslim Kodu</Label>
              <Input
                id="deliverCode"
                value={deliverCode}
                onChange={(event) => setDeliverCode(event.target.value)}
                placeholder="••••"
                inputMode="numeric"
                maxLength={4}
                className="text-center font-mono text-xl tracking-[0.4em]"
                autoFocus
              />
            </div>
            {deliverError ? (
              <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600 ring-1 ring-red-100">
                {deliverError}
              </p>
            ) : null}
            <Button type="submit" variant="red" className="w-full">
              <KeyRound className="h-4 w-4" />
              Teslimi Onayla
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
