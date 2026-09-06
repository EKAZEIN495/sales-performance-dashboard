import type { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, noStoreJson, revalidateDashboard } from "@/lib/api";
import { isAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const schema = z.object({ nama: z.string().trim().min(2, "Nama minimal 2 karakter."), storeId: z.coerce.number().int().positive() });

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) return noStoreJson({ message: "Sesi admin tidak valid." }, { status: 401 });
  return noStoreJson(await prisma.sales.findMany({ include: { store: true }, orderBy: [{ aktif: "desc" }, { nama: "asc" }] }));
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) return noStoreJson({ message: "Sesi admin tidak valid." }, { status: 401 });
  try {
    const input = schema.parse(await request.json());
    const created = await prisma.sales.create({ data: input, include: { store: true } });
    revalidateDashboard();
    return noStoreJson(created, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
