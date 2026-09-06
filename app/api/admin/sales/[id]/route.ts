import type { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, noStoreJson, revalidateDashboard } from "@/lib/api";
import { isAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ nama: z.string().trim().min(2).optional(), storeId: z.coerce.number().int().positive().optional(), aktif: z.boolean().optional() });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return noStoreJson({ message: "Sesi admin tidak valid." }, { status: 401 });
  try {
    const id = Number((await params).id);
    const updated = await prisma.sales.update({ where: { id }, data: schema.parse(await request.json()), include: { store: true } });
    revalidateDashboard();
    return noStoreJson(updated);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return noStoreJson({ message: "Sesi admin tidak valid." }, { status: 401 });
  try {
    const id = Number((await context.params).id);
    const updated = await prisma.sales.update({ where: { id }, data: { aktif: false } });
    revalidateDashboard();
    return noStoreJson(updated);
  } catch (error) {
    return apiError(error);
  }
}
