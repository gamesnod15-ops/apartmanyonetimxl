"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  CircleHelp,
  ImagePlus,
  MapPin,
  Send,
  ShieldCheck,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { useStore } from "@/app/lib/store";
import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  Stepper,
  Textarea,
  cn,
} from "@/app/components/ui";
import { priorityMeta, remainingRights, ticketStatusMeta } from "@/app/lib/selectors";
import { ROOMS, SERVICES } from "@/app/lib/unit-options";
import type { Priority } from "@/app/lib/types";

const SERVICE_OPTIONS: Array<{
  key: string;
  label: string;
  category: string;
  icon: LucideIcon;
}> = [...SERVICES, { key: "diger", label: "Diğer", category: "Diğer", icon: CircleHelp }];

const STEPS = [
  { label: "Konum" },
  { label: "Arıza türü" },
  { label: "Detaylar" },
  { label: "Fotoğraf", optional: true },
  { label: "Onay" },
];

const PRIORITIES: Array<{ key: Priority; hint: string }> = [
  { key: "low", hint: "Acelesi yok" },
  { key: "medium", hint: "Birkaç gün içinde" },
  { key: "high", hint: "Hemen bakılmalı" },
];

const MAX_PHOTO_BYTES = 900 * 1024;

export default function NewTicketPage() {
  return (
    <Suspense fallback={null}>
      <NewTicketWizard />
    </Suspense>
  );
}

