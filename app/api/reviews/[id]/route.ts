export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const err = await requireAdmin(req); if (err) return err;
  try { const body = await req.json(); const r = await prisma.review.update({ where: { id: params.id }, data: body }); return NextResponse.json(r); }
  catch { return NextResponse.json({ error: "Failed" }, { status: 400 }); }
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const err = await requireAdmin(req); if (err) return err;
  try { await prisma.review.delete({ where: { id: params.id } }); return NextResponse.json({ success: true }); }
  catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
