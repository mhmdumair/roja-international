"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/store/useCartStore";
import { formatPrice, cloudinaryUrl } from "@/lib/utils";

export default function CartDrawer() {
  const { items, isOpen, close, setQty, remove, total } = useCart();
  const ref = useRef<HTMLDivElement>(null);
  const amount = total();

  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [isOpen, close]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/50">
      <div ref={ref} className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#D72638]" />
            <h2 className="font-display font-bold text-lg">Your Cart</h2>
            {items.length > 0 && <span className="text-sm text-gray-400">({items.length})</span>}
          </div>
          <button onClick={close} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-200 mb-3" />
              <p className="font-semibold text-gray-600">Your cart is empty</p>
              <button onClick={close} className="mt-4 px-5 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: "#D72638" }}>Shop Now</button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.productId} className="flex gap-3 pb-4 border-b border-gray-50 last:border-0">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                    <Image src={item.image ? cloudinaryUrl(item.image, 100, 100) : "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=100&h=100&fit=crop"} alt={item.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm line-clamp-2 leading-snug">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.unit}</p>
                    <p className="text-sm font-bold text-[#D72638] mt-0.5">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between shrink-0">
                    <button onClick={() => remove(item.productId)} className="text-gray-300 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg p-0.5">
                      <button onClick={() => setQty(item.productId, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-white transition-colors"><Minus className="w-3 h-3" /></button>
                      <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => setQty(item.productId, Math.min(item.quantity + 1, item.stock))} disabled={item.quantity >= item.stock} className="w-6 h-6 flex items-center justify-center rounded hover:bg-white transition-colors disabled:opacity-40"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            <div className="flex justify-between"><span className="text-gray-500 text-sm">Subtotal</span><span className="font-bold text-lg">{formatPrice(amount)}</span></div>
            <p className="text-xs text-green-600 text-center font-medium">🚚 Free delivery on orders over Rs. 2,000</p>
            <Link href="/checkout" onClick={close} className="block w-full text-center py-3 rounded-xl font-bold text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg,#D72638,#FF8C00)" }}>
              Proceed to Order →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
