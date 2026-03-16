export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = reviewSchema.parse(body);
    const review = await prisma.review.create({ data: { productId: data.productId, buyerName: data.buyerName, buyerEmail: data.buyerEmail || null, rating: data.rating, comment: data.comment, isApproved: false } });
    return NextResponse.json(review, { status: 201 });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 }); }
}
