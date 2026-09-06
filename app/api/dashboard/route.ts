import { CATEGORY_LABELS, CATEGORIES, type Category } from "@/lib/constants";
import {
  calculateAchievement,
  calculateContribution,
  calculateExpect,
  calculateGap,
  calculateGrowth,
  calculateTargetByDay,
  daysInMonth,
  roundValue,
} from "@/lib/calculations";
import { noStoreJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import type { DashboardData, MetricRow } from "@/lib/dashboard-types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function periodRange(month: number, year: number) {
  return {
    gte: new Date(Date.UTC(year, month - 1, 1)),
    lt: new Date(Date.UTC(year, month, 1)),
  };
}

function previousPeriod(month: number, year: number) {
  return month === 1 ? { month: 12, year: year - 1 } : { month: month - 1, year };
}

function latestMap(entries: Array<{ salesId: number; kategori: Category; tanggal: Date; nilaiMtd: unknown }>) {
  const map = new Map<string, number>();
  for (const entry of entries) {
    const key = `${entry.salesId}:${entry.kategori}`;
    if (!map.has(key)) map.set(key, Number(entry.nilaiMtd));
  }
  return map;
}

function makeMetric(category: Category | "TOTAL", target: number, mtd: number, totalDays: number, elapsedDays: number): MetricRow {
  const expectRaw = calculateExpect(mtd, totalDays, elapsedDays);
  const gap = calculateGap(target, mtd);
  return {
    category,
    label: category === "TOTAL" ? "TOTAL ALL" : CATEGORY_LABELS[category],
    target,
    mtd,
    expect: roundValue(expectRaw),
    achievement: calculateAchievement(expectRaw, target),
    gap,
    targetByDay: calculateTargetByDay(gap, totalDays, elapsedDays),
  };
}

export async function GET(request: Request) {
  const now = new Date();
  const params = new URL(request.url).searchParams;
  const month = Number(params.get("month") || now.getMonth() + 1);
  const year = Number(params.get("year") || now.getFullYear());
  if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year) || year < 2000 || year > 2200) {
    return noStoreJson({ message: "Periode tidak valid." }, { status: 400 });
  }

  const previous = previousPeriod(month, year);
  const [salesList, targets, entries, previousEntries] = await Promise.all([
    prisma.sales.findMany({ where: { aktif: true }, include: { store: true }, orderBy: { nama: "asc" } }),
    prisma.target.findMany({ where: { bulan: month, tahun: year, sales: { aktif: true } } }),
    prisma.dailyEntry.findMany({
      where: { tanggal: periodRange(month, year), sales: { aktif: true } },
      orderBy: { tanggal: "desc" },
    }),
    prisma.dailyEntry.findMany({
      where: { tanggal: periodRange(previous.month, previous.year), sales: { aktif: true } },
      orderBy: { tanggal: "desc" },
    }),
  ]);

  const latest = latestMap(entries as never);
  const previousLatest = latestMap(previousEntries as never);
  const lastEntry = entries[0]?.tanggal;
  const totalDays = daysInMonth(month, year);
  const selectedIsCurrent = month === now.getMonth() + 1 && year === now.getFullYear();
  const elapsedDays = lastEntry?.getUTCDate() ?? (selectedIsCurrent ? Math.min(now.getDate(), totalDays) : totalDays);
  const targetMap = new Map(targets.map((target) => [`${target.salesId}:${target.kategori}`, Number(target.nilai)]));

  const sales = salesList.map((person) => {
    const rows = CATEGORIES.map((category) => makeMetric(
      category,
      targetMap.get(`${person.id}:${category}`) || 0,
      latest.get(`${person.id}:${category}`) || 0,
      totalDays,
      elapsedDays,
    ));
    const totalTarget = rows.reduce((sum, row) => sum + row.target, 0);
    const totalMtd = rows.reduce((sum, row) => sum + row.mtd, 0);
    const total = makeMetric("TOTAL", totalTarget, totalMtd, totalDays, elapsedDays);
    const hasPrevious = CATEGORIES.some((category) => previousLatest.has(`${person.id}:${category}`));
    const previousActual = hasPrevious
      ? CATEGORIES.reduce((sum, category) => sum + (previousLatest.get(`${person.id}:${category}`) || 0), 0)
      : null;
    return {
      id: person.id,
      name: person.nama,
      store: person.store.nama,
      rows,
      total,
      previousActual,
      growth: calculateGrowth(total.expect, previousActual),
    };
  });

  const categories = CATEGORIES.map((category) => {
    const rows = sales.map((person) => person.rows.find((row) => row.category === category)!);
    return makeMetric(
      category,
      rows.reduce((sum, row) => sum + row.target, 0),
      rows.reduce((sum, row) => sum + row.mtd, 0),
      totalDays,
      elapsedDays,
    );
  });
  const grandTotal = makeMetric(
    "TOTAL",
    categories.reduce((sum, row) => sum + row.target, 0),
    categories.reduce((sum, row) => sum + row.mtd, 0),
    totalDays,
    elapsedDays,
  );
  const previousValues = sales.map((person) => person.previousActual).filter((value): value is number => value !== null);
  const previousActual = previousValues.length ? previousValues.reduce((sum, value) => sum + value, 0) : null;

  const data: DashboardData & { contribution: Array<{ category: Category; value: number }> } = {
    period: { month, year, elapsedDays, totalDays, label: `${MONTHS[month - 1]} ${year}` },
    sales,
    categories,
    grandTotal,
    previousActual,
    growth: calculateGrowth(grandTotal.expect, previousActual),
    contribution: categories.map((row) => ({ category: row.category as Category, value: calculateContribution(row.mtd, grandTotal.mtd) })),
    lastUpdated: new Date().toISOString(),
  };
  return noStoreJson(data);
}
