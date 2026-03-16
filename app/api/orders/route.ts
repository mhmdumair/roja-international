export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/lib/validations";
import { generateOrderNumber } from "@/lib/orderNumber";
import { buildOrderWA } from "@/lib/whatsapp";
import { resend, ownerHtml, buyerHtml } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = orderSchema.parse(body);
    const ids = data.items.map(i => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: ids }, isActive: true } });
    if (products.length !== new Set(ids).size) return NextResponse.json({ error: "Some products unavailable" }, { status: 400 });

    const itemsP = data.items.map(i => {
      const p = products.find(x => x.id === i.productId)!;
      return { productId: i.productId, quantity: i.quantity, price: p.price, name: p.name };
    });
    const total = itemsP.reduce((s, i) => s + i.price * i.quantity, 0);
    const orderNumber = await generateOrderNumber();

    const order = await prisma.$transaction(async tx => {
      const o = await tx.order.create({ data: { orderNumber, buyerName: data.buyerName, buyerPhone: data.buyerPhone, buyerEmail: data.buyerEmail || null, deliveryAddress: data.deliveryAddress, notes: data.notes || null, totalAmount: total } });
      await tx.orderItem.createMany({ data: itemsP.map(i => ({ orderId: o.id, productId: i.productId, quantity: i.quantity, price: i.price })) });
      return o;
    });

    const waUrl = buildOrderWA({ orderNumber, buyerName: data.buyerName, buyerPhone: data.buyerPhone, buyerEmail: data.buyerEmail, items: itemsP, totalAmount: total, deliveryAddress: data.deliveryAddress, notes: data.notes });
    const from = process.env.RESEND_FROM_EMAIL || "noreply@resend.dev";
    if (process.env.STORE_OWNER_EMAIL) resend.emails.send({ from, to: process.env.STORE_OWNER_EMAIL, subject: `🎨 New Order ${orderNumber}`, html: ownerHtml({ orderNumber, buyerName: data.buyerName, buyerPhone: data.buyerPhone, buyerEmail: data.buyerEmail, deliveryAddress: data.deliveryAddress, notes: data.notes, items: itemsP, total, waUrl }) }).catch(console.error);
    if (data.buyerEmail) resend.emails.send({ from, to: data.buyerEmail, subject: `Order Confirmed — ${orderNumber}`, html: buyerHtml({ orderNumber, buyerName: data.buyerName, buyerPhone: data.buyerPhone, items: itemsP, total, address: data.deliveryAddress }) }).catch(console.error);

    return NextResponse.json({ success: true, orderNumber, orderId: order.id, whatsappUrl: waUrl });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 });
  }
}
