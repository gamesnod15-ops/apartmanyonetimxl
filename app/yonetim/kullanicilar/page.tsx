"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  DoorOpen,
  Mail,
  Minus,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { useStore } from "@/app/lib/store";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Label,
  Modal,
  Select,
  cn,
} from "@/app/components/ui";
import { currency, remainingRights, ticketStatusMeta } from "@/app/lib/selectors";
import { ROOMS, SERVICES, floorOf } from "@/app/lib/unit-options";

type Tab = "map" | "residents";
type PriorityChoice = "medium" | "high";

export default function AdminUsersPage() {
  const { data, createApartment, addResident, updateRights, createTicket } = useStore();
  const [tab, setTab] = useState<Tab>("map");
  const [query, setQuery] = useState("");
  const [apartmentOpen, setApartmentOpen] = useState(false);
  const [residentOpen, setResidentOpen] = useState(false);

  const [block, setBlock] = useState("A");
  const [no, setNo] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [residentCount, setResidentCount] = useState("1");
  const [totalRights, setTotalRights] = useState("6");
  const [apartmentError, setApartmentError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [apartmentId, setApartmentId] = useState(data.apartments[0]?.id ?? "");
  const [residentError, setResidentError] = useState<string | null>(null);
  const [residentSuccess, setResidentSuccess] = useState(false);
  const [createdName, setCreatedName] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [serviceKey, setServiceKey] = useState<string | null>(null);
  const [roomKey, setRoomKey] = useState<string | null>(null);
  const [priority, setPriority] = useState<PriorityChoice>("medium");
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<string | null>(null);

  const search = query.trim().toLocaleLowerCase("tr-TR");
  const filteredApartments = data.apartments.filter((apartment) => {
    if (!search) return true;
    return (
      apartment.id.toLocaleLowerCase("tr-TR").includes(search) ||
      apartment.ownerName.toLocaleLowerCase("tr-TR").includes(search)
    );
  });
  const residents = data.users
    .filter((user) => user.role === "resident")
    .filter((user) => {
      if (!search) return true;
      return (
        user.name.toLocaleLowerCase("tr-TR").includes(search) ||
        user.email.toLocaleLowerCase("tr-TR").includes(search) ||
        (user.apartmentId ?? "").toLocaleLowerCase("tr-TR").includes(search)
      );
    });
  const admins = data.users.filter((user) => user.role === "admin");
  const blocks = Array.from(new Set(data.apartments.map((item) => item.block))).sort(
    (a, b) => a.localeCompare(b, "tr")
  );

  const selected = selectedId
    ? data.apartments.find((item) => item.id === selectedId) ?? null
    : null;
  const selectedService = SERVICES.find((item) => item.key === serviceKey) ?? null;
  const selectedRoom = ROOMS.find((item) => item.key === roomKey) ?? null;
  const openTicketsFor = (apartmentIdentifier: string) =>
    data.tickets.filter(
      (ticket) =>
        ticket.apartmentId === apartmentIdentifier && ticket.status !== "resolved"
    );
  const hasDebt = (apartmentIdentifier: string) =>
    data.payments.some(
      (payment) =>
        payment.apartmentId === apartmentIdentifier && payment.status !== "paid"
    );
  const hasOverdue = (apartmentIdentifier: string) =>
    data.payments.some(
      (payment) =>
        payment.apartmentId === apartmentIdentifier && payment.status === "overdue"
    );
  const selectedTickets = selected ? openTicketsFor(selected.id) : [];

  const toneFor = (apartmentIdentifier: string) => {
    if (openTicketsFor(apartmentIdentifier).length > 0) {
      return { card: "border-red-200 bg-red-50/70", dot: "bg-red-500" };
    }
    if (hasOverdue(apartmentIdentifier)) {
      return { card: "border-rose-200 bg-rose-50/60", dot: "bg-rose-500" };
    }
    if (hasDebt(apartmentIdentifier)) {
      return { card: "border-amber-200 bg-amber-50/60", dot: "bg-amber-500" };
    }
    return { card: "border-emerald-200 bg-emerald-50/50", dot: "bg-emerald-500" };
  };

  const openDetail = (apartmentIdentifier: string) => {
    setSelectedId(apartmentIdentifier);
    setServiceKey(null);
    setRoomKey(null);
    setPriority("medium");
    setTicketError(null);
    setCreatedTicket(null);
  };

  const resetDetailForm = () => {
    setServiceKey(null);
    setRoomKey(null);
    setPriority("medium");
    setTicketError(null);
    setCreatedTicket(null);
  };

  const closeDetail = () => {
    setSelectedId(null);
    resetDetailForm();
  };

  const submitTicket = () => {
    if (!selected || !selectedService || !selectedRoom) return;
    const result = createTicket({
      apartmentId: selected.id,
      title: `${selectedService.label} arızası · ${selectedRoom.label}`,
      description: `${selected.id} dairesinde ${selectedRoom.label.toLocaleLowerCase(
        "tr-TR"
      )} bölümünde ${selectedService.label.toLocaleLowerCase("tr-TR")} sorunu bildirildi.`,
      category: selectedService.category,
      location: selectedRoom.label,
      priority,
    });
    if (!result.ok) {
      setTicketError(result.error ?? "Arıza kaydı oluşturulamadı.");
      return;
    }
    setTicketError(null);
    setCreatedTicket(`${selectedService.label} · ${selectedRoom.label}`);
  };

  const resetApartment = () => {
    setBlock("A");
    setNo("");
    setOwnerName("");
    setResidentCount("1");
    setTotalRights("6");
    setApartmentError(null);
  };

  const resetResident = () => {
    setName("");
    setEmail("");
    setPhone("");
    setApartmentId(data.apartments[0]?.id ?? "");
    setResidentError(null);
    setResidentSuccess(false);
  };

  const submitApartment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = createApartment({
      block,
      no,
      ownerName,
      residentCount: Number(residentCount),
      totalRights: Number(totalRights),
    });
    if (!result.ok) {
      setApartmentError(result.error ?? "Daire eklenemedi.");
      return;
    }
    resetApartment();
    setApartmentOpen(false);
  };

  const submitResident = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      setResidentError("Ad ve e-posta zorunlu.");
      return;
    }
    const result = addResident({ name, email, phone, apartmentId });
    if (!result.ok) {
      setResidentError(result.error ?? "Sakin eklenemedi.");
      return;
    }
    setResidentError(null);
    setResidentSuccess(true);
    setCreatedName(name.trim());
    setName("");
    setEmail("");
    setPhone("");
  };

  return (
    <div className="space-y-4">
      <section className="hero-soft hero-red p-6">
        <p className="text-xs font-medium text-red-300">Kadro & Kayıtlar</p>
        <h1 className="mt-1 text-xl font-bold">Daire Haritası</h1>
        <p className="mt-1 text-[11px] text-slate-400">
          Daire kartına dokunun; hizmet ve konum seçerek arıza kaydı açın.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/5 py-2 ring-1 ring-white/10">
            <p className="text-lg font-bold">{data.apartments.length}</p>
            <p className="text-[9px] text-slate-400">Daire</p>
          </div>
          <div className="rounded-xl bg-white/5 py-2 ring-1 ring-white/10">
            <p className="text-lg font-bold">{residents.length}</p>
            <p className="text-[9px] text-slate-400">Sakin</p>
          </div>
          <div className="rounded-xl bg-white/5 py-2 ring-1 ring-white/10">
            <p className="text-lg font-bold">{admins.length}</p>
            <p className="text-[9px] text-slate-400">Yönetici</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            variant="red"
            size="sm"
            className="flex-1"
            onClick={() => {
              resetApartment();
              setApartmentOpen(true);
            }}
          >
            <Building2 className="h-3.5 w-3.5" />
            Daire Ekle
          </Button>
          <Button
            variant="soft"
            size="sm"
            className="flex-1 bg-white/10 text-white ring-white/20 hover:bg-white/20"
            onClick={() => {
              resetResident();
              setResidentOpen(true);
            }}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Sakin Ekle
          </Button>
        </div>
      </section>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setTab("map")}
          className={cn(
            "flex-1 rounded-lg py-2 text-xs font-semibold transition",
            tab === "map" ? "bg-white text-red-700 shadow-sm" : "text-slate-500"
          )}
        >
          Bina Haritası
        </button>
        <button
          type="button"
          onClick={() => setTab("residents")}
          className={cn(
            "flex-1 rounded-lg py-2 text-xs font-semibold transition",
            tab === "residents" ? "bg-white text-red-700 shadow-sm" : "text-slate-500"
          )}
        >
          Sakinler ({residents.length})
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={
            tab === "map" ? "Daire veya sakin ara…" : "İsim, e-posta veya daire ara…"
          }
          className="pl-9"
        />
      </div>

      {tab === "map" ? (
        filteredApartments.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-5 w-5" />}
            title="Daire bulunamadı"
            description="Arama kriterlerine uygun daire yok."
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 px-1 text-[10px] font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Arıza var
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Ödeme bekliyor
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Güncel
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {blocks.map((blockName) => {
                const blockApartments = filteredApartments.filter(
                  (apartment) => apartment.block === blockName
                );
                if (blockApartments.length === 0) return null;
                const floors = Array.from(
                  new Set(blockApartments.map((apartment) => floorOf(apartment.no)))
                ).sort((a, b) => b - a);

                return (
                  <Card key={blockName} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                          <Building2 className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {blockName} Blok
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {blockApartments.length} daire
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-slate-100 text-slate-500 ring-slate-200">
                        {floors.length} kat
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-2.5">
                      {floors.map((floor) => (
                        <div key={floor} className="flex gap-2.5">
                          <div className="flex w-9 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-100">
                            <span className="text-[11px] font-bold text-slate-700">
                              {floor}
                            </span>
                            <span className="text-[7px] font-semibold uppercase tracking-wide text-slate-400">
                              Kat
                            </span>
                          </div>
                          <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3">
                            {blockApartments
                              .filter(
                                (apartment) => floorOf(apartment.no) === floor
                              )
                              .sort((a, b) => Number(a.no) - Number(b.no))
                              .map((apartment) => {
                                const tone = toneFor(apartment.id);
                                const openCount = openTicketsFor(apartment.id).length;
                                const debt = hasDebt(apartment.id);
                                return (
                                  <button
                                    key={apartment.id}
                                    type="button"
                                    onClick={() => openDetail(apartment.id)}
                                    className={cn(
                                      "group relative flex flex-col rounded-xl border p-2.5 text-left transition hover:-translate-y-0.5 hover:shadow-md",
                                      tone.card,
                                      selectedId === apartment.id &&
                                        "ring-2 ring-red-400 ring-offset-1"
                                    )}
                                  >
                                    <span className="flex items-center justify-between">
                                      <span className="text-sm font-extrabold tracking-tight text-slate-900">
                                        {apartment.id}
                                      </span>
                                      <span
                                        className={cn(
                                          "h-2 w-2 rounded-full",
                                          tone.dot
                                        )}
                                      />
                                    </span>
                                    <span className="mt-0.5 truncate text-[10px] font-medium text-slate-500">
                                      {apartment.ownerName}
                                    </span>
                                    <span className="mt-1.5 flex items-center gap-1">
                                      {openCount > 0 ? (
                                        <span className="flex items-center gap-0.5 rounded bg-white/80 px-1.5 py-0.5 text-[9px] font-bold text-red-600 ring-1 ring-red-100">
                                          <Wrench className="h-2.5 w-2.5" />
                                          {openCount}
                                        </span>
                                      ) : null}
                                      {debt ? (
                                        <span className="flex items-center gap-0.5 rounded bg-white/80 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 ring-1 ring-amber-100">
                                          <Wallet className="h-2.5 w-2.5" />
                                        </span>
                                      ) : null}
                                      {openCount === 0 && !debt ? (
                                        <span className="text-[9px] font-medium text-emerald-600">
                                          Güncel
                                        </span>
                                      ) : null}
                                    </span>
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 py-2 text-[9px] font-medium text-slate-400">
                        <DoorOpen className="h-3 w-3" />
                        Giriş / Lobi
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )
      ) : residents.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="Sakin bulunamadı"
          description="Arama kriterlerine uygun sakin yok."
        />
      ) : (
        <div className="space-y-3">
          {residents.map((user) => (
            <Card key={user.id} className="flex items-center gap-3 p-4">
              <Avatar
                name={user.name}
                color={user.avatarColor}
                className="h-11 w-11 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-slate-500">
                  <Mail className="h-3 w-3 shrink-0" />
                  {user.email}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                  <Phone className="h-3 w-3 shrink-0" />
                  {user.phone || "Telefon yok"}
                </p>
              </div>
              <Badge className="shrink-0 bg-red-50 text-red-700 ring-red-200">
                {user.apartmentId ?? "—"}
              </Badge>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-4">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <ShieldCheck className="h-4 w-4 text-red-600" />
          Yönetim Ekibi
        </p>
        <div className="space-y-3">
          {admins.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <Avatar
                name={user.name}
                color={user.avatarColor}
                className="h-9 w-9 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">{user.name}</p>
                <p className="text-[10px] text-slate-400">{user.title ?? "Yönetici"}</p>
              </div>
              <Badge className="bg-slate-900 text-white ring-slate-900">Admin</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        open={Boolean(selected)}
        onClose={closeDetail}
        title={selected ? `${selected.id} · ${selected.ownerName}` : "Daire"}
        description={
          selected
            ? `${selected.block} Blok · ${selected.residentCount} sakin · ${remainingRights(
                selected
              )}/${selected.rights.total} arıza hakkı`
            : undefined
        }
      >
        {selected ? (
          createdTicket ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
                <CheckCircle2 className="h-8 w-8" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{createdTicket}</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {selected.id} için arıza kaydı açıldı, sakin bilgilendirildi.
                </p>
              </div>
              <div className="mt-1 flex w-full gap-2">
                <Button variant="soft" className="flex-1" onClick={resetDetailForm}>
                  Yeni Kayıt
                </Button>
                <Link
                  href="/yonetim/arizalar"
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-sm shadow-red-600/20 transition hover:bg-red-700"
                >
                  Arızalar
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-slate-50 p-2.5 text-center ring-1 ring-slate-100">
                  <p className="text-[9px] uppercase tracking-wide text-slate-400">
                    Bakiye
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-xs font-bold",
                      selected.balance < 0 ? "text-red-600" : "text-emerald-600"
                    )}
                  >
                    {currency(selected.balance)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 text-center ring-1 ring-slate-100">
                  <p className="text-[9px] uppercase tracking-wide text-slate-400">
                    Açık arıza
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-slate-800">
                    {selectedTickets.length}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 text-center ring-1 ring-slate-100">
                  <p className="text-[9px] uppercase tracking-wide text-slate-400">
                    Kalan hak
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-slate-800">
                    {remainingRights(selected)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
                <div>
                  <p className="text-[11px] font-semibold text-slate-700">Arıza hakkı</p>
                  <p className="text-[10px] text-slate-400">
                    {selected.rights.used} kullanıldı · {remainingRights(selected)} kaldı
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={selected.rights.total <= selected.rights.used}
                    onClick={() =>
                      updateRights(selected.id, selected.rights.total - 1)
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Hakkı azalt"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-slate-800">
                    {selected.rights.total}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateRights(selected.id, selected.rights.total + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100"
                    aria-label="Hakkı artır"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {selectedTickets.length > 0 ? (
                <div>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Açık arızalar
                  </p>
                  <div className="space-y-1.5">
                    {selectedTickets.slice(0, 3).map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-slate-100"
                      >
                        <span className="truncate text-[10px] font-medium text-slate-600">
                          {ticket.title}
                        </span>
                        <Badge className={cn("shrink-0", ticketStatusMeta[ticket.status].className)}>
                          {ticketStatusMeta[ticket.status].label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <p className="mb-2 text-[11px] font-bold text-slate-700">
                  1 · Hizmet türü
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {SERVICES.map((service) => {
                    const Icon = service.icon;
                    const active = serviceKey === service.key;
                    return (
                      <button
                        key={service.key}
                        type="button"
                        onClick={() => setServiceKey(service.key)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-[10px] font-semibold transition",
                          active
                            ? "border-red-300 bg-red-50 text-red-700 ring-1 ring-red-200"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {service.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-bold text-slate-700">2 · Konum</p>
                <div className="grid grid-cols-3 gap-2">
                  {ROOMS.map((room) => {
                    const Icon = room.icon;
                    const active = roomKey === room.key;
                    return (
                      <button
                        key={room.key}
                        type="button"
                        onClick={() => setRoomKey(room.key)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-[10px] font-semibold transition",
                          active
                            ? "border-slate-800 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {room.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
                <span className="text-[11px] font-semibold text-slate-700">Öncelik</span>
                <div className="flex gap-1 rounded-lg bg-white p-0.5 ring-1 ring-slate-200">
                  {(["medium", "high"] as PriorityChoice[]).map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => setPriority(choice)}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-[10px] font-semibold transition",
                        priority === choice
                          ? choice === "high"
                            ? "bg-red-50 text-red-600"
                            : "bg-slate-100 text-slate-700"
                          : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {choice === "medium" ? "Normal" : "Acil"}
                    </button>
                  ))}
                </div>
              </div>

              {ticketError ? (
                <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600 ring-1 ring-red-100">
                  {ticketError}
                </p>
              ) : null}

              <Button
                variant="red"
                className="w-full"
                disabled={!selectedService || !selectedRoom}
                onClick={submitTicket}
              >
                <Wrench className="h-4 w-4" />
                Arıza Kaydı Aç
              </Button>
              <p className="text-center text-[10px] text-slate-400">
                Seçimler yeni bir arıza kaydı oluşturur.
              </p>
            </div>
          )
        ) : null}
      </Modal>

      <Modal
        open={apartmentOpen}
        onClose={() => setApartmentOpen(false)}
        title="Yeni Daire"
        description="Blok ve daire numarası benzersiz olmalıdır."
      >
        <form onSubmit={submitApartment} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="block">Blok</Label>
              <Input
                id="block"
                value={block}
                onChange={(event) => setBlock(event.target.value)}
                placeholder="A"
                maxLength={3}
              />
            </div>
            <div>
              <Label htmlFor="no">Daire No</Label>
              <Input
                id="no"
                value={no}
                onChange={(event) => setNo(event.target.value)}
                placeholder="15"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="ownerName">Malik / Sakin Adı</Label>
            <Input
              id="ownerName"
              value={ownerName}
              onChange={(event) => setOwnerName(event.target.value)}
              placeholder="Örn. Ayşe Yılmaz"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="residentCount">Sakin Sayısı</Label>
              <Input
                id="residentCount"
                type="number"
                min={1}
                value={residentCount}
                onChange={(event) => setResidentCount(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="totalRights">Arıza Hakkı</Label>
              <Input
                id="totalRights"
                type="number"
                min={1}
                value={totalRights}
                onChange={(event) => setTotalRights(event.target.value)}
              />
            </div>
          </div>
          {apartmentError ? (
            <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600 ring-1 ring-red-100">
              {apartmentError}
            </p>
          ) : null}
          <Button type="submit" variant="red" className="w-full">
            <Building2 className="h-4 w-4" />
            Daireyi Kaydet
          </Button>
        </form>
      </Modal>

      <Modal
        open={residentOpen}
        onClose={() => setResidentOpen(false)}
        title={residentSuccess ? "Sakin Eklendi" : "Yeni Sakin"}
        description={
          residentSuccess
            ? "Sakinin geçici şifresi 1234 olarak oluşturuldu."
            : "Sakin hesabı oluşturun; giriş şifresi 1234 olacaktır."
        }
      >
        {residentSuccess ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-6 text-center ring-1 ring-emerald-100">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <UserPlus className="h-7 w-7" />
              </span>
              <p className="text-sm font-semibold text-emerald-900">
                {createdName} eklendi
              </p>
              <p className="text-[11px] text-emerald-700">
                Giriş şifresi: <span className="font-mono font-bold">1234</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="soft" className="flex-1" onClick={resetResident}>
                Yeni Sakin
              </Button>
              <Button variant="red" className="flex-1" onClick={() => setResidentOpen(false)}>
                Kapat
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submitResident} className="space-y-4">
            <div>
              <Label htmlFor="name">Ad Soyad</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Örn. Mehmet Demir"
              />
            </div>
            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ornek@apartman.com"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="05xx xxx xx xx"
                autoComplete="tel"
              />
            </div>
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
            {residentError ? (
              <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600 ring-1 ring-red-100">
                {residentError}
              </p>
            ) : null}
            <Button type="submit" variant="red" className="w-full">
              <Users className="h-4 w-4" />
              Sakini Kaydet
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
