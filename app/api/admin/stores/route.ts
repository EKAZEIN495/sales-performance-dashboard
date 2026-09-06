import type { NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { noStoreJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) return noStoreJson({ message: "Sesi admin tidak valid." }, { status: 401 });
  return noStoreJson(await prisma.store.findMany({ orderBy: { nama: "asc" } }));
}