function NewTicketWizard() {
  const { data, user, createTicket } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoom = ROOMS.some((room) => room.key === searchParams.get("oda"))
    ? searchParams.get("oda")
    : null;

  const [step, setStep] = useState(initialRoom ? 1 : 0);
  const [roomKey, setRoomKey] = useState<string | null>(initialRoom);
  const [serviceKey, setServiceKey] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [titleEdited, setTitleEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [photo, setPhoto] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const apartment = data.apartments.find((item) => item.id === user.apartmentId);
  const rights = remainingRights(apartment);
  const room = ROOMS.find((item) => item.key === roomKey) ?? null;
  const service = SERVICE_OPTIONS.find((item) => item.key === serviceKey) ?? null;
  const roomOpenIssues = room
    ? data.tickets.filter(
        (ticket) =>
          ticket.apartmentId === apartment?.id &&
          ticket.status !== "resolved" &&
          ticket.location === room.label
      )
    : [];

  const suggestedTitle = (nextService = service, nextRoom = room) =>
    nextService && nextRoom ? `${nextService.label} arızası · ${nextRoom.label}` : "";

  const goTo = (next: number) => {
    setError(null);
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateDetails = () => {
    if (title.trim().length < 5) return "Arıza başlığı en az 5 karakter olmalı.";
    if (description.trim().length < 10)
      return "Lütfen arızayı en az 10 karakterle açıklayın.";
    return null;
  };

  const canContinue =
    step === 0 ? Boolean(room) : step === 1 ? Boolean(service) : true;

  const next = () => {
    if (step === 2) {
      const problem = validateDetails();
      if (problem) {
        setError(problem);
        return;
      }
    }
    if (canContinue) goTo(step + 1);
  };

  const pickRoom = (key: string) => {
    setRoomKey(key);
    const nextRoom = ROOMS.find((item) => item.key === key) ?? null;
    if (!titleEdited) setTitle(suggestedTitle(service, nextRoom));
    goTo(1);
  };

  const pickService = (key: string) => {
    setServiceKey(key);
    const nextService = SERVICE_OPTIONS.find((item) => item.key === key) ?? null;
    if (!titleEdited) setTitle(suggestedTitle(nextService, room));
    goTo(2);
  };

  const onPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Lütfen bir görsel dosyası seçin.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError("Fotoğraf boyutu en fazla 900 KB olabilir.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(typeof reader.result === "string" ? reader.result : undefined);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(undefined);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = () => {
    if (!room || !service) return;
    const problem = validateDetails();
    if (problem) {
      setError(problem);
      goTo(2);
      return;
    }
    const result = createTicket({
      title,
      description,
      category: service.category,
      location: room.label,
      priority,
      photo,
    });
    if (!result.ok) {
      setError(result.error ?? "Arıza kaydı oluşturulamadı.");
      return;
    }
    setCreatedId(result.id ?? "ok");
  };

  if (createdId) {
    return (
      <div className="mx-auto max-w-xl">
        <Card className="flex flex-col items-center px-6 py-10 text-center animate-pop">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="mt-5 text-lg font-bold tracking-tight text-slate-900">
            Arıza kaydınız alındı
          </h1>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{title}</span> için yönetim
            bilgilendirildi. Durumu Arızalarım sayfasından takip edebilirsiniz.
          </p>
          <Badge className={cn("mt-4", ticketStatusMeta.pending.className)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", ticketStatusMeta.pending.dot)} />
            {ticketStatusMeta.pending.label}
          </Badge>
          <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="sm:flex-1" onClick={() => router.push("/daire")}>
              Ana Panel
            </Button>
            <Button variant="blue" className="sm:flex-1" onClick={() => router.push("/daire/arizalar")}>
              Arızalarım
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">
              Adım {step + 1} / {STEPS.length}
            </p>
            <h1 className="text-base font-bold tracking-tight text-slate-900">
              Yeni Arıza Kaydı
            </h1>
          </div>
          <Link
            href="/daire/arizalar"
            className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            Vazgeç
          </Link>
        </div>
        <Stepper steps={STEPS} current={step} onStepClick={goTo} />
      </Card>

      <Card key={step} className="animate-fade-up">
        {step === 0 ? (
          <StepIntro
            title="Arıza nerede?"
            text="Sorunun olduğu bölümü seçin."
          >
            <div className="grid auto-rows-[84px] grid-cols-4 gap-2 sm:auto-rows-[96px] sm:gap-3">
              {ROOMS.map((item) => {
                const selected = item.key === roomKey;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => pickRoom(item.key)}
                    className={cn(
                      "flex flex-col items-start justify-between rounded-2xl p-3 text-left ring-1 transition active:scale-[0.98]",
                      item.span,
                      selected
                        ? "bg-blue-50 ring-2 ring-blue-500"
                        : "bg-slate-50 ring-slate-200 hover:bg-white hover:shadow-soft hover:ring-blue-300"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-xl",
                        selected ? "bg-blue-600 text-white" : "bg-white text-blue-600 ring-1 ring-slate-200"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        selected ? "text-blue-700" : "text-slate-700"
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </StepIntro>
        ) : null}

        {step === 1 ? (
          <StepIntro
            title="Ne tür bir arıza?"
            text={room ? `${room.label} için arıza türünü seçin.` : "Arıza türünü seçin."}
          >
            {roomOpenIssues.length > 0 ? (
              <div className="mb-4 rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200">
                <p className="text-[11px] font-semibold text-amber-800">
                  Bu bölümde zaten {roomOpenIssues.length} açık kaydınız var:
                </p>
                <ul className="mt-1 space-y-0.5">
                  {roomOpenIssues.map((ticket) => (
                    <li key={ticket.id} className="truncate text-[11px] text-amber-700">
                      • {ticket.title} ({ticketStatusMeta[ticket.status].label})
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {SERVICE_OPTIONS.map((item) => {
                const selected = item.key === serviceKey;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => pickService(item.key)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl px-3 py-4 text-xs font-semibold ring-1 transition active:scale-[0.98]",
                      selected
                        ? "bg-blue-50 text-blue-700 ring-2 ring-blue-500"
                        : "bg-slate-50 text-slate-600 ring-slate-200 hover:bg-white hover:shadow-soft hover:ring-blue-300"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        selected ? "bg-blue-600 text-white" : "bg-white text-blue-600 ring-1 ring-slate-200"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </StepIntro>
        ) : null}

        {step === 2 ? (
          <StepIntro title="Arızayı anlatın" text="Teknik ekibin hazırlıklı gelmesine yardımcı olur.">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Başlık</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setTitleEdited(true);
                  }}
                  placeholder="Örn. Banyo musluğu su kaçırıyor"
                />
              </div>
              <div>
                <Label htmlFor="description" hint={`${description.trim().length} / en az 10`}>
                  Açıklama
                </Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Sorun ne zaman başladı, nasıl fark ettiniz?"
                />
              </div>
              <div>
                <Label>Öncelik</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PRIORITIES.map((item) => {
                    const selected = priority === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setPriority(item.key)}
                        className={cn(
                          "rounded-2xl px-2 py-3 text-center ring-1 transition",
                          selected
                            ? item.key === "high"
                              ? "bg-red-50 text-red-700 ring-2 ring-red-400"
                              : "bg-blue-50 text-blue-700 ring-2 ring-blue-500"
                            : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <span className="block text-xs font-bold">
                          {priorityMeta[item.key].label}
                        </span>
                        <span className="mt-0.5 block text-[10px] opacity-75">{item.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </StepIntro>
        ) : null}

        {step === 3 ? (
          <StepIntro
            title="Fotoğraf eklemek ister misiniz?"
            text="Opsiyonel: bir fotoğraf arızanın daha hızlı anlaşılmasını sağlar. İsterseniz bu adımı atlayabilirsiniz."
          >
            {photo ? (
              <div className="relative overflow-hidden rounded-2xl ring-1 ring-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt="Arıza fotoğrafı" className="h-56 w-full object-cover" />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute right-2 top-2 flex items-center gap-1 rounded-xl bg-slate-900/70 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur"
                >
                  <X className="h-3.5 w-3.5" />
                  Kaldır
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-slate-500 transition hover:border-blue-400 hover:bg-blue-50/40 hover:text-blue-600"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                  <ImagePlus className="h-6 w-6" />
                </span>
                <span className="text-sm font-semibold">Fotoğraf seç veya çek</span>
                <span className="text-[11px] text-slate-400">JPG, PNG · en fazla 900 KB</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPhoto}
              className="hidden"
            />
          </StepIntro>
        ) : null}

        {step === 4 && room && service ? (
          <StepIntro title="Kontrol edin ve gönderin" text="Bilgiler doğruysa kaydı gönderin.">
            <dl className="divide-y divide-slate-100 overflow-hidden rounded-2xl ring-1 ring-slate-200">
              <SummaryRow label="Konum" onEdit={() => goTo(0)}>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  {room.label} · Daire {apartment?.id}
                </span>
              </SummaryRow>
              <SummaryRow label="Arıza türü" onEdit={() => goTo(1)}>
                <span className="flex items-center gap-1.5">
                  <service.icon className="h-3.5 w-3.5 text-blue-600" />
                  {service.label}
                </span>
              </SummaryRow>
              <SummaryRow label="Başlık" onEdit={() => goTo(2)}>
                {title}
              </SummaryRow>
              <SummaryRow label="Açıklama" onEdit={() => goTo(2)}>
                <span className="whitespace-pre-line font-normal text-slate-600">
                  {description}
                </span>
              </SummaryRow>
              <SummaryRow label="Öncelik" onEdit={() => goTo(2)}>
                <Badge className={priorityMeta[priority].className}>
                  {priorityMeta[priority].label}
                </Badge>
              </SummaryRow>
              <SummaryRow label="Fotoğraf" onEdit={() => goTo(3)}>
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="Arıza fotoğrafı" className="h-16 w-24 rounded-lg object-cover" />
                ) : (
                  <span className="font-normal text-slate-400">Eklenmedi</span>
                )}
              </SummaryRow>
            </dl>
            <div
              className={cn(
                "mt-4 flex items-start gap-2 rounded-2xl px-3 py-2.5 text-[11px] font-medium ring-1",
                rights > 0
                  ? "bg-blue-50 text-blue-700 ring-blue-100"
                  : "bg-amber-50 text-amber-800 ring-amber-200"
              )}
            >
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {rights > 0
                ? `Bu kayıt 1 ücretsiz arıza hakkı kullanır (kalan: ${rights}).`
                : "Ücretsiz hakkınız kalmadı; talep ücretli destek olarak değerlendirilecek."}
            </div>
          </StepIntro>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600 ring-1 ring-red-100">
            {error}
          </p>
        ) : null}
      </Card>

      <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-20 flex gap-2 rounded-2xl bg-[#f2f2f7]/90 p-2 backdrop-blur-xl md:bottom-4">
        {step > 0 ? (
          <Button variant="outline" className="flex-1" onClick={() => goTo(step - 1)}>
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Button>
        ) : (
          <Link href="/daire/arizalar" className="flex-1">
            <Button variant="outline" className="w-full">
              Vazgeç
            </Button>
          </Link>
        )}
        {step === 3 ? (
          <Button variant="blue" className="flex-[2]" onClick={next}>
            {photo ? (
              <>
                Devam
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Fotoğrafsız devam et
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        ) : step === 4 ? (
          <Button variant="blue" className="flex-[2]" onClick={submit}>
            <Send className="h-4 w-4" />
            Kaydı Gönder
          </Button>
        ) : (
          <Button variant="blue" className="flex-[2]" disabled={!canContinue} onClick={next}>
            Devam
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {step === 3 && !photo ? (
        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
          <Camera className="h-3.5 w-3.5" />
          Fotoğraf zorunlu değildir.
        </p>
      ) : null}
      {step === 0 ? (
        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
          <Wrench className="h-3.5 w-3.5" />
          {rights} ücretsiz arıza hakkınız var.
        </p>
      ) : null}
    </div>
  );
}

function StepIntro({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
      <p className="mb-4 mt-0.5 text-xs leading-5 text-slate-500">{text}</p>
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  onEdit,
  children,
}: {
  label: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 bg-white px-4 py-3">
      <div className="min-w-0 flex-1 sm:flex sm:gap-3">
        <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:w-24 sm:shrink-0 sm:pt-0.5 sm:text-[11px]">
          {label}
        </dt>
        <dd className="mt-0.5 min-w-0 flex-1 break-words text-sm font-semibold text-slate-800 sm:mt-0">
          {children}
        </dd>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
      >
        Düzenle
      </button>
    </div>
  );
}
