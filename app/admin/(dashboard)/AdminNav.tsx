"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Star, BarChart2, Settings, ExternalLink, LogOut, Sparkles, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href:"/admin",           label:"Dashboard",  icon:LayoutDashboard, exact:true  },
  { href:"/admin/products",  label:"Products",   icon:Package,         exact:false },
  { href:"/admin/orders",    label:"Orders",     icon:ShoppingBag,     exact:false },
  { href:"/admin/reviews",   label:"Reviews",    icon:Star,            exact:false },
  { href:"/admin/analytics", label:"Analytics",  icon:BarChart2,       exact:false },
  { href:"/admin/settings",  label:"Settings",   icon:Settings,        exact:false },
];

function Links({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = async () => { await fetch("/api/admin/logout", { method:"POST" }); router.push("/admin/login"); router.refresh(); };
  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background:"linear-gradient(135deg,#D72638,#FF8C00)" }}>
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div><p className="font-display font-bold text-white text-sm leading-none">Roja International</p><p className="text-gray-500 text-xs mt-0.5">Admin Panel</p></div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(it => {
          const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
          return (
            <Link key={it.href} href={it.href} onClick={onClick}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active ? "bg-[#D72638]/15 text-[#D72638]" : "text-gray-400 hover:text-white hover:bg-gray-800")}>
              <it.icon className="w-4 h-4 shrink-0" />{it.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-gray-800 space-y-0.5">
        <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"><ExternalLink className="w-4 h-4"/>View Store</Link>
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"><LogOut className="w-4 h-4"/>Logout</button>
      </div>
    </div>
  );
}

export default function AdminNav() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="hidden md:block fixed left-0 top-0 bottom-0 w-56 z-30"><Links /></div>
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:"linear-gradient(135deg,#D72638,#FF8C00)" }}><Sparkles className="w-3.5 h-3.5 text-white" /></div>
          <span className="font-display font-bold text-white text-sm">Admin</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2 text-gray-400 hover:text-white">{open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </div>
      {open && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50 md:hidden" onClick={() => setOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 z-50 md:hidden"><Links onClick={() => setOpen(false)} /></div>
        </>
      )}
      <div className="md:hidden h-14" />
    </>
  );
}
