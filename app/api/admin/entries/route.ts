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
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid."),
  nilaiMtd: z.coerce.number().min(0),
});

function toUtcNoon(value: string) {
  return new Date(`${value}T12:00:00.000Z`);
}

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) return noStoreJson({ message: "Sesi admin tidak valid." }, { status: 401 });
  const url = new URL(request.url);
  const month = Number(url.searchParams.get("month"));
  const year = Number(url.searchParams.get("year"));
  const where = month && year ? { tanggal: { gte: new Date(Date.UTC(year, month - 1, 1)), lt: new Date(Date.UTC(year, month, 1)) } } : {};
  const rows = await prisma.dailyEntry.findMany({ where, include: { sales: true }, orderBy: [{ tanggal: "desc" }, { sales: { nama: "asc" } }] });
  return noStoreJson(rows.map((row) => ({ ...row, nilaiMtd: Number(row.nilaiMtd) })));
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) return noStoreJson({ message: "Sesi admin tidak valid." }, { status: 401 });
  try {
    const input = schema.parse(await request.json());
    const created = await prisma.dailyEntry.create({
      data: { ...input, tanggal: toUtcNoon(input.tanggal) },
      include: { sales: true },
    });
    revalidateDashboard();
    return noStoreJson({ ...created, nilaiMtd: Number(created.nilaiMtd) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
