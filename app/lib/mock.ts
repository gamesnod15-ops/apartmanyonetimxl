import type {
  Announcement,
  Apartment,
  AppData,
  AppNotification,
  BuildingEvent,
  Meeting,
  PackageItem,
  Payment,
  Poll,
  RegistrationRequest,
  Ticket,
  Transfer,
  User,
} from "./types";

const iso = (date: Date) => date.toISOString();

const shift = (days: number, hours = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hours);
  return iso(date);
};

const monthLabel = (offset: number) => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + offset);
  return date.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
};

const monthDue = (offset: number) => {
  const date = new Date();
  date.setDate(15);
  date.setMonth(date.getMonth() + offset);
  return iso(date);
};

const monthPaid = (offset: number) => {
  const date = new Date();
  date.setDate(10);
  date.setMonth(date.getMonth() + offset);
  return iso(date);
};

const names = [
  "Ahmet Yılmaz",
  "Ayşe Kaya",
  "Murat Şahin",
  "Fatma Çelik",
  "Mustafa Aydın",
  "Zeynep Arslan",
  "Emre Doğan",
  "Elif Koç",
  "Burak Yıldız",
  "Merve Öztürk",
  "Hasan Aksoy",
  "Selin Polat",
  "Kerem Erdem",
  "Deniz Kurt",
  "Cem Tunç",
  "Nihal Yalçın",
  "Okan Şen",
  "Gamze Kılıç",
  "Tolga Uçar",
  "Derya Aktaş",
];

const apartments: Apartment[] = Array.from({ length: 20 }).map((_, index) => {
  const block = index < 12 ? "A" : "B";
  const no = index < 12 ? index + 1 : index - 11;
  const id = `${block}-${no}`;
  const isResident = id === "A-12";
  const used = isResident ? 2 : (index % 4) + 1;
  return {
    id,
    block,
    no: String(no),
    ownerName: isResident ? "Ahmet Yılmaz" : names[index] ?? `Sakin ${index + 1}`,
    residentCount: (index % 3) + 1,
    balance: index % 5 === 0 ? 0 : index % 3 === 0 ? -1500 : 0,
    rights: { total: isResident ? 6 : 5, used },
  };
});

const users: User[] = [
  {
    id: "u-res-ahmet",
    name: "Ahmet Yılmaz",
    role: "resident",
    email: "ahmet@apartman.com",
    password: "1234",
    phone: "+90 532 000 00 01",
    apartmentId: "A-12",
    avatarColor: "bg-blue-500",
  },
  {
    id: "u-res-ayse",
    name: "Ayşe Kaya",
    role: "resident",
    email: "ayse@apartman.com",
    password: "1234",
    phone: "+90 532 000 00 02",
    apartmentId: "A-2",
    avatarColor: "bg-sky-500",
  },
  {
    id: "u-admin",
    name: "Mehmet Demir",
    role: "admin",
    email: "yonetim@apartman.com",
    password: "1234",
    phone: "+90 532 000 00 10",
    title: "Site Yöneticisi",
    avatarColor: "bg-blue-600",
  },
  {
    id: "u-tech",
    name: "Burak Koç",
    role: "admin",
    email: "teknik@apartman.com",
    password: "1234",
    phone: "+90 532 000 00 11",
    title: "Teknik Sorumlu",
    avatarColor: "bg-indigo-500",
  },
];

