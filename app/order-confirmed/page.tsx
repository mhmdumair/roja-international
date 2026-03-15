"use client";
import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, MessageCircle, ShoppingBag } from "lucide-react";

function Confirmed() {
  const sp = useSearchParams();
  const router = useRouter();
  const orderNumber = sp.get("order");

  useEffect(() => {
    if (!orderNumber) { router.replace("/"); return; }
    import("canvas-confetti").then(m => {
      const c = m.default;
      const colors = ["#D72638","#FF8C00","#FFD600","#06D6A0","#00B4D8","#7B2FBE"];
      c({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors });
      setTimeout(() => c({ particleCount: 60, spread: 100, origin: { x: 0.2, y: 0.7 }, colors }), 400);
    });
  }, [orderNumber, router]);

  const waNum = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "94771234567";
  const waMsg = encodeURIComponent(`Hi Roja International! I placed order ${orderNumber} and wanted to follow up.`);

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-2">Order Placed! 🎉</h1>
        <p className="text-gray-500 mb-3">Your order has been received</p>
        {orderNumber && (
          <div className="inline-block bg-gray-100 text-gray-800 font-mono font-bold text-lg px-5 py-2.5 rounded-xl mb-6">
            {orderNumber}
          </div>
        )}
        <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left space-y-3">
          {[
            ["✅", "Order Received", "We have your order details"],
            ["📞", "We'll Call You", "Our team will contact you to confirm"],
            ["📦", "Order Prepared", "We'll pack your items carefully"],
            ["💚", "Pay on Delivery", "No advance payment needed!"],
          ].map(([icon, title, desc]) => (
            <div key={title} className="flex gap-3">
              <span className="text-lg leading-none mt-0.5">{icon}</span>
              <div>
                <p className="font-semibold text-sm text-gray-800">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/products"
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#D72638,#FF8C00)" }}>
            <ShoppingBag className="w-5 h-5" /> Continue Shopping
          </Link>
          <a href={`https://wa.me/${waNum}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all"
            style={{ background: "#25D366" }}>
            <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#D72638] border-t-transparent rounded-full animate-spin" /></div>}><Confirmed /></Suspense>;
}
