import { NextRequest, NextResponse } from "next/server";
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/admin") || pathname.includes(".")) return response;
  if (!request.cookies.get("_sid")) {
    response.cookies.set("_sid", Math.random().toString(36).slice(2), { maxAge: 60*60*24*30, httpOnly: true, sameSite: "lax", path: "/" });
  }
  return response;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
