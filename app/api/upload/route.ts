export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getUploadParams, deleteImg } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const e = await requireAdmin(req); if (e) return e;
  try { return NextResponse.json(getUploadParams()); }
  catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  const e = await requireAdmin(req); if (e) return e;
  try { const { url } = await req.json(); if (url) await deleteImg(url); return NextResponse.json({ success: true }); }
  catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
