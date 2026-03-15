import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { productSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get("admin") === "1";
    if (isAdmin) { const e = await requireAdmin(req); if (e) return e; }
    const where: Record<string, unknown> = isAdmin ? {} : { isActive: true };
    const q = searchParams.get("q");
    const cat = searchParams.get("category");
    if (cat) where.category = cat;
    if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }];
    const products = await prisma.product.findMany({ where, orderBy: { sortOrder: "asc" }, include: { reviews: { where: isAdmin ? {} : { isApproved: true }, select: { id: true, rating: true, buyerName: true, comment: true, createdAt: true, isApproved: true } } } });
    return NextResponse.json(products);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const e = await requireAdmin(req); if (e) return e;
  try {
    const data = productSchema.parse(await req.json());
    const p = await prisma.product.create({ data });
    return NextResponse.json(p, { status: 201 });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 }); }
}
