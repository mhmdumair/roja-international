"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { toast } from "@/components/Toaster";

interface Order { id:string; orderNumber:string; buyerName:string; buyerPhone:string; totalAmount:number; status:string; createdAt:string; items:{quantity:number;product:{name:string}}[]; }
const TABS = ["all","pending","confirmed","processing","delivered","cancelled"];
const ST: Record<string,string> = { pending:"bg-yellow-500/20 text-yellow-400", confirmed:"bg-blue-500/20 text-blue-400", processing:"bg-purple-500/20 text-purple-400", delivered:"bg-green-500/20 text-green-400", cancelled:"bg-red-500/20 text-red-400" };

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const load = useCallback(async()=>{ setLoading(true); const url=tab==="all"?"/api/admin/orders":`/api/admin/orders?status=${tab}`; const d=await fetch(url).then(r=>r.json()); setOrders(Array.isArray(d)?d:[]); setLoading(false); },[tab]);
  useEffect(()=>{load();},[load]);
  const updateStatus = async(id:string,status:string)=>{ await fetch(`/api/admin/orders/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})}); setOrders(os=>os.map(o=>o.id===id?{...o,status}:o)); toast("Status updated","success"); };
  return (
    <div className="space-y-5 max-w-6xl">
      <h1 className="font-display text-2xl font-bold text-white">Orders</h1>
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 overflow-x-auto no-scrollbar">
        {TABS.map(s=><button key={s} onClick={()=>setTab(s)} className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors capitalize",tab===s?"bg-[#D72638] text-white":"text-gray-500 hover:text-white")}>{s==="all"?"All Orders":s}</button>)}
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading?<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#D72638]"/></div>:(
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-800">{["Order #","Customer","Phone","Items","Total","Status","Date","Actions"].map(h=><th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {orders.map(o=>(
                  <tr key={o.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-mono text-[#D72638] hover:underline text-xs">{o.orderNumber}</Link></td>
                    <td className="px-4 py-3 text-gray-200 whitespace-nowrap">{o.buyerName}</td>
                    <td className="px-4 py-3"><a href={`tel:${o.buyerPhone}`} className="text-gray-400 hover:text-white text-xs">{o.buyerPhone}</a></td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[120px] truncate">{o.items.map(i=>`${i.product.name} ×${i.quantity}`).join(", ")}</td>
                    <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">{formatPrice(o.totalAmount)}</td>
                    <td className="px-4 py-3"><select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)} className={cn("px-2 py-1 rounded-full text-xs font-semibold bg-transparent border-0 cursor-pointer focus:outline-none",ST[o.status])}>{TABS.slice(1).map(s=><option key={s} value={s} className="bg-gray-900 text-white capitalize">{s}</option>)}</select></td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="text-[#D72638] text-xs hover:underline">View →</Link></td>
                  </tr>
                ))}
                {orders.length===0&&<tr><td colSpan={8} className="text-center py-12 text-gray-600">No orders found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