const tickets: Ticket[] = [
  {
    id: "t-1",
    apartmentId: "A-12",
    title: "Banyo musluğu su kaçırıyor",
    description:
      "Banyodaki lavabo musluğu damlalık yapıyor. Alt dolap sürekli ıslanıyor, bir an önce bakılması gerekiyor.",
    category: "Tesisat",
    priority: "medium",
    status: "in_progress",
    createdAt: shift(-2, -3),
    updatedAt: shift(-1, 2),
    assignedTo: "Burak Koç",
    messages: [
      {
        id: "tm-1",
        authorId: "u-res-ahmet",
        authorName: "Ahmet Yılmaz",
        text: "Musluk altındaki dolap kapağı da şişmeye başladı.",
        at: shift(-2, -3),
      },
      {
        id: "tm-2",
        authorId: "u-tech",
        authorName: "Burak Koç",
        text: "Yarın sabah 10:00'da teknik ekip kontrole gelecek.",
        at: shift(-1, 2),
      },
    ],
  },
  {
    id: "t-2",
    apartmentId: "A-12",
    title: "Koridor aydınlatması çalışmıyor",
    description: "3. kat koridorundaki iki lamba bir haftadır yanmıyor.",
    category: "Elektrik",
    priority: "low",
    status: "pending",
    createdAt: shift(-5, -1),
    updatedAt: shift(-5, -1),
    messages: [],
  },
  {
    id: "t-3",
    apartmentId: "A-12",
    title: "Asansör kabininde sürtünme sesi",
    description: "Asansör 4. kattan geçerken metalik bir ses geliyor.",
    category: "Asansör",
    priority: "high",
    status: "resolved",
    createdAt: shift(-14, -2),
    updatedAt: shift(-10, 4),
    assignedTo: "Burak Koç",
    messages: [
      {
        id: "tm-3",
        authorId: "u-tech",
        authorName: "Burak Koç",
        text: "Ray yağlaması yapıldı, test sürüşü sorunsuz.",
        at: shift(-10, 4),
      },
    ],
  },
  {
    id: "t-4",
    apartmentId: "A-5",
    title: "Çatı katında su akıntısı var",
    description: "Yoğun yağışta tavan köşesinden su geliyor.",
    category: "Tesisat",
    priority: "high",
    status: "pending",
    createdAt: shift(-1, -4),
    updatedAt: shift(-1, -4),
    messages: [],
  },
  {
    id: "t-5",
    apartmentId: "B-3",
    title: "Ana kapı otomatiği arızalı",
    description: "B Blok giriş kapısı dairelerden açılmıyor.",
    category: "Güvenlik",
    priority: "high",
    status: "in_progress",
    createdAt: shift(-3, -6),
    updatedAt: shift(0, -5),
    assignedTo: "Burak Koç",
    messages: [],
  },
  {
    id: "t-6",
    apartmentId: "A-8",
    title: "Petek ısınmıyor",
    description: "Salon peteği dün akşamdan beri soğuk.",
    category: "Isıtma",
    priority: "medium",
    status: "pending",
    createdAt: shift(0, -2),
    updatedAt: shift(0, -2),
    messages: [],
  },
  {
    id: "t-7",
    apartmentId: "B-1",
    title: "Çöp konteyner alanı temizlenmeli",
    description: "Konteyner çevresinde kötü koku ve atık birikmiş.",
    category: "Temizlik",
    priority: "low",
    status: "in_progress",
    createdAt: shift(-4, -2),
    updatedAt: shift(-2, 1),
    assignedTo: "Burak Koç",
    messages: [],
  },
  {
    id: "t-8",
    apartmentId: "A-3",
    title: "Otopark kamerası görüntü vermiyor",
    description: "Zemin otopark kamerası iki gündür siyah ekran.",
    category: "Güvenlik",
    priority: "medium",
    status: "resolved",
    createdAt: shift(-9, -3),
    updatedAt: shift(-7, 2),
    assignedTo: "Burak Koç",
    messages: [],
  },
];

const payments: Payment[] = [];

apartments.forEach((apartment, index) => {
  if (apartment.id === "A-12") {
    for (let offset = -5; offset <= 1; offset += 1) {
      const paid = offset < 0;
      payments.push({
        id: `pay-a12-${offset}`,
        apartmentId: apartment.id,
        period: monthLabel(offset),
        amount: 1500,
        dueDate: monthDue(offset),
        paidAt: paid ? monthPaid(offset) : undefined,
        status: paid ? "paid" : "pending",
        method: paid ? "Kredi Kartı" : undefined,
        invoiceNo: `AID-${2026}-${String(120 + offset).padStart(4, "0")}`,
      });
    }
    return;
  }

  const status =
    index % 7 === 0 ? "overdue" : index % 3 === 0 ? "pending" : "paid";
  payments.push({
    id: `pay-${apartment.id}-0`,
    apartmentId: apartment.id,
    period: monthLabel(0),
    amount: 1500,
    dueDate: monthDue(0),
    paidAt: status === "paid" ? monthPaid(0) : undefined,
    status,
    method: status === "paid" ? "Havale / EFT" : undefined,
    invoiceNo: `AID-2026-${String(200 + index).padStart(4, "0")}`,
  });
});

