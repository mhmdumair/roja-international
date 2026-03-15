import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const e = await requireAdmin(req); if (e) return e;
  try {
    const reviews = await prisma.siteReview.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(reviews);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
