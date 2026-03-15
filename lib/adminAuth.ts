import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secret = () => new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "roja-dev-secret-32chars-minimum!!");

export async function signAdminToken() {
  return new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret());
}

export async function verifyAdminToken(token: string) {
  try { await jwtVerify(token, secret()); return true; } catch { return false; }
}

export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const token = req.cookies.get("admin_token")?.value;
  if (!token || !(await verifyAdminToken(token)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export function getAdminToken(): string | undefined {
  const store = cookies() as ReturnType<typeof cookies>;
  return store.get("admin_token")?.value;
}

export async function isAdmin(): Promise<boolean> {
  const t = getAdminToken();
  return t ? verifyAdminToken(t) : false;
}
