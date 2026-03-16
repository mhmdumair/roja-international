export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ buyerName: z.string().min(2), buyerEmail: z.string().email().optional().or(z.literal("")), rating: z.number().int().min(1).max(5), comment: z.string().min(5) });

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
    const r = await prisma.siteReview.create({ data: { buyerName: data.buyerName, buyerEmail: data.buyerEmail || null, rating: data.rating, comment: data.comment } });
    return NextResponse.json(r, { status: 201 });
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 }); }
}
