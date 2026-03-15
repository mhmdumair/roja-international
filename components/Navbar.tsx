"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, Sparkles } from "lucide-react";
import { useCart } from "@/store/useCartStore";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Home",       href: "/" },
  { label: "Products",   href: "/products" },
  { label: "About Us",   href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { count, open: openCart } = useCart();
  const cartCount = count();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"
      )}>
        {/* Rainbow top line */}
        <div className="rainbow-line" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#D72638,#FF8C00)" }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-display font-bold text-gray-900 text-lg block leading-none">Roja</span>
              <span className="text-[10px] font-semibold text-[#D72638] tracking-widest uppercase">International</span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {LINKS.map(l => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link key={l.href} href={l.href}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                    active
                      ? "bg-[#D72638]/10 text-[#D72638]"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}>
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button onClick={openCart} className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors" aria-label="Cart">
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#D72638] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setOpen(!open)} className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors" aria-label="Menu">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {LINKS.map(l => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link key={l.href} href={l.href}
                  className={cn("block px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                    active ? "bg-[#D72638]/10 text-[#D72638]" : "text-gray-700 hover:bg-gray-50")}>
                  {l.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
      <div className="h-[68px]" />
    </>
  );
}
