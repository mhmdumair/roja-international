"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Phone, MessageCircle, MapPin, Loader2 } from "lucide-react";
import { formatPrice, formatDate, cloudinaryUrl } from "@/lib/utils";
import { toast } from "@/components/Toaster";

interface Order { id:string; orderNumber:string; buyerName:string; buyerPhone:string; buyerEmail?:string; deliveryAddress:string; notes?:string; totalAmount:number; status:string; createdAt:string; items:{id:string;quantity:number;price:number;product:{name:string;images:string[];unit:string}}[]; }
const ST: Record<string,string> = { pending:"bg-yellow-500/20 text-yellow-400 border-yellow-500/30", confirmed:"bg-blue-500/20 text-blue-400 border-blue-500/30", processing:"bg-purple-500/20 text-purple-400 border-purple-500/30", delivered:"bg-green-500/20 text-green-400 border-green-500/30", cancelled:"bg-red-500/20 text-red-400 border-red-500/30" };

export default function OrderDetail() {
  const { id } = useParams<{id:string}>();
  const router = useRouter();
  const [order, setOrder] = useState<Order|null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(()=>{ fetch(`/api/admin/orders/${id}`).then(r=>r.json()).then(d=>{setOrder(d);setStatus(d.status);setLoading(false);}).catch(()=>setLoading(false)); },[id]);
  const save = async()=>{ setSaving(true); try{ await fetch(`/api/admin/orders/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})}); setOrder(o=>o?{...o,status}:o); toast("Updated","success"); }catch{toast("Failed","error");}finally{setSaving(false);} };
  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#D72638]"/></div>;
  if (!order) return <div className="text-gray-500 text-center py-20">Order not found</div>;
  const waMsg = encodeURIComponent(`Hi ${order.buyerName}, your Roja International order ${order.orderNumber} is now: ${status}. Thank you! 🎨`);
  return (
    <div className="space-y-5 max-w-5xl">
      <button onClick={()=>router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"><ArrowLeft className="w-4 h-4"/>Back</button>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-display font-bold text-white text-xl font-mono">{order.orderNumber}</h1><p className="text-gray-500 text-sm mt-0.5">{formatDate(order.createdAt)}</p></div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${ST[order.status]}`}>{order.status}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800"><h3 className="font-semibold text-white">Order Items</h3></div>
            <div className="divide-y divide-gray-800/50">
              {order.items.map(item=>(
                <div key={item.id} className="flex gap-4 p-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-800 shrink-0">{item.product.images[0]?<Image src={cloudinaryUrl(item.product.images[0],100,100)} alt="" width={48} height={48} className="object-cover w-full h-full"/>:<div className="w-full h-full flex items-center justify-center text-xl">🎨</div>}</div>
                  <div className="flex-1"><p className="text-white font-medium text-sm">{item.product.name}</p><p className="text-gray-500 text-xs">{item.product.unit}</p><p className="text-gray-400 text-xs">{item.quantity} × {formatPrice(item.price)}</p></div>
                  <p className="text-white font-bold text-sm whitespace-nowrap">{formatPrice(item.price*item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-gray-800 flex justify-between"><span className="text-gray-400">Total</span><span className="text-white font-bold text-lg">{formatPrice(order.totalAmount)}</span></div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-white">Update Status</h3>
            <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D72638]/30">
              {["pending","confirmed","processing","delivered","cancelled"].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
            </select>
            <button onClick={save} disabled={saving} className="w-full py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2" style={{background:"linear-gradient(135deg,#D72638,#FF8C00)"}}>
              {saving?<><Loader2 className="w-4 h-4 animate-spin"/>Saving...</>:"Update Order"}
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-4">Customer</h3>
            <div className="space-y-3 text-sm">
              <div><p className="text-gray-500 text-xs">Name</p><p className="text-white font-medium">{order.buyerName}</p></div>
              <div><p className="text-gray-500 text-xs">Phone</p><a href={`tel:${order.buyerPhone}`} className="text-[#D72638] hover:underline">{order.buyerPhone}</a></div>
              {order.buyerEmail&&<div><p className="text-gray-500 text-xs">Email</p><p className="text-white">{order.buyerEmail}</p></div>}
              <div><p className="text-gray-500 text-xs">Address</p><p className="text-gray-300 leading-relaxed">{order.deliveryAddress}</p></div>
              {order.notes&&<div><p className="text-gray-500 text-xs">Notes</p><p className="text-gray-400 italic">"{order.notes}"</p></div>}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-2">
            <h3 className="font-semibold text-white mb-3">Quick Actions</h3>
            <a href={`tel:${order.buyerPhone}`} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm transition-colors"><Phone className="w-4 h-4"/>Call Customer</a>
            <a href={`https://wa.me/${order.buyerPhone.replace(/\D/g,"")}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-sm transition-colors"><MessageCircle className="w-4 h-4"/>WhatsApp Customer</a>
            <a href={`https://maps.google.com/?q=${encodeURIComponent(order.deliveryAddress)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm transition-colors"><MapPin className="w-4 h-4"/>View on Maps</a>
          </div>
        </div>
      </div>
    </div>
  );
}
