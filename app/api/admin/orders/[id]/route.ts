import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const e = await requireAdmin(req); if (e) return e;
  try {
    const o = await prisma.order.findUnique({ where: { id: params.id }, include: { items: { include: { product: { select: { name: true, images: true, slug: true, unit: true } } } } } });
    if (!o) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(o);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const e = await requireAdmin(req); if (e) return e;
  try {
    const body = await req.json();
    const o = await prisma.order.update({ where: { id: params.id }, data: { status: body.status, notes: body.notes } });
    return NextResponse.json(o);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 400 }); }
}
