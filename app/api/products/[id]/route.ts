import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { productSchema } from "@/lib/validations";
import { deleteImg } from "@/lib/cloudinary";

export async function GET(_r: NextRequest, { params }: { params: { id: string } }) {
  try {
    const p = await prisma.product.findFirst({ where: { OR: [{ id: params.id }, { slug: params.id }] }, include: { reviews: { where: { isApproved: true }, select: { id: true, rating: true, buyerName: true, comment: true, createdAt: true } } } });
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(p);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const e = await requireAdmin(req); if (e) return e;
  try {
    const data = productSchema.parse(await req.json());
    const p = await prisma.product.update({ where: { id: params.id }, data });
    return NextResponse.json(p);
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 }); }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const e = await requireAdmin(req); if (e) return e;
  try {
    const p = await prisma.product.update({ where: { id: params.id }, data: await req.json() });
    return NextResponse.json(p);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 400 }); }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const e = await requireAdmin(req); if (e) return e;
  try {
    const p = await prisma.product.findUnique({ where: { id: params.id } });
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await Promise.allSettled(p.images.map(deleteImg));
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
