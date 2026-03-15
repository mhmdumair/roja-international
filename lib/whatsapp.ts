import { format } from "date-fns";

interface Item { name: string; quantity: number; price: number }

export function buildOrderWA(p: { orderNumber: string; buyerName: string; buyerPhone: string; buyerEmail?: string; items: Item[]; totalAmount: number; deliveryAddress: string; notes?: string; }) {
  const lines = p.items.map(i => `• ${i.name} ×${i.quantity} — Rs.${(i.price * i.quantity).toLocaleString()}`).join("\n");
  const msg = `🎨 *NEW ORDER — ${p.orderNumber}*\n\n👤 *Customer*\nName: ${p.buyerName}\nPhone: ${p.buyerPhone}\nEmail: ${p.buyerEmail || "—"}\n\n📦 *Items*\n${lines}\n\n💰 *Total: Rs.${p.totalAmount.toLocaleString()}*\n\n🏠 *Address*\n${p.deliveryAddress}\n\n📝 Notes: ${p.notes || "—"}\n\n⏰ ${format(new Date(), "dd MMM yyyy, hh:mm a")}`;
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "94771234567";
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}

export function buildProductWA(name: string, price: number) {
  const msg = `Hi Roja International! I'm interested in *${name}* (Rs.${price.toLocaleString()}). Please share more details.`;
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "94771234567";
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}

export function buildContactWA(message?: string) {
  const msg = message || "Hi Roja International! I'd like to know more about your products.";
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "94771234567";
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}
