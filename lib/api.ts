import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

export function noStoreJson(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: { ...NO_STORE_HEADERS, ...init?.headers },
  });
}

export function apiError(error: unknown) {
  if (error instanceof ZodError) {
    return noStoreJson({ message: error.issues[0]?.message || "Data tidak valid" }, { status: 400 });
  }
  if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
    return noStoreJson({ message: "Data dengan kombinasi tersebut sudah ada." }, { status: 409 });
  }
  console.error(error);
  return noStoreJson({ message: "Terjadi kesalahan pada server." }, { status: 500 });
}

export function revalidateDashboard() {
  revalidatePath("/dashboard");
}
