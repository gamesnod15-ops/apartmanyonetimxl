"use client";

import { useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Download,
  Lock,
  Receipt,
  ShieldCheck,
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
  Segmented,
  cn,
} from "@/app/components/ui";
import {
  currency,
  formatDate,
  paymentStatusMeta,
} from "@/app/lib/selectors";

type Filter = "all" | "unpaid" | "paid";

export default function DairePaymentsPage() {
  const { data, user, payPayment } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [payId, setPayId] = useState<string | null>(null);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const apartment = data.apartments.find((item) => item.id === user.apartmentId);
  const payments = data.payments
    .filter((payment) => payment.apartmentId === apartment?.id)
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  const unpaid = payments.filter((payment) => payment.status !== "paid");
  const paidPayments = payments.filter((payment) => payment.status === "paid");
  const unpaidTotal = unpaid.reduce((sum, payment) => sum + payment.amount, 0);
  const paidTotal = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);

  const filtered =
    filter === "all"
      ? payments
      : filter === "paid"
        ? paidPayments
        : unpaid;

  const selected = payments.find((payment) => payment.id === payId) ?? null;

  const closeModal = () => {
    setPayId(null);
    setCardName("");
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setProcessing(false);
    setPaid(false);
    setError(null);
  };

  const submitPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    const digits = cardNumber.replace(/\s/g, "");
    if (digits.length !== 16) {
      setError("Kart numarası 16 haneli olmalıdır.");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError("Son kullanma tarihini AA/YY formatında girin.");
      return;
    }
    if (cvv.length !== 3) {
      setError("CVV kodu 3 haneli olmalıdır.");
      return;
    }
    setError(null);
    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    payPayment(selected.id);
    setProcessing(false);
    setPaid(true);
  };

  const filters: Array<{ value: Filter; label: string; count: number }> = [
    { value: "all", label: "Tümü", count: payments.length },
    { value: "unpaid", label: "Bekleyen", count: unpaid.length },
    { value: "paid", label: "Ödenen", count: paidPayments.length },
  ];

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden hero-soft p-6">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <p className="text-xs font-medium text-emerald-100">Toplam Bekleyen</p>
        <p className="mt-1 text-3xl font-bold tracking-tight">{currency(unpaidTotal)}</p>
        <p className="mt-1 text-[11px] text-emerald-100">
          {unpaid.length} bekleyen ödeme · Toplam ödenen {currency(paidTotal)}
        </p>
        {unpaid.length > 0 ? (
          <Button
            onClick={() => setPayId(unpaid[0].id)}
            className="mt-4 bg-white text-emerald-700 hover:bg-emerald-50"
            size="sm"
          >
            <CreditCard className="h-4 w-4" />
            En Yakın Ödemeyi Yap
          </Button>
        ) : (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-[11px] font-semibold ring-1 ring-white/20">
            <CheckCircle2 className="h-4 w-4" />
            Tüm ödemeleriniz tamamlandı
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-[11px] font-medium text-slate-500">Bekleyen</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{currency(unpaidTotal)}</p>
          <p className="text-[10px] text-slate-400">{unpaid.length} adet ödeme</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-medium text-slate-500">Ödenen</p>
          <p className="mt-1 text-lg font-bold text-emerald-600">{currency(paidTotal)}</p>
          <p className="text-[10px] text-slate-400">{paidPayments.length} adet ödeme</p>
        </Card>
      </div>

      <Segmented options={filters} value={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-5 w-5" />}
          title="Ödeme kaydı bulunamadı"
          description="Bu filtrede gösterilecek aidat kaydı yok."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((payment) => {
            const meta = paymentStatusMeta[payment.status];
            return (
              <Card key={payment.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        payment.status === "paid"
                          ? "bg-emerald-50 text-emerald-600"
                          : payment.status === "overdue"
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-600"
                      )}
                    >
                      <Wallet className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {payment.period} Aidatı
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Son ödeme: {formatDate(payment.dueDate)} · {payment.invoiceNo}
                      </p>
                      {payment.paidAt ? (
                        <p className="text-[10px] text-emerald-600">
                          Ödendi: {formatDate(payment.paidAt)} · {payment.method}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-slate-900">
                      {currency(payment.amount)}
                    </p>
                    <Badge className={cn("mt-1", meta.className)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                      {meta.label}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Receipt className="h-3.5 w-3.5" />
                    e-Arşiv fatura
                  </span>
                  {payment.status === "paid" ? (
                    <Button variant="soft" size="sm">
                      <Download className="h-3.5 w-3.5" />
                      Makbuz
                    </Button>
                  ) : (
                    <Button
                      variant={payment.status === "overdue" ? "red" : "blue"}
                      size="sm"
                      onClick={() => setPayId(payment.id)}
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      Öde
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(selected) && !paid}
        onClose={closeModal}
        title="Güvenli Ödeme"
        description={
          selected
            ? `${selected.period} aidatı · ${currency(selected.amount)}`
            : undefined
        }
      >
        {selected ? (
          <form onSubmit={submitPayment} className="space-y-4">
            <div className="rounded-[20px] bg-[#1c2230] p-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wider text-blue-100">
                  Apartman Yönetim
                </span>
                <CreditCard className="h-4 w-4 text-blue-100" />
              </div>
              <p className="mt-4 font-mono text-base tracking-widest">
                {cardNumber
                  ? cardNumber.padEnd(19, "•")
                  : "•••• •••• •••• ••••"}
              </p>
              <div className="mt-3 flex items-center justify-between text-[10px] text-blue-100">
                <span>{cardName || "KART SAHİBİ"}</span>
                <span>{expiry || "AA/YY"}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="cardName">Kart Üzerindeki İsim</Label>
              <Input
                id="cardName"
                value={cardName}
                onChange={(event) => setCardName(event.target.value)}
                placeholder="Ad Soyad"
                required
              />
            </div>

            <div>
              <Label htmlFor="cardNumber">Kart Numarası</Label>
              <Input
                id="cardNumber"
                inputMode="numeric"
                value={cardNumber}
                onChange={(event) => {
                  const digits = event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 16)
                    .replace(/(\d{4})(?=\d)/g, "$1 ");
                  setCardNumber(digits);
                }}
                placeholder="0000 0000 0000 0000"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="expiry">Son Kullanma</Label>
                <Input
                  id="expiry"
                  inputMode="numeric"
                  value={expiry}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
                    setExpiry(
                      digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
                    );
                  }}
                  placeholder="AA/YY"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  inputMode="numeric"
                  type="password"
                  value={cvv}
                  onChange={(event) =>
                    setCvv(event.target.value.replace(/\D/g, "").slice(0, 3))
                  }
                  placeholder="123"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-100">
              <Lock className="h-3.5 w-3.5" />
              256-bit SSL ile şifrelenmiş sanal POS demo ortamı
            </div>

            {error ? (
              <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600 ring-1 ring-red-100">
                {error}
              </p>
            ) : null}

            <Button type="submit" variant="blue" className="w-full" disabled={processing}>
              {processing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  İşleniyor…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  {currency(selected.amount)} Öde
                </>
              )}
            </Button>
          </form>
        ) : null}
      </Modal>

      <Modal
        open={paid}
        onClose={closeModal}
        title="Ödeme Başarılı"
        description="Aidat ödemeniz başarıyla tamamlandı."
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <p className="text-sm font-semibold text-slate-800">
            {selected ? `${selected.period} aidatı ödendi` : "Ödeme tamamlandı"}
          </p>
          <p className="text-[11px] text-slate-500">
            Makbuzunuz e-Arşiv fatura olarak hesabınıza tanımlandı.
          </p>
          <Button variant="blue" className="mt-2 w-full" onClick={closeModal}>
            Tamam
          </Button>
        </div>
      </Modal>
    </div>
  );
}