const announcements: Announcement[] = [
  {
    id: "a-1",
    title: "Asansör bakımı 12 Kasım'da yapılacak",
    body: "A ve B blok asansörleri 12 Kasım Perşembe günü 09:00 - 12:00 saatleri arasında periyodik bakıma alınacaktır. Bakım sırasında asansörler sırayla devre dışı kalacaktır.",
    category: "bakim",
    createdAt: shift(-1, -4),
    important: true,
    blocks: ["A", "B"],
  },
  {
    id: "a-2",
    title: "Kasım ayı aidat ödemeleri hakkında",
    body: "Kasım ayı aidat son ödeme tarihi 15 Kasım'dır. Ödemelerinizi uygulama üzerinden kredi kartı ile veya banka havalesi ile gerçekleştirebilirsiniz.",
    category: "finans",
    createdAt: shift(-2, -2),
    important: true,
    blocks: ["A", "B"],
  },
  {
    id: "a-3",
    title: "Olağan kat malikleri toplantısı",
    body: "Site yönetimi olağan kat malikleri toplantısı 15 Kasım Cumartesi 19:00'da A Blok toplantı salonunda yapılacaktır. Katılım durumunuzu uygulama üzerinden bildirebilirsiniz.",
    category: "toplanti",
    createdAt: shift(-5, 1),
    important: false,
    blocks: ["A", "B"],
  },
  {
    id: "a-4",
    title: "Ziyaretçi ve kargo güvenliği",
    body: "Kargo teslimlerinde teslim kodunuzu güvenlik görevlisi ile paylaşmanız yeterlidir. Kargonuzu uygulamadaki Kargo ekranından takip edebilirsiniz.",
    category: "guvenlik",
    createdAt: shift(-8, -3),
    important: false,
    blocks: ["A", "B"],
  },
  {
    id: "a-5",
    title: "Bahçe peyzaj çalışması tamamlandı",
    body: "Site bahçesinde yürütülen peyzaj yenileme çalışması tamamlanmıştır. Yeni yeşil alanların korunması için hassasiyet göstermenizi rica ederiz.",
    category: "genel",
    createdAt: shift(-12, 2),
    important: false,
    blocks: ["A", "B"],
  },
  {
    id: "a-6",
    title: "Su deposu dezenfeksiyonu",
    body: "Su deposu temizliği 18 Kasım Salı günü yapılacaktır. 13:00 - 15:00 arasında kısa süreli su kesintisi yaşanabilir.",
    category: "bakim",
    createdAt: shift(-20, -1),
    important: false,
    blocks: ["A"],
  },
];

const polls: Poll[] = [
  {
    id: "p-1",
    question: "Ortak alanlara ek kamera sistemi kurulmalı mı?",
    description:
      "Otopark ve bahçe girişlerine 4 adet yeni kamera eklenmesi planlanıyor. Tahmini maliyet daire başı 350 TL.",
    options: [
      { id: "p1-o1", label: "Evet, kurulsun", votes: 26 },
      { id: "p1-o2", label: "Hayır, gerek yok", votes: 9 },
      { id: "p1-o3", label: "Kararsızım", votes: 4 },
    ],
    createdAt: shift(-3, -5),
    endsAt: shift(5, 12),
    voters: { "u-res-ayse": "p1-o1", "u-res-ahmet": "p1-o1" },
  },
  {
    id: "p-2",
    question: "Otopark düzenlemesi için hangi seçenek uygun?",
    description:
      "Otopark alanının daha verimli kullanılması için alternatif düzenlemeler oylanıyor.",
    options: [
      { id: "p2-o1", label: "Daire başına 1 sabit yer", votes: 18 },
      { id: "p2-o2", label: "Dönüşümlü kullanım", votes: 12 },
      { id: "p2-o3", label: "Mevcut düzen kalsın", votes: 10 },
    ],
    createdAt: shift(-6, -2),
    endsAt: shift(10, 12),
    voters: {},
  },
  {
    id: "p-3",
    question: "Merdiven boşluklarına bisiklet park alanı yapılsın mı?",
    description: "Geçmiş anket.",
    options: [
      { id: "p3-o1", label: "Evet", votes: 31 },
      { id: "p3-o2", label: "Hayır", votes: 14 },
    ],
    createdAt: shift(-25, -3),
    endsAt: shift(-10, 3),
    voters: { "u-res-ayse": "p3-o1" },
  },
];

