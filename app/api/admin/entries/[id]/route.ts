import { Kategori } from "@prisma/client";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, noStoreJson, revalidateDashboard } from "@/lib/api";
import { isAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  salesId: z.coerce.number().int().positive().optional(),
  kategori: z.nativeEnum(Kategori).optional(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  nilaiMtd: z.coerce.number().min(0).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return noStoreJson({ message: "Sesi admin tidak valid." }, { status: 401 });
  try {
    const input = schema.parse(await request.json());
    const data = { ...input, tanggal: input.tanggal ? new Date(`${input.tanggal}T12:00:00.000Z`) : undefined };
    const updated = await prisma.dailyEntry.update({ where: { id: Number((await params).id) }, data, include: { sales: true } });
    revalidateDashboard();
    return noStoreJson({ ...updated, nilaiMtd: Number(updated.nilaiMtd) });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return noStoreJson({ message: "Sesi admin tidak valid." }, { status: 401 });
  try {
    await prisma.dailyEntry.delete({ where: { id: Number((await params).id) } });
    revalidateDashboard();
    return noStoreJson({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
