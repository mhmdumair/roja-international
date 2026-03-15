"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Package, Star, TrendingUp, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatPrice, formatDate } from "@/lib/utils";
import { format } from "date-fns";

interface Stats { todayOrders:number; pendingOrders:number; totalProducts:number; pendingReviews:number; totalRevenue:number; recentOrders:{id:string;orderNumber:string;buyerName:string;totalAmount:number;status:string;createdAt:string;items:{product:{name:string}}[]}[]; lowStock:{id:string;name:string;stock:number}[]; dailyStats:{date:string;orders:number;revenue:number}[]; }

const ST: Record<string,string> = { pending:"bg-yellow-500/20 text-yellow-400", confirmed:"bg-blue-500/20 text-blue-400", processing:"bg-purple-500/20 text-purple-400", delivered:"bg-green-500/20 text-green-400", cancelled:"bg-red-500/20 text-red-400" };

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/admin/stats").then(r=>r.json()).then(d=>{setStats(d);setLoading(false);}).catch(()=>setLoading(false)); }, []);
  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#D72638]" /></div>;
  if (!stats) return <div className="text-gray-500 text-center py-20">Failed to load</div>;
  const chartData = stats.dailyStats.map(d => ({ date: format(new Date(d.date),"MMM d"), orders:d.orders, revenue:d.revenue }));
  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[{label:"Today's Orders",val:stats.todayOrders,icon:ShoppingBag,c:"text-[#D72638] bg-[#D72638]/10"},{label:"Pending",val:stats.pendingOrders,icon:Clock,c:"text-yellow-400 bg-yellow-500/10"},{label:"Products",val:stats.totalProducts,icon:Package,c:"text-blue-400 bg-blue-500/10"},{label:"Pending Reviews",val:stats.pendingReviews,icon:Star,c:"text-purple-400 bg-purple-500/10"}].map(s=>(
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-start justify-between">
            <div><p className="text-gray-500 text-xs">{s.label}</p><p className="font-display text-3xl font-bold text-white mt-1">{s.val}</p></div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.c.split(" ")[1]}`}><s.icon className={`w-5 h-5 ${s.c.split(" ")[0]}`} /></div>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-r from-[#D72638]/20 to-[#FF8C00]/20 border border-[#D72638]/20 rounded-2xl p-5 flex items-center justify-between">
        <div><p className="text-gray-400 text-sm">Total Revenue</p><p className="font-display text-4xl font-bold text-white mt-1">{formatPrice(stats.totalRevenue)}</p></div>
        <TrendingUp className="w-12 h-12 text-[#D72638]/40" />
      </div>
      {chartData.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="font-display font-semibold text-white mb-4">Orders — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D72638" stopOpacity={0.3}/><stop offset="95%" stopColor="#D72638" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
              <XAxis dataKey="date" stroke="#4b5563" tick={{fontSize:11}}/>
              <YAxis stroke="#4b5563" tick={{fontSize:11}}/>
              <Tooltip contentStyle={{background:"#111827",border:"1px solid #1f2937",borderRadius:8,color:"#fff"}}/>
              <Area type="monotone" dataKey="orders" stroke="#D72638" fill="url(#g)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      {stats.lowStock.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-5 h-5 text-orange-400"/><h3 className="font-semibold text-orange-300">Low Stock Warning</h3></div>
          <div className="flex flex-wrap gap-2">{stats.lowStock.map(p=><Link key={p.id} href="/admin/products" className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs px-3 py-1.5 rounded-full hover:bg-orange-500/20">{p.name}<span className="bg-orange-500/30 px-1.5 py-0.5 rounded-full text-[10px] font-bold">{p.stock}</span></Link>)}</div>
        </div>
      )}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between"><h3 className="font-display font-semibold text-white">Recent Orders</h3><Link href="/admin/orders" className="text-[#D72638] text-sm hover:underline">View All →</Link></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-800">{["Order #","Customer","Items","Total","Status","Date"].map(h=><th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody>
              {stats.recentOrders.map(o=>(
                <tr key={o.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-mono text-[#D72638] hover:underline text-xs">{o.orderNumber}</Link></td>
                  <td className="px-4 py-3 text-gray-200 whitespace-nowrap">{o.buyerName}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[140px] truncate">{o.items.map(i=>i.product.name).join(", ")}</td>
                  <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">{formatPrice(o.totalAmount)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${ST[o.status]||ST.pending}`}>{o.status}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
              {stats.recentOrders.length===0&&<tr><td colSpan={6} className="text-center py-10 text-gray-600">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
