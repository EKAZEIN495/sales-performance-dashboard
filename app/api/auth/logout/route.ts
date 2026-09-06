import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";
import { NO_STORE_HEADERS } from "@/lib/api";

export async function POST() {
  const response = NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
  response.cookies.set(AUTH_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
