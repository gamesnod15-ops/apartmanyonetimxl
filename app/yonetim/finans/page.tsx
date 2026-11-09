"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  CreditCard,
  Plus,
  Receipt,
  Search,
  TrendingUp,
  Wallet,
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
  Progress,
  Segmented,
  Select,
  cn,
} from "@/app/components/ui";
import {
  collectionStats,
  currency,
  formatDate,
  paymentStatusMeta,
  remainingRights,
} from "@/app/lib/selectors";
import type { PaymentStatus } from "@/app/lib/types";

type Tab = "apartments" | "payments";
type PaymentFilter = "all" | PaymentStatus;

export default function AdminFinancePage() {
  const { data, addPayment, sendPaymentReminder } = useStore();
  const [tab, setTab] = useState<Tab>("apartments");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [query, setQuery] = useState("");
  const [debtOpen, setDebtOpen] = useState(false);
  const [debtApartment, setDebtApartment] = useState(data.apartments[0]?.id ?? "");
  const [period, setPeriod] = useState(
    new Date().toLocaleDateString("tr-TR", { month: "long", year: "numeric" })
  );
  const [amount, setAmount] = useState("1500");
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(15);
    return date.toISOString().slice(0, 10);
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [reminded, setReminded] = useState<string[]>([]);

  const collection = collectionStats(data.payments);
  const payments = [...data.payments].sort(
    (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
  );
  const filteredPayments = payments.filter((payment) =>
    paymentFilter === "all" ? true : payment.status === paymentFilter
  );

  const search = query.trim().toLocaleLowerCase("tr-TR");
  const apartments = data.apartments.filter((apartment) => {
    if (!search) return true;
    return (
      apartment.id.toLocaleLowerCase("tr-TR").includes(search) ||
      apartment.ownerName.toLocaleLowerCase("tr-TR").includes(search)
    );
  });

  const apartmentDebt = (apartmentId: string) =>
    data.payments
      .filter((payment) => payment.apartmentId === apartmentId && payment.status !== "paid")
      .reduce((sum, payment) => sum + payment.amount, 0);

  const resetDebtForm = () => {
    setDebtApartment(data.apartments[0]?.id ?? "");
    setPeriod(new Date().toLocaleDateString("tr-TR", { month: "long", year: "numeric" }));
    setAmount("1500");
    const date = new Date();
    date.setDate(15);
    setDueDate(date.toISOString().slice(0, 10));
    setError(null);
    setSuccess(false);
  };

  const submitDebt = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = addPayment({
      apartmentId: debtApartment,
      period,
      amount: Number(amount),
      dueDate,
    });
    if (!result.ok) {
      setError(result.error ?? "Borç tanımlanamadı.");
      return;
    }
    setError(null);
    setSuccess(true);
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 p-6 text-white shadow-lg shadow-emerald-950/20">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-emerald-300">Finans & Aidat</p>
            <h1 className="mt-1 text-xl font-bold">Aidat Yönetimi</h1>
            <p className="mt-1 text-[11px] text-slate-400">
              Tahsilat {currency(collection.paid)} · Bekleyen{" "}
              {currency(collection.outstanding)}
            </p>
          </div>
          <Button
            onClick={() => {
              resetDebtForm();
              setDebtOpen(true);
            }}
            className="shrink-0 bg-emerald-500 text-white hover:bg-emerald-600"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Borç Ekle
          </Button>
        </div>

        <div className="mt-5 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-300">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              Tahsilat oranı
            </span>
            <span className="text-base font-bold">%{collection.rate}</span>
          </div>
          <Progress
            value={collection.rate}
            className="mt-2 bg-white/10"
            barClassName="bg-emerald-400"
          />
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[9px] uppercase tracking-wide text-slate-400">Tahakkuk</p>
              <p className="text-xs font-bold">{currency(collection.total)}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wide text-slate-400">Tahsil</p>
              <p className="text-xs font-bold text-emerald-400">{currency(collection.paid)}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wide text-slate-400">Kalan</p>
              <p className="text-xs font-bold text-amber-400">
                {currency(collection.outstanding)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setTab("apartments")}
          className={cn(
            "flex-1 rounded-lg py-2 text-xs font-semibold transition",
            tab === "apartments" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
          )}
        >
          Daire Borçları
        </button>
        <button
          type="button"
          onClick={() => setTab("payments")}
          className={cn(
            "flex-1 rounded-lg py-2 text-xs font-semibold transition",
            tab === "payments" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
          )}
        >
          Ödeme Kayıtları ({payments.length})
        </button>
      </div>

      {tab === "apartments" ? (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Daire veya sakin ara…"
              className="pl-9"
            />
          </div>

          {apartments.length === 0 ? (
            <EmptyState
              icon={<Wallet className="h-5 w-5" />}
              title="Daire bulunamadı"
              description="Arama kriterlerine uygun daire yok."
            />
          ) : (
            <div className="space-y-3">
              {apartments.map((apartment) => {
                const debt = apartmentDebt(apartment.id);
                const overdue = data.payments.some(
                  (payment) =>
                    payment.apartmentId === apartment.id && payment.status === "overdue"
                );
                const isReminded = reminded.includes(apartment.id);
                return (
                  <Card key={apartment.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold",
                            debt > 0
                              ? overdue
                                ? "bg-red-50 text-red-600"
                                : "bg-amber-50 text-amber-600"
                              : "bg-emerald-50 text-emerald-600"
                          )}
                        >
                          {apartment.id}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {apartment.ownerName}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {apartment.residentCount} sakin · {remainingRights(apartment)}/
                            {apartment.rights.total} arıza hakkı
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            Bakiye: {currency(apartment.balance)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "text-base font-bold",
                            debt > 0 ? (overdue ? "text-red-600" : "text-amber-600") : "text-emerald-600"
                          )}
                        >
                          {debt > 0 ? currency(debt) : "Borç yok"}
                        </p>
                        {overdue ? (
                          <Badge className="mt-1 bg-red-50 text-red-600 ring-red-200">
                            <AlertTriangle className="h-3 w-3" />
                            Gecikmiş
                          </Badge>
                        ) : debt > 0 ? (
                          <Badge className="mt-1 bg-amber-50 text-amber-700 ring-amber-200">
                            Bekliyor
                          </Badge>
                        ) : (
                          <Badge className="mt-1 bg-emerald-50 text-emerald-600 ring-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            Güncel
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                      <Button
                        variant={isReminded ? "soft" : "outline"}
                        size="sm"
                        className="flex-1"
                        disabled={debt <= 0 || isReminded}
                        onClick={() => {
                          sendPaymentReminder(apartment.id);
                          setReminded((prev) => [...prev, apartment.id]);
                        }}
                      >
                        {isReminded ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Hatırlatıldı
                          </>
                        ) : (
                          <>
                            <Bell className="h-3.5 w-3.5" />
                            Hatırlat
                          </>
                        )}
                      </Button>
                      <Button
                        variant="soft"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setDebtApartment(apartment.id);
                          setSuccess(false);
                          setError(null);
                          setDebtOpen(true);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Borç Tanımla
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          <Segmented
            options={[
              { value: "all", label: "Tümü", count: payments.length },
              {
                value: "paid",
                label: "Ödenen",
                count: payments.filter((payment) => payment.status === "paid").length,
              },
              {
                value: "pending",
                label: "Bekleyen",
                count: payments.filter((payment) => payment.status === "pending").length,
              },
              {
                value: "overdue",
                label: "Gecikmiş",
                count: payments.filter((payment) => payment.status === "overdue").length,
              },
            ]}
            value={paymentFilter}
            onChange={setPaymentFilter}
            tone="red"
          />

          {filteredPayments.length === 0 ? (
            <EmptyState
              icon={<Receipt className="h-5 w-5" />}
              title="Ödeme kaydı yok"
              description="Bu filtrede gösterilecek kayıt bulunmuyor."
            />
          ) : (
            <Card className="divide-y divide-slate-100 p-0">
              {filteredPayments.map((payment) => {
                const meta = paymentStatusMeta[payment.status];
                return (
                  <div key={payment.id} className="flex items-center gap-3 p-4">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        payment.status === "paid"
                          ? "bg-emerald-50 text-emerald-600"
                          : payment.status === "overdue"
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-600"
                      )}
                    >
                      <CreditCard className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-800">
                        {payment.apartmentId} · {payment.period}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {payment.invoiceNo} · Son ödeme {formatDate(payment.dueDate)}
                        {payment.paidAt ? ` · Ödendi ${formatDate(payment.paidAt)}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900">
                        {currency(payment.amount)}
                      </p>
                      <Badge className={cn("mt-1", meta.className)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                        {meta.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </>
      )}

      <Modal
        open={debtOpen}
        onClose={() => setDebtOpen(false)}
        title={success ? "Borç Tanımlandı" : "Yeni Borç Tanımla"}
        description={
          success
            ? "Daireye aidat borcu eklendi ve sakin bilgilendirildi."
            : "Daire bazlı aidat/borç kaydı oluşturun."
        }
      >
        {success ? (
          <div className="flex flex-col items-center gap-3 py-3 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <p className="text-sm font-semibold text-slate-800">
              {debtApartment} dairesine borç eklendi
            </p>
            <Button
              variant="soft"
              className="mt-2 w-full"
              onClick={() => {
                setSuccess(false);
                resetDebtForm();
              }}
            >
              Yeni Borç Ekle
            </Button>
            <Button variant="primary" className="w-full" onClick={() => setDebtOpen(false)}>
              Kapat
            </Button>
          </div>
        ) : (
          <form onSubmit={submitDebt} className="space-y-4">
            <div>
              <Label htmlFor="debtApartment">Daire</Label>
              <Select
                id="debtApartment"
                value={debtApartment}
                onChange={(event) => setDebtApartment(event.target.value)}
              >
                {data.apartments.map((apartment) => (
                  <option key={apartment.id} value={apartment.id}>
                    {apartment.id} · {apartment.ownerName}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="period">Dönem</Label>
                <Input
                  id="period"
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  placeholder="Kasım 2026"
                />
              </div>
              <div>
                <Label htmlFor="amount">Tutar (TL)</Label>
                <Input
                  id="amount"
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="dueDate">Son Ödeme Tarihi</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
            {error ? (
              <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600 ring-1 ring-red-100">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
              <Wallet className="h-4 w-4" />
              Borcu Tanımla
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
