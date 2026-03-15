"use client";
import { useState } from "react";
import { Star, X, CheckCircle2 } from "lucide-react";

export default function SiteReviewSection() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ buyerName: "", buyerEmail: "", comment: "" });
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { setError("Please select a rating"); return; }
    setError(""); setSubmitting(true);
    try {
      const res = await fetch("/api/site-reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, rating }) });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setDone(true);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed"); }
    finally { setSubmitting(false); }
  };

  const iClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D72638]/25";

  return (
    <>
      <div className="flex justify-center">
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg,#D72638,#FF8C00)" }}>
          <Star className="w-4 h-4" /> Share Your Experience
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-display font-bold text-lg">Write a Review ⭐</h3>
              <button onClick={() => { setOpen(false); setDone(false); }} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5">
              {done ? (
                <div className="flex flex-col items-center py-6 text-center gap-3">
                  <CheckCircle2 className="w-14 h-14 text-green-500" />
                  <h4 className="font-display font-bold text-xl">Thank you!</h4>
                  <p className="text-gray-500 text-sm">Your review will appear after our team approves it.</p>
                  <button onClick={() => { setOpen(false); setDone(false); }} className="mt-2 px-6 py-2.5 rounded-xl text-white font-semibold text-sm" style={{ background: "#D72638" }}>Close</button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Overall Rating *</label>
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
                    <input required value={form.buyerName} onChange={e => setForm(f => ({ ...f, buyerName: e.target.value }))} placeholder="Kamal Perera" className={iClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email (optional)</label>
                    <input type="email" value={form.buyerEmail} onChange={e => setForm(f => ({ ...f, buyerEmail: e.target.value }))} placeholder="your@email.com" className={iClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Your Review *</label>
                    <textarea required rows={4} value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} placeholder="Tell others about your experience..." className={`${iClass} resize-none`} />
                  </div>
                  {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
                  <p className="text-xs text-gray-400">Reviews are moderated before publishing.</p>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setOpen(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60" style={{ background: "linear-gradient(135deg,#D72638,#FF8C00)" }}>
                      {submitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
