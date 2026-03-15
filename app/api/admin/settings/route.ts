import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { settingsSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const e = await requireAdmin(req); if (e) return e;
  try {
    let s = await prisma.storeSettings.findFirst();
    if (!s) s = await prisma.storeSettings.create({ data: { storeName: "Roja International" } });
    return NextResponse.json(s);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  const e = await requireAdmin(req); if (e) return e;
  try {
    const data = settingsSchema.parse(await req.json());
    let s = await prisma.storeSettings.findFirst();
    s = s
      ? await prisma.storeSettings.update({ where: { id: s.id }, data })
      : await prisma.storeSettings.create({ data: data as Parameters<typeof prisma.storeSettings.create>[0]["data"] });
    return NextResponse.json(s);
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 }); }
}
