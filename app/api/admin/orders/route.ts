import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const e = await requireAdmin(req); if (e) return e;
  try {
    const status = new URL(req.url).searchParams.get("status");
    const where = status && status !== "all" ? { status } : {};
    const orders = await prisma.order.findMany({ where, include: { items: { include: { product: { select: { name: true, images: true } } } } }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(orders);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
