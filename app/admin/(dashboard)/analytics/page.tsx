"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatPrice } from "@/lib/utils";
import { format, subDays } from "date-fns";

export default function AdminAnalytics() {
  const [stats, setStats] = useState<{totalRevenue:number;todayOrders:number;pendingOrders:number;dailyStats:{date:string;orders:number;revenue:number}[]}|null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  useEffect(()=>{fetch("/api/admin/stats").then(r=>r.json()).then(d=>{setStats(d);setLoading(false);}).catch(()=>setLoading(false));},[]);
  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#D72638]"/></div>;
  if (!stats) return <div className="text-gray-500 text-center py-20">Failed to load</div>;
  const cutoff = subDays(new Date(), period);
  const data = stats.dailyStats.filter(d=>new Date(d.date)>=cutoff).map(d=>({ date:format(new Date(d.date),"MMM d"), orders:d.orders, revenue:d.revenue }));
  const totalOrders = data.reduce((s,d)=>s+d.orders,0);
  const totalRev = data.reduce((s,d)=>s+d.revenue,0);
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-white">Analytics</h1>
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
          {[7,30,90].map(d=><button key={d} onClick={()=>setPeriod(d)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${period===d?"bg-[#D72638] text-white":"text-gray-500 hover:text-white"}`}>{d}d</button>)}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[{l:"Period Revenue",v:formatPrice(totalRev),c:"text-[#D72638]"},{l:"Period Orders",v:totalOrders,c:"text-blue-400"},{l:"All-Time Revenue",v:formatPrice(stats.totalRevenue),c:"text-green-400"},{l:"Pending",v:stats.pendingOrders,c:"text-yellow-400"}].map(s=>(
          <div key={s.l} className="bg-gray-900 border border-gray-800 rounded-2xl p-4"><p className="text-gray-500 text-xs">{s.l}</p><p className={`font-display text-2xl font-bold mt-1 ${s.c}`}>{s.v}</p></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5"><h3 className="font-semibold text-white mb-4">Orders Per Day</h3><ResponsiveContainer width="100%" height={220}><LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/><XAxis dataKey="date" stroke="#4b5563" tick={{fontSize:11}}/><YAxis stroke="#4b5563" tick={{fontSize:11}}/><Tooltip contentStyle={{background:"#111827",border:"1px solid #1f2937",borderRadius:8,color:"#fff"}}/><Line type="monotone" dataKey="orders" stroke="#D72638" strokeWidth={2.5} dot={false}/></LineChart></ResponsiveContainer></div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5"><h3 className="font-semibold text-white mb-4">Revenue Per Day</h3><ResponsiveContainer width="100%" height={220}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/><XAxis dataKey="date" stroke="#4b5563" tick={{fontSize:11}}/><YAxis stroke="#4b5563" tick={{fontSize:11}}/><Tooltip contentStyle={{background:"#111827",border:"1px solid #1f2937",borderRadius:8,color:"#fff"}} formatter={(v:number)=>[`Rs. ${v.toLocaleString()}`,"Revenue"]}/><Bar dataKey="revenue" fill="#FF8C00" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>
      </div>
    </div>
  );
}
