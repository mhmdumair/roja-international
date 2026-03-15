"use client";
import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "@/components/Toaster";

interface Review { id:string; buyerName:string; rating:number; comment:string; isApproved:boolean; createdAt:string; productId?:string; product?:{name:string}|null; type:"product"|"site"; }

export default function AdminReviews() {
  const [all, setAll] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending"|"approved">("pending");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prod, site] = await Promise.all([
        fetch("/api/products?admin=1").then(r => r.json()),
        fetch("/api/admin/site-reviews").then(r => r.json()),
      ]);
      const prodReviews: Review[] = (Array.isArray(prod) ? prod : []).flatMap((p: { id:string; name:string; reviews:{id:string;buyerName:string;rating:number;comment:string;isApproved:boolean;createdAt:string}[] }) =>
        (p.reviews || []).map((r: {id:string;buyerName:string;rating:number;comment:string;isApproved:boolean;createdAt:string}) => ({ ...r, type: "product" as const, product: { name: p.name } }))
      );
      const siteReviews: Review[] = (Array.isArray(site) ? site : []).map((r: {id:string;buyerName:string;rating:number;comment:string;isApproved:boolean;createdAt:string}) => ({ ...r, type: "site" as const }));
      setAll([...prodReviews, ...siteReviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch { toast("Failed to load", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (r: Review) => {
    const url = r.type === "product" ? `/api/reviews/${r.id}` : `/api/site-reviews/${r.id}`;
    const res = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isApproved: true }) });
    if (res.ok) { setAll(a => a.map(x => x.id === r.id ? { ...x, isApproved: true } : x)); toast("Approved", "success"); }
  };

  const del = async (r: Review) => {
    if (!confirm("Delete this review?")) return;
    const url = r.type === "product" ? `/api/reviews/${r.id}` : `/api/site-reviews/${r.id}`;
    const res = await fetch(url, { method: "DELETE" });
    if (res.ok) { setAll(a => a.filter(x => x.id !== r.id)); toast("Deleted", "success"); }
  };

  const items = all.filter(r => tab === "pending" ? !r.isApproved : r.isApproved);
  const pendingCount = all.filter(r => !r.isApproved).length;

  return (
    <div className="space-y-5 max-w-5xl">
      <h1 className="font-display text-2xl font-bold text-white">Reviews</h1>
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
        <button onClick={() => setTab("pending")} className={cn("flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors", tab === "pending" ? "bg-[#D72638] text-white" : "text-gray-500 hover:text-white")}>
          Pending Approval {pendingCount > 0 && `(${pendingCount})`}
        </button>
        <button onClick={() => setTab("approved")} className={cn("flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors", tab === "approved" ? "bg-[#D72638] text-white" : "text-gray-500 hover:text-white")}>
          Approved ({all.filter(r => r.isApproved).length})
        </button>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#D72638]" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-800">{["Reviewer","Type","Rating","Comment","Date","Actions"].map(h => <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {items.map(r => (
                  <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3"><p className="text-white font-medium text-sm">{r.buyerName}</p></td>
                    <td className="px-4 py-3">
                      {r.type === "product"
                        ? <span className="bg-pink-500/20 text-pink-400 text-xs px-2 py-1 rounded-full">{r.product?.name || "Product"}</span>
                        : <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">Site Review</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">{[1,2,3,4,5].map(s=><span key={s} className={s<=r.rating?"text-yellow-400":"text-gray-700"}>★</span>)}</div>
                    </td>
                    <td className="px-4 py-3 max-w-xs"><p className="text-gray-300 text-xs line-clamp-2">{r.comment}</p></td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {!r.isApproved && <button onClick={() => approve(r)} title="Approve" className="p-1.5 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors"><CheckCircle2 className="w-4 h-4" /></button>}
                        <button onClick={() => del(r)} title="Delete" className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-gray-600">No {tab} reviews</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
