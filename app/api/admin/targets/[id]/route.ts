import { Kategori } from "@prisma/client";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, noStoreJson, revalidateDashboard } from "@/lib/api";
import { isAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  salesId: z.coerce.number().int().positive().optional(),
  kategori: z.nativeEnum(Kategori).optional(),
  bulan: z.coerce.number().int().min(1).max(12).optional(),
  tahun: z.coerce.number().int().min(2000).max(2200).optional(),
  nilai: z.coerce.number().min(0).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return noStoreJson({ message: "Sesi admin tidak valid." }, { status: 401 });
  try {
    const updated = await prisma.target.update({ where: { id: Number((await params).id) }, data: schema.parse(await request.json()), include: { sales: true } });
    revalidateDashboard();
    return noStoreJson({ ...updated, nilai: Number(updated.nilai) });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return noStoreJson({ message: "Sesi admin tidak valid." }, { status: 401 });
  try {
    await prisma.target.delete({ where: { id: Number((await params).id) } });
    revalidateDashboard();
    return noStoreJson({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
