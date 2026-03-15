"use client";
import { useState } from "react";
import { X, Star, CheckCircle2 } from "lucide-react";

interface Props { productId: string; productName: string; onClose: () => void; onSuccess?: (r: { id: string; buyerName: string; rating: number; comment: string; createdAt: string }) => void; }

export default function ReviewForm({ productId, productName, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({ buyerName: "", buyerEmail: "", comment: "" });
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { setError("Please select a rating"); return; }
    if (form.comment.trim().length < 5) { setError("Comment must be at least 5 characters"); return; }
    setError(""); setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, productId, rating }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const data = await res.json();
      setDone(true);
      onSuccess?.({ id: data.id, buyerName: form.buyerName, rating, comment: form.comment, createdAt: new Date().toISOString() });
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed"); }
    finally { setSubmitting(false); }
  };

  const iClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D72638]/25";

  return (
    <div className="popup-overlay" style={{ zIndex: 200 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-display font-bold text-lg">Write a Review</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">
          {done ? (
            <div className="flex flex-col items-center py-6 text-center gap-3">
              <CheckCircle2 className="w-14 h-14 text-green-500" />
              <h4 className="font-display font-bold text-xl">Thank you!</h4>
              <p className="text-gray-500 text-sm">Your review will appear after approval.</p>
              <button onClick={onClose} className="mt-2 px-6 py-2.5 bg-[#D72638] text-white rounded-xl font-semibold text-sm">Close</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <p className="text-gray-500 text-sm">Reviewing: <span className="font-semibold text-gray-700">{productName}</span></p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating *</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setRating(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}>
                      <Star className={`w-8 h-8 transition-colors ${s <= (hover || rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name *</label>
                <input value={form.buyerName} onChange={e => setForm(f => ({ ...f, buyerName: e.target.value }))} placeholder="Kamal Perera" required className={iClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email (optional)</label>
                <input type="email" value={form.buyerEmail} onChange={e => setForm(f => ({ ...f, buyerEmail: e.target.value }))} placeholder="your@email.com" className={iClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Review *</label>
                <textarea rows={4} value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} placeholder="Share your experience with this product..." className={`${iClass} resize-none`} />
              </div>
              {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
              <p className="text-xs text-gray-400">Reviews are moderated before publishing.</p>
              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60" style={{ background: "linear-gradient(135deg,#D72638,#FF8C00)" }}>
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
