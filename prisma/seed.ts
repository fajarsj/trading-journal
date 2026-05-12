import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../app/generated/prisma/client";

const url = process.env.DATABASE_URL ?? "";
const parsed = new URL(url);
const adapter = new PrismaMariaDb({
  host: parsed.hostname,
  port: parsed.port ? Number(parsed.port) : 3306,
  user: parsed.username,
  password: parsed.password,
  database: parsed.pathname.slice(1),
});
const prisma = new PrismaClient({ adapter });

const defaultSections = [
  {
    section: "mindset",
    sectionLabel: "Mindset & Kondisi Fisik",
    isCritical: false,
    items: [
      { label: "Tidur minimal 6 jam tadi malam", note: "Kelelahan merusak penilaian risiko", order: 1 },
      { label: "Kondisi emosi tenang — tidak ada rasa takut, stres, atau terlalu percaya diri", order: 2 },
      { label: "Tidak trading untuk balas kerugian kemarin (tidak revenge trading)", order: 3 },
      { label: "Rencana trading hari ini sudah ditulis sebelum market buka", order: 4 },
    ],
  },
  {
    section: "market",
    sectionLabel: "Kondisi Market & Makro",
    isCritical: false,
    items: [
      { label: "Cek arah IHSG dan sentimen pre-market", note: "Apakah market sedang trending atau choppy?", order: 1 },
      { label: "Review market global semalam (AS, Asia)", note: "DJI, S&P 500, Nikkei, Hang Seng", order: 2 },
      { label: "Tidak ada event makro besar hari ini yang bisa spike volatilitas", note: "Suku bunga BI, PDB, inflasi, data Fed AS", order: 3 },
      { label: "Konfirmasi sektor target tidak dalam tekanan luar biasa", order: 4 },
    ],
  },
  {
    section: "watchlist",
    sectionLabel: "Persiapan Watchlist",
    isCritical: false,
    items: [
      { label: "Watchlist 3–5 setup sudah siap dengan level entry & stop", note: "Ticker spesifik, bukan ide samar", order: 1 },
      { label: "Setiap saham punya katalis atau alasan setup yang jelas", order: 2 },
      { label: "Watchlist terdiversifikasi — tidak semua satu sektor", order: 3 },
      { label: "Review analisis teknikal & fundamental untuk setiap kandidat", order: 4 },
    ],
  },
  {
    section: "risk",
    sectionLabel: "Risk Management Gates",
    isCritical: true,
    items: [
      { label: "Konfirmasi modal trading yang tersedia hari ini (IDR)", hasInput: true, inputPlaceholder: "cth. Rp 50.000.000", order: 1 },
      { label: "Set max risiko per trade (≤ 2% modal)", hasInput: true, inputPlaceholder: "cth. Rp 1.000.000", order: 2 },
      { label: "Konfirmasi jumlah maksimum posisi bersamaan", note: "Biasanya: maks 3–5 posisi", order: 3 },
      { label: "Setiap trade yang direncanakan punya harga stop-loss sebelum entry", order: 4 },
      { label: "Tidak menggunakan margin melebihi batas personal", order: 5 },
    ],
  },
  {
    section: "technical",
    sectionLabel: "Review Analisis Teknikal",
    isCritical: false,
    items: [
      { label: "Identifikasi tren saat ini pada chart D1 (harian) untuk setiap saham", order: 1 },
      { label: "Level support & resistance kunci sudah ditandai di chart", order: 2 },
      { label: "Cek rata-rata volume — hanya trading saham yang likuid", order: 3 },
      { label: "Sinyal entry terkonfirmasi (breakout, pullback, atau pola)", order: 4 },
    ],
  },
  {
    section: "execution",
    sectionLabel: "Kesiapan Eksekusi",
    isCritical: false,
    items: [
      { label: "Platform trading sudah terbuka dan berjalan dengan benar", order: 1 },
      { label: "Tidak ada order terbuka kemarin yang belum direview", order: 2 },
      { label: "Koneksi internet stabil terkonfirmasi", order: 3 },
      { label: "Review aturan trading personal — berkomitmen mengikutinya hari ini", order: 4 },
    ],
  },
];

async function main(): Promise<void> {
  console.log("Seeding checklist template...");

  const existing = await prisma.checklistTemplate.findFirst();
  if (existing) {
    console.log("Template already exists, skipping seed.");
    return;
  }

  const template = await prisma.checklistTemplate.create({ data: {} });

  for (const sec of defaultSections) {
    for (const item of sec.items) {
      await prisma.checklistItem.create({
        data: {
          templateId: template.id,
          section: sec.section,
          sectionLabel: sec.sectionLabel,
          isCritical: sec.isCritical,
          label: item.label,
          note: "note" in item ? (item.note ?? null) : null,
          hasInput: "hasInput" in item ? Boolean(item.hasInput) : false,
          inputPlaceholder: "inputPlaceholder" in item ? (item.inputPlaceholder ?? null) : null,
          order: item.order,
          isActive: true,
        },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
