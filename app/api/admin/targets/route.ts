import { Kategori } from "@prisma/client";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, noStoreJson, revalidateDashboard } from "@/lib/api";
import { isAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const schema = z.object({
  salesId: z.coerce.number().int().positive(),
  kategori: z.nativeEnum(Kategori),
  bulan: z.coerce.number().int().min(1).max(12),
  tahun: z.coerce.number().int().min(2000).max(2200),
  nilai: z.coerce.number().min(0),
});

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) return noStoreJson({ message: "Sesi admin tidak valid." }, { status: 401 });
  const url = new URL(request.url);
  const month = Number(url.searchParams.get("month"));
  const year = Number(url.searchParams.get("year"));
  const where = month && year ? { bulan: month, tahun: year } : {};
  const rows = await prisma.target.findMany({ where, include: { sales: true }, orderBy: [{ sales: { nama: "asc" } }, { kategori: "asc" }] });
  return noStoreJson(rows.map((row) => ({ ...row, nilai: Number(row.nilai) })));
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) return noStoreJson({ message: "Sesi admin tidak valid." }, { status: 401 });
  try {
    const created = await prisma.target.create({ data: schema.parse(await request.json()), include: { sales: true } });
    revalidateDashboard();
    return noStoreJson({ ...created, nilai: Number(created.nilai) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
