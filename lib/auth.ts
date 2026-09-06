import { jwtVerify, SignJWT } from "jose";
import type { NextRequest } from "next/server";

export const AUTH_COOKIE = "erafone_admin_session";

function secret() {
  if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET wajib diatur pada environment production.");
  }
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "development-only-secret-change-before-production",
  );
}

export async function createAdminToken(username: string) {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
}

export async function verifyAdminToken(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "admin" ? payload : null;
  } catch {
    return null;
  }
}

export async function isAdminRequest(request: NextRequest) {
  return Boolean(await verifyAdminToken(request.cookies.get(AUTH_COOKIE)?.value));
}