const packages: PackageItem[] = [
  {
    id: "pk-1",
    apartmentId: "A-12",
    courier: "Yurtiçi Kargo",
    code: "4821",
    status: "security",
    receivedAt: shift(0, -3),
    description: "Orta boy kutu",
    receivedBy: "Güvenlik - Hasan",
  },
  {
    id: "pk-2",
    apartmentId: "A-12",
    courier: "Trendyol Express",
    code: "1937",
    status: "delivered",
    receivedAt: shift(-6, -5),
    deliveredAt: shift(-5, 2),
    description: "Küçük paket",
    receivedBy: "Güvenlik - Hasan",
  },
  {
    id: "pk-3",
    apartmentId: "B-4",
    courier: "Aras Kargo",
    code: "7315",
    status: "security",
    receivedAt: shift(-1, -6),
    description: "Büyük koli",
    receivedBy: "Güvenlik - Murat",
  },
  {
    id: "pk-4",
    apartmentId: "A-2",
    courier: "MNG Kargo",
    code: "6620",
    status: "security",
    receivedAt: shift(0, -1),
    description: "Zarf / evrak",
    receivedBy: "Güvenlik - Murat",
  },
  {
    id: "pk-5",
    apartmentId: "B-7",
    courier: "UPS",
    code: "5504",
    status: "delivered",
    receivedAt: shift(-4, -2),
    deliveredAt: shift(-3, 1),
    description: "Orta boy kutu",
    receivedBy: "Güvenlik - Hasan",
  },
];

const meetings: Meeting[] = [
  {
    id: "m-1",
    title: "Olağan Kat Malikleri Toplantısı",
    date: shift(6, 7),
    location: "A Blok Toplantı Salonu",
    agenda: [
      "Açılış ve yoklama",
      "2026 yılı bütçe değerlendirmesi",
      "Asansör bakım sözleşmesi yenileme",
      "Kamera sistemi teklifi",
      "Dilek ve temenniler",
    ],
    attendance: {},
  },
  {
    id: "m-2",
    title: "Bütçe ve Aidat Değerlendirme Toplantısı",
    date: shift(14, 6),
    location: "Yönetim Ofisi / Online",
    agenda: [
      "Gecikmiş aidatların değerlendirilmesi",
      "2027 aidat artış oranı",
      "Ek gider kalemleri",
    ],
    attendance: {},
  },
  {
    id: "m-3",
    title: "Olağanüstü Yönetim Toplantısı",
    date: shift(-20, 5),
    location: "Yönetim Ofisi",
    agenda: ["Çatı onarımı teklifleri", "Temizlik firması değişikliği"],
    attendance: { "u-res-ahmet": "yes", "u-res-ayse": "proxy" },
  },
];

const notifications: AppNotification[] = [
  {
    id: "n-1",
    title: "Arıza kaydınız güncellendi",
    body: "Banyo musluğu arızanız 'İşleme Alındı' durumuna geçti.",
    type: "ticket",
    at: shift(-1, 2),
    read: false,
    audience: "resident",
    userId: "u-res-ahmet",
  },
  {
    id: "n-2",
    title: "Kargonuz güvenlikte",
    body: "Yurtiçi Kargo paketiniz güvenlik görevlisine teslim edildi.",
    type: "package",
    at: shift(0, -3),
    read: false,
    audience: "resident",
    userId: "u-res-ahmet",
  },
  {
    id: "n-3",
    title: "Aidat ödemesi hatırlatması",
    body: `${monthLabel(0)} aidat son ödeme tarihi ${new Date(monthDue(0)).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}.`,
    type: "payment",
    at: shift(-2, -2),
    read: false,
    audience: "resident",
    userId: "u-res-ahmet",
  },
  {
    id: "n-4",
    title: "Yeni duyuru: Asansör bakımı",
    body: "12 Kasım'da asansör bakımı yapılacaktır.",
    type: "announcement",
    at: shift(-1, -4),
    read: true,
    audience: "all",
  },
  {
    id: "n-5",
    title: "Yeni anket açıldı",
    body: "Ortak alanlara ek kamera sistemi anketi oylamaya açıldı.",
    type: "poll",
    at: shift(-3, -5),
    read: true,
    audience: "all",
  },
  {
    id: "n-6",
    title: "Toplantı daveti",
    body: "Olağan kat malikleri toplantısı 15 Kasım'da yapılacak.",
    type: "meeting",
    at: shift(-5, 1),
    read: true,
    audience: "all",
  },
  {
    id: "n-7",
    title: "Yeni arıza kaydı",
    body: "B-3 numaralı daireden 'Ana kapı otomatiği' arızası bildirildi.",
    type: "ticket",
    at: shift(-3, -6),
    read: false,
    audience: "admin",
  },
  {
    id: "n-8",
    title: "Ödeme alındı",
    body: "A-4 dairesi 1.500 TL aidat ödemesi gerçekleştirdi.",
    type: "payment",
    at: shift(-1, -8),
    read: false,
    audience: "admin",
  },
  {
    id: "n-9",
    title: "Güvenlikte bekleyen kargo var",
    body: "B-4 dairesine ait kargo 1 gündür teslim alınmayı bekliyor.",
    type: "package",
    at: shift(-1, -6),
    read: false,
    audience: "admin",
  },
];

