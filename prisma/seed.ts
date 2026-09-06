import { Kategori, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const targets: Record<Kategori, number> = {
  DEVICE: 415_632_189,
  ACC_IOT: 35_296_970,
  REPAIR_CONTRACT: 9_634_247,
  CARRIER: 4_630_416,
  CE: 12_738_197,
};

const salesSeed = [
  {
    nama: "Ahmad Zaktar",
    august: { DEVICE: 365_658_560, ACC_IOT: 44_639_901, REPAIR_CONTRACT: 1_168_469, CARRIER: 3_684_685, CE: 12_933_604 },
    julyTotal: 494_526_902,
  },
  {
    nama: "Anak Agung Ayu Putri Dewi",
    august: { DEVICE: 375_427_028, ACC_IOT: 43_723_102, REPAIR_CONTRACT: 1_618_019, CARRIER: 3_778_379, CE: 10_943_244 },
    julyTotal: 520_192_883,
  },
  {
    nama: "Andi Syahril",
    august: { DEVICE: 382_308_107, ACC_IOT: 34_072_065, REPAIR_CONTRACT: 448_648, CARRIER: 3_543_243, CE: 5_763_964 },
    julyTotal: 530_350_126,
  },
  {
    nama: "Yuliani",
    august: { DEVICE: 354_614_419, ACC_IOT: 44_871_610, REPAIR_CONTRACT: 988_288, CARRIER: 5_345_045, CE: 22_607_207 },
    julyTotal: 493_604_223,
  },
] as const;

function distributeByTarget(total: number): Record<Kategori, number> {
  const keys = Object.values(Kategori);
  const targetTotal = keys.reduce((sum, key) => sum + targets[key], 0);
  const raw = keys.map((key) => ({ key, value: (total * targets[key]) / targetTotal }));
  const result = Object.fromEntries(raw.map(({ key, value }) => [key, Math.floor(value)])) as Record<Kategori, number>;
  let remainder = total - Object.values(result).reduce((sum, value) => sum + value, 0);
  raw.sort((a, b) => (b.value % 1) - (a.value % 1));
  for (let index = 0; index < remainder; index += 1) result[raw[index].key] += 1;
  return result;
}

async function main() {
  const store = await prisma.store.upsert({
    where: { kode: "M221" },
    update: { nama: "Erafone & More Sangatta M221" },
    create: { kode: "M221", nama: "Erafone & More Sangatta M221" },
  });

  for (const item of salesSeed) {
    let sales = await prisma.sales.findFirst({ where: { nama: item.nama, storeId: store.id } });
    sales = sales
      ? await prisma.sales.update({ where: { id: sales.id }, data: { aktif: true } })
      : await prisma.sales.create({ data: { nama: item.nama, storeId: store.id } });

    for (const kategori of Object.values(Kategori)) {
      await prisma.target.upsert({
        where: { salesId_kategori_bulan_tahun: { salesId: sales.id, kategori, bulan: 8, tahun: 2026 } },
        update: { nilai: targets[kategori] },
        create: { salesId: sales.id, kategori, bulan: 8, tahun: 2026, nilai: targets[kategori] },
      });
      await prisma.dailyEntry.upsert({
        where: { salesId_kategori_tanggal: { salesId: sales.id, kategori, tanggal: new Date("2026-08-25T12:00:00.000Z") } },
        update: { nilaiMtd: item.august[kategori] },
        create: { salesId: sales.id, kategori, tanggal: new Date("2026-08-25T12:00:00.000Z"), nilaiMtd: item.august[kategori] },
      });
    }

    const july = distributeByTarget(item.julyTotal);
    for (const kategori of Object.values(Kategori)) {
      await prisma.dailyEntry.upsert({
        where: { salesId_kategori_tanggal: { salesId: sales.id, kategori, tanggal: new Date("2026-07-31T12:00:00.000Z") } },
        update: { nilaiMtd: july[kategori] },
        create: { salesId: sales.id, kategori, tanggal: new Date("2026-07-31T12:00:00.000Z"), nilaiMtd: july[kategori] },
      });
    }
  }
}

main()
  .then(() => console.log("Seed M221 Agustus 2026 berhasil."))
  .finally(async () => prisma.$disconnect());
