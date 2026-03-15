"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DEFAULTS = [
  { img: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1400&q=80", title: "Vibrant Colour Powders", sub: "Premium gulal & holi powders for every celebration in Sri Lanka", href: "/products?category=Color+Powders", badge: "🎨 New Arrivals", color: "#D72638" },
  { img: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1400&q=80", title: "Household Essentials", sub: "Quality soaps, washing powder & bleaching powder at great prices", href: "/products", badge: "🏠 Best Sellers", color: "#FF8C00" },
  { img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1400&q=80", title: "School Stationery", sub: "Exercise books and stationery — everything your child needs", href: "/products?category=Exercise+Books", badge: "📚 For Students", color: "#7B2FBE" },
];

export default function HeroSlider({ heroImages, tagline }: { heroImages?: string[]; tagline?: string }) {
  const slides = heroImages && heroImages.length > 0
    ? heroImages.map((img, i) => ({ ...DEFAULTS[i % DEFAULTS.length], img }))
    : DEFAULTS;

  const [cur, setCur] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const go = useCallback((idx: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setCur((idx + slides.length) % slides.length);
    setTimeout(() => setTransitioning(false), 500);
  }, [transitioning, slides.length]);

  useEffect(() => {
    const t = setInterval(() => go(cur + 1), 5500);
    return () => clearInterval(t);
  }, [cur, go]);

  const slide = slides[cur];

  return (
    <div className="relative overflow-hidden bg-gray-900" style={{ height: "clamp(280px, 56vw, 580px)" }}>
      {/* Slides */}
      {slides.map((s, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === cur ? "opacity-100" : "opacity-0"}`}>
          <Image src={s.img} alt={s.title} fill className="object-cover" priority={i === 0} sizes="100vw" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)" }} />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="max-w-xl">
          <div className="inline-block px-3 py-1.5 rounded-full text-xs font-bold text-white mb-4" style={{ background: slide.color }}>
            {slide.badge}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            {slide.title}
          </h1>
          <p className="text-white/75 text-sm sm:text-base mb-7 max-w-md leading-relaxed">
            {tagline || slide.sub}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={slide.href}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: slide.color }}>
              Shop Now →
            </Link>
            <Link href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm border-2 border-white/40 hover:bg-white/10 transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button onClick={() => go(cur - 1)} aria-label="Prev"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/30 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button onClick={() => go(cur + 1)} aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/30 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm">
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => go(i)} aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${i === cur ? "w-7 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/50 hover:bg-white/80"}`} />
        ))}
      </div>

      {/* Ticker */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm py-2 overflow-hidden">
        <div className="ticker-inner">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex items-center gap-8 px-4 shrink-0">
              {["🎨 Premium Colour Powders", "🧼 Quality Soaps", "📚 Exercise Books", "🫧 Washing Powder", "✨ Bleaching Powder", "💳 Pay on Delivery", "🚚 Fast Delivery"].map((t, j) => (
                <span key={j} className="text-white/80 text-xs font-medium whitespace-nowrap">{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
