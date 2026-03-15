"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/store/useCartStore";
import { formatPrice, cloudinaryUrl } from "@/lib/utils";
import { MessageCircle, ShoppingBag, AlertTriangle } from "lucide-react";

export default function CheckoutClient() {
  const router = useRouter();
  const { items, total, clear } = useCart();
  const [form, setForm] = useState({ buyerName:"", buyerPhone:"", buyerEmail:"", deliveryAddress:"", notes:"" });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (items.length === 0) router.replace("/products"); }, [items.length, router]);
  if (items.length === 0) return null;

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.buyerName.trim() || form.buyerName.length < 2) e.buyerName = "Name required";
    if (!form.buyerPhone.trim() || form.buyerPhone.length < 9) e.buyerPhone = "Valid phone required";
    if (!form.deliveryAddress.trim() || form.deliveryAddress.length < 10) e.deliveryAddress = "Full address required";
    if (form.buyerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.buyerEmail)) e.buyerEmail = "Invalid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (openWA: boolean) => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items: items.map(i => ({ productId: i.productId, quantity: i.quantity })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");
      clear();
      if (openWA && data.whatsappUrl) window.open(data.whatsappUrl, "_blank");
      router.push(`/order-confirmed?order=${data.orderNumber}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally { setSubmitting(false); }
  };

  const amount = total();
  const iClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#D72638]/25";
  const lClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Summary */}
      <div className="lg:col-span-2">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-24">
          <h2 className="font-display font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {items.map(item => (
              <div key={item.productId} className="flex gap-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                  <Image src={item.image ? cloudinaryUrl(item.image, 100, 100) : "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=100&h=100&fit=crop"} alt={item.name} fill className="object-cover" sizes="56px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-2 leading-snug">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.quantity} × {formatPrice(item.price)}</p>
                </div>
                <p className="text-sm font-bold text-[#D72638] shrink-0">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold">{formatPrice(amount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="text-green-600 font-semibold">{amount >= 2000 ? "Free 🎉" : "Calculated at delivery"}</span></div>
            <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-3 mt-1">
              <span>Total</span><span className="text-[#D72638]">{formatPrice(amount)}</span>
            </div>
          </div>
          <div className="mt-4 bg-green-50 rounded-xl px-3 py-2.5 text-xs text-green-700 font-medium text-center">
            💚 Pay on delivery — no advance payment needed!
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="lg:col-span-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold text-xl">Your Details</h2>
          <div>
            <label className={lClass}>Full Name *</label>
            <input value={form.buyerName} onChange={e => setForm(f => ({ ...f, buyerName: e.target.value }))} placeholder="Kamal Perera" autoComplete="name" className={iClass} />
            {errors.buyerName && <p className="text-red-500 text-xs mt-1">{errors.buyerName}</p>}
          </div>
          <div>
            <label className={lClass}>Phone Number *</label>
            <input type="tel" value={form.buyerPhone} onChange={e => setForm(f => ({ ...f, buyerPhone: e.target.value }))} placeholder="+94 77 123 4567" autoComplete="tel" className={iClass} />
            {errors.buyerPhone && <p className="text-red-500 text-xs mt-1">{errors.buyerPhone}</p>}
          </div>
          <div>
            <label className={lClass}>Email <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
            <input type="email" value={form.buyerEmail} onChange={e => setForm(f => ({ ...f, buyerEmail: e.target.value }))} placeholder="your@email.com" autoComplete="email" className={iClass} />
            {errors.buyerEmail && <p className="text-red-500 text-xs mt-1">{errors.buyerEmail}</p>}
          </div>
          <div>
            <label className={lClass}>Delivery Address *</label>
            <textarea rows={3} value={form.deliveryAddress} onChange={e => setForm(f => ({ ...f, deliveryAddress: e.target.value }))} placeholder="No. 12, Main Street, Colombo 03" autoComplete="street-address" className={`${iClass} resize-none`} />
            {errors.deliveryAddress && <p className="text-red-500 text-xs mt-1">{errors.deliveryAddress}</p>}
          </div>
          <div>
            <label className={lClass}>Notes <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
            <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any special requests..." className={`${iClass} resize-none`} />
          </div>
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-700 font-medium">No online payment required. Pay on delivery.</p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <button onClick={() => submit(true)} disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-base disabled:opacity-60 hover:opacity-90 transition-opacity active:scale-95"
              style={{ background: "#25D366" }}>
              <MessageCircle className="w-5 h-5" />
              {submitting ? "Placing Order..." : "Place Order via WhatsApp"}
            </button>
            <button onClick={() => submit(false)} disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-base disabled:opacity-60 hover:border-gray-300 active:scale-95 transition-all">
              <ShoppingBag className="w-5 h-5" />
              Place Order (Email only)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
