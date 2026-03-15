import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signAdminToken } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });
    const hash = process.env.ADMIN_PASSWORD_HASH;
    if (!hash) return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
    if (!(await bcrypt.compare(password, hash))) return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    const token = await signAdminToken();
    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 60 * 60 * 24 * 7, path: "/" });
    return res;
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