const transfers: Transfer[] = [
  {
    id: "tr-1",
    fromApartmentId: "A-5",
    toApartmentId: "A-12",
    count: 1,
    note: "Komşuya devredilen aylık arıza hakkı",
    createdAt: shift(-8, 2),
  },
];

const calendarEvents: BuildingEvent[] = [
  {
    id: "ce-1",
    title: "Asansör periyodik bakımı",
    start: shift(3, 2),
    end: shift(3, 4),
    type: "maintenance",
    location: "A ve B Blok asansörleri",
    description: "Bakım süresince asansörler sırayla devre dışı kalacaktır.",
    createdAt: shift(-10, 1),
  },
  {
    id: "ce-2",
    title: "Ortak alan ilaçlama",
    start: shift(9, 3),
    end: shift(9, 5),
    type: "cleaning",
    location: "Bodrum, otopark ve merdiven boşlukları",
    description: "İlaçlama sonrası ortak alanlar 2 saat süreyle kullanılmamalıdır.",
    createdAt: shift(-6, 2),
  },
  {
    id: "ce-3",
    title: "Yangın tatbikatı",
    start: shift(18, 4),
    end: shift(18, 5),
    type: "inspection",
    location: "Bina önü toplanma alanı",
    description: "Tüm sakinlerin katılımı beklenmektedir.",
    createdAt: shift(-4, 3),
  },
  {
    id: "ce-4",
    title: "Su deposu temizliği",
    start: shift(24, 1),
    end: shift(24, 4),
    type: "maintenance",
    location: "Çatı ve bodrum su depoları",
    description: "Temizlik süresince kısa süreli su kesintisi yaşanabilir.",
    createdAt: shift(-2, 5),
  },
  {
    id: "ce-5",
    title: "Kapıcı ve sakin kahvaltısı",
    start: shift(12, 3),
    end: shift(12, 5),
    type: "social",
    location: "A Blok bahçe alanı",
    description: "Ortak alanlarda düzenlenen tanışma etkinliği.",
    createdAt: shift(-1, 4),
  },
];

const registrations: RegistrationRequest[] = [
  {
    id: "reg-1",
    block: "B",
    no: "5",
    ownerName: "Hakan Yüce",
    residentCount: 3,
    occupancyType: "tenant",
    name: "Elif Şahin",
    email: "elif.sahin@apartman.com",
    phone: "+90 532 111 22 33",
    vehiclePlate: "34 ABC 123",
    emergencyContactName: "Murat Şahin",
    emergencyContactPhone: "+90 532 111 22 44",
    note: "Kiracı olarak 1 Ekim'de taşındık.",
    password: "1234",
    status: "pending",
    submittedAt: shift(-1, -4),
  },
  {
    id: "reg-2",
    block: "A",
    no: "3",
    ownerName: "Serkan Ateş",
    residentCount: 2,
    occupancyType: "owner",
    name: "Serkan Ateş",
    email: "serkan.ates@apartman.com",
    phone: "+90 533 222 33 44",
    password: "1234",
    status: "pending",
    submittedAt: shift(0, -6),
  },
  {
    id: "reg-3",
    block: "B",
    no: "2",
    ownerName: "Deniz Ak",
    residentCount: 1,
    occupancyType: "tenant",
    name: "Deniz Ak",
    email: "deniz.ak@apartman.com",
    phone: "+90 534 333 44 55",
    password: "1234",
    status: "rejected",
    submittedAt: shift(-5, -2),
    reviewedAt: shift(-4, 3),
    reviewNote: "Daire bilgileri yönetim kaydıyla eşleşmedi.",
  },
];

export function createSeedData(): AppData {
  return {
    apartments,
    users,
    tickets,
    payments,
    announcements,
    polls,
    packages,
    meetings,
    calendarEvents,
    registrations,
    notifications,
    transfers,
  };
}
