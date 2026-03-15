"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ShoppingCart, MessageCircle, Star, ChevronDown, ChevronUp, Plus, Minus, Check } from "lucide-react";
import { useCart } from "@/store/useCartStore";
import { formatPrice, cloudinaryUrl, timeAgo, maskName, cn } from "@/lib/utils";
import ReviewForm from "./ReviewForm";

interface Review { id: string; buyerName: string; rating: number; comment: string; createdAt: string | Date; }
interface Product {
  id: string; name: string; slug: string; description: string; longDesc?: string | null;
  price: number; comparePrice?: number | null; unit: string; stock: number;
  category: string; images: string[]; reviews?: Review[];
}

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} style={{ width: size, height: size }}
          className={s <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} />
      ))}
    </div>
  );
}

interface Props { product: Product; onClose: () => void; onOrderPlaced?: () => void; }

export default function ProductPopup({ product, onClose, onOrderPlaced }: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(product.reviews || []);
  const [orderMode, setOrderMode] = useState(false);
  const [orderForm, setOrderForm] = useState({ buyerName: "", buyerPhone: "", buyerEmail: "", deliveryAddress: "", notes: "" });
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState<{ orderNumber: string; whatsappUrl: string } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { add } = useCart();

  const imgs = product.images.length ? product.images : ["https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=800&fit=crop"];
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Keyboard close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const prevImg = () => setImgIdx(i => (i - 1 + imgs.length) % imgs.length);
  const nextImg = () => setImgIdx(i => (i + 1) % imgs.length);

  const handleAddToCart = () => {
    add({ productId: product.id, name: product.name, price: product.price, image: imgs[0], unit: product.unit, quantity: qty, slug: product.slug, stock: product.stock }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!orderForm.buyerName.trim() || orderForm.buyerName.length < 2) e.buyerName = "Name required";
    if (!orderForm.buyerPhone.trim() || orderForm.buyerPhone.length < 9) e.buyerPhone = "Valid phone required";
    if (!orderForm.deliveryAddress.trim() || orderForm.deliveryAddress.length < 10) e.deliveryAddress = "Full address required";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleOrder = async (openWA: boolean) => {
    if (!validate()) return;
    setOrdering(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...orderForm, items: [{ productId: product.id, quantity: qty }] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setOrdered({ orderNumber: data.orderNumber, whatsappUrl: data.whatsappUrl });
      if (openWA && data.whatsappUrl) window.open(data.whatsappUrl, "_blank");
      onOrderPlaced?.();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally { setOrdering(false); }
  };

  const handleReviewAdded = (r: Review) => {
    setReviews(prev => [r, ...prev]);
    setShowReviewForm(false);
    setReviewsOpen(true);
  };

  const iField = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D72638]/30";

  return (
    <div className="popup-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl animate-scaleIn">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 z-30 w-9 h-9 bg-white/90 hover:bg-gray-100 rounded-full flex items-center justify-center shadow-md transition-colors">
          <X className="w-5 h-5 text-gray-700" />
        </button>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* ── LEFT: Image Slider ── */}
            <div className="relative bg-gray-50" style={{ minHeight: "340px" }}>
              <div className="relative aspect-square overflow-hidden">
                {imgs.map((src, i) => (
                  <div key={i} className={`absolute inset-0 transition-opacity duration-500 ${i === imgIdx ? "opacity-100" : "opacity-0"}`}>
                    <Image src={cloudinaryUrl(src, 800, 800)} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" priority={i === 0} />
                  </div>
                ))}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  {discount > 0 && <span className="bg-[#D72638] text-white text-xs font-bold px-2.5 py-1 rounded-full">-{discount}% OFF</span>}
                  {product.stock === 0 && <span className="bg-gray-800 text-white text-xs font-bold px-2.5 py-1 rounded-full">Out of Stock</span>}
                  {product.stock > 0 && product.stock <= 10 && <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">Only {product.stock} left!</span>}
                </div>

                {/* Arrows */}
                {imgs.length > 1 && (
                  <>
                    <button onClick={prevImg} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextImg} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Counter */}
                {imgs.length > 1 && (
                  <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full font-mono">{imgIdx + 1}/{imgs.length}</span>
                )}
              </div>

              {/* Thumbnails */}
              {imgs.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {imgs.map((src, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                      className={cn("relative w-14 h-14 shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                        i === imgIdx ? "border-[#D72638]" : "border-transparent opacity-60 hover:opacity-90")}>
                      <Image src={cloudinaryUrl(src, 120, 120)} alt="" fill className="object-cover" sizes="56px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: Info ── */}
            <div className="flex flex-col p-5 md:p-6 overflow-y-auto">
              {/* Category */}
              <span className="text-xs font-semibold text-[#D72638] uppercase tracking-wider mb-2">{product.category}</span>

              {/* Name */}
              <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">{product.name}</h2>

              {/* Rating summary */}
              {reviews.length > 0 && (
                <button onClick={() => setReviewsOpen(true)} className="flex items-center gap-2 mb-3 w-fit hover:opacity-80 transition-opacity">
                  <Stars value={avg} size={14} />
                  <span className="text-sm font-semibold">{avg.toFixed(1)}</span>
                  <span className="text-sm text-gray-400">({reviews.length} reviews)</span>
                </button>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-display text-3xl font-bold text-[#D72638]">{formatPrice(product.price)}</span>
                {discount > 0 && <span className="text-gray-400 text-lg line-through">{formatPrice(product.comparePrice!)}</span>}
              </div>
              <p className="text-gray-400 text-sm mb-4">{product.unit}</p>

              {/* Stock */}
              <div className="mb-4">
                {product.stock === 0
                  ? <span className="text-red-500 text-sm font-semibold">❌ Out of Stock</span>
                  : product.stock <= 10
                  ? <span className="text-orange-500 text-sm font-semibold">⚠️ Only {product.stock} left!</span>
                  : <span className="text-green-600 text-sm font-semibold">✅ In Stock</span>}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{product.description}</p>

              {/* ── ORDER FORM or ADD TO CART ── */}
              {!ordered ? (
                !orderMode ? (
                  <div className="space-y-3">
                    {/* Qty */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600">Qty:</span>
                      <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                        <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors" disabled={qty <= 1}><Minus className="w-3.5 h-3.5" /></button>
                        <span className="w-8 text-center font-bold text-sm">{qty}</span>
                        <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors" disabled={qty >= product.stock}><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>

                    <button onClick={handleAddToCart} disabled={!product.stock}
                      className={cn("w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all active:scale-95",
                        added ? "bg-green-500" : product.stock ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-200 text-gray-400 cursor-not-allowed")}>
                      {added ? <><Check className="w-4 h-4" /> Added to Cart!</> : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
                    </button>

                    <button onClick={() => setOrderMode(true)} disabled={!product.stock}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-40"
                      style={{ background: "linear-gradient(135deg,#D72638,#FF8C00)" }}>
                      Order Now
                    </button>

                    <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "94771234567"}?text=${encodeURIComponent(`Hi! I want to order: ${product.name} (Rs.${product.price.toLocaleString()})`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95"
                      style={{ background: "#25D366" }}>
                      <MessageCircle className="w-4 h-4" /> Order via WhatsApp
                    </a>

                    <p className="text-center text-xs text-green-600 font-medium">💚 Pay on delivery — no advance payment</p>
                  </div>
                ) : (
                  // Quick order form
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-display font-bold text-base">Quick Order</h3>
                      <button onClick={() => setOrderMode(false)} className="text-xs text-gray-400 hover:text-gray-600">← Back</button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                      <input value={orderForm.buyerName} onChange={e => setOrderForm(f => ({ ...f, buyerName: e.target.value }))} placeholder="Kamal Perera" className={iField} />
                      {formErrors.buyerName && <p className="text-red-500 text-xs mt-0.5">{formErrors.buyerName}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Phone *</label>
                      <input type="tel" value={orderForm.buyerPhone} onChange={e => setOrderForm(f => ({ ...f, buyerPhone: e.target.value }))} placeholder="+94 77 123 4567" className={iField} />
                      {formErrors.buyerPhone && <p className="text-red-500 text-xs mt-0.5">{formErrors.buyerPhone}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Delivery Address *</label>
                      <textarea rows={2} value={orderForm.deliveryAddress} onChange={e => setOrderForm(f => ({ ...f, deliveryAddress: e.target.value }))} placeholder="No. 12, Main Street, Colombo 03" className={`${iField} resize-none`} />
                      {formErrors.deliveryAddress && <p className="text-red-500 text-xs mt-0.5">{formErrors.deliveryAddress}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (optional)</label>
                      <input value={orderForm.notes} onChange={e => setOrderForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any special requests" className={iField} />
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs text-amber-700 font-medium">
                      ⚠️ No payment now — pay on delivery
                    </div>

                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleOrder(true)} disabled={ordering}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-60"
                        style={{ background: "#25D366" }}>
                        <MessageCircle className="w-4 h-4" />
                        {ordering ? "Placing..." : "Place via WhatsApp"}
                      </button>
                      <button onClick={() => handleOrder(false)} disabled={ordering}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg,#D72638,#FF8C00)" }}>
                        {ordering ? "Placing..." : "Place Order"}
                      </button>
                    </div>
                  </div>
                )
              ) : (
                // Success
                <div className="flex flex-col items-center text-center py-4 space-y-3">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="font-display font-bold text-xl">Order Placed! 🎉</h3>
                  <div className="bg-gray-100 px-4 py-2 rounded-xl font-mono font-bold text-gray-800">{ordered.orderNumber}</div>
                  <p className="text-gray-500 text-sm">We'll call you to confirm. Pay on delivery!</p>
                  <div className="flex flex-col gap-2 w-full">
                    <button onClick={() => { setShowReviewForm(true); setOrdered(null); }}
                      className="w-full py-2.5 rounded-xl border-2 border-[#D72638] text-[#D72638] font-bold text-sm hover:bg-[#D72638]/5 transition-colors">
                      ⭐ Write a Review
                    </button>
                    <button onClick={onClose}
                      className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors">
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* Long description */}
              {product.longDesc && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-500 text-sm leading-relaxed">{product.longDesc}</p>
                </div>
              )}

              {/* ── REVIEWS (collapsible) ── */}
              <div className="mt-5 border-t border-gray-100 pt-4">
                <button onClick={() => setReviewsOpen(!reviewsOpen)}
                  className="w-full flex items-center justify-between py-1 hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-base">Reviews</span>
                    {reviews.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Stars value={avg} size={13} />
                        <span className="text-sm text-gray-500">({reviews.length})</span>
                      </div>
                    )}
                  </div>
                  {reviewsOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>

                {reviewsOpen && (
                  <div className="mt-3 space-y-3">
                    {reviews.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">No reviews yet — be the first!</p>
                    ) : (
                      reviews.map(r => (
                        <div key={r.id} className="bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                style={{ background: "linear-gradient(135deg,#D72638,#FF8C00)" }}>
                                {r.buyerName[0].toUpperCase()}
                              </div>
                              <span className="font-semibold text-sm">{maskName(r.buyerName)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Stars value={r.rating} size={12} />
                              <span className="text-xs text-gray-400">{timeAgo(r.createdAt)}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm pl-9 leading-relaxed">{r.comment}</p>
                        </div>
                      ))
                    )}
                    <button onClick={() => setShowReviewForm(!showReviewForm)}
                      className="w-full py-2.5 rounded-xl border border-dashed border-[#D72638] text-[#D72638] text-sm font-semibold hover:bg-[#D72638]/5 transition-colors">
                      + Write a Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm productId={product.id} productName={product.name} onClose={() => setShowReviewForm(false)} onSuccess={handleReviewAdded} />
      )}
    </div>
  );
}
