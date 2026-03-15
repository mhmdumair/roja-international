import Link from "next/link";
import { Truck, ShieldCheck, Phone, Star, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/HeroSlider";
import ProductGrid, { ProductCard } from "@/components/ProductGrid";
import { formatTimeAgo } from "./helpers";

export const revalidate = 60;

const CATS = [
  { name:"Color Powders",    emoji:"🎨", cls:"pill-powders",  slug:"Color+Powders"    },
  { name:"Exercise Books",   emoji:"📚", cls:"pill-books",    slug:"Exercise+Books"   },
  { name:"Soaps",            emoji:"🧼", cls:"pill-soaps",    slug:"Soaps"            },
  { name:"Washing Powder",   emoji:"🫧", cls:"pill-washing",  slug:"Washing+Powder"   },
  { name:"Bleaching Powder", emoji:"✨", cls:"pill-bleach",   slug:"Bleaching+Powder" },
];

async function getData() {
  try {
    const [featured, siteReviews, settings] = await Promise.all([
      prisma.product.findMany({ where: { isActive: true, featured: true }, take: 8, orderBy: { sortOrder: "asc" }, include: { reviews: { where: { isApproved: true }, select: { id:true, rating:true, buyerName:true, comment:true, createdAt:true } } } }),
      prisma.siteReview.findMany({ where: { isApproved: true }, take: 6, orderBy: { createdAt: "desc" } }),
      prisma.storeSettings.findFirst(),
    ]);
    return { featured, siteReviews, settings };
  } catch { return { featured: [], siteReviews: [], settings: null }; }
}

export default async function HomePage() {
  const { featured, siteReviews, settings } = await getData();
  const avgSite = siteReviews.length ? siteReviews.reduce((s, r) => s + r.rating, 0) / siteReviews.length : 0;

  return (
    <>
      <Navbar />

      {/* Hero */}
      <HeroSlider heroImages={settings?.heroImages} tagline={settings?.tagline ?? undefined} />

      {/* Ticker */}
      <div className="bg-[#D72638] overflow-hidden py-2.5">
        <div className="ticker-inner">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex items-center gap-8 px-4 shrink-0">
              {[
                `🚚 ${settings?.deliveryNote || "Free delivery on orders over Rs. 2,000"}`,
                "💳 Pay on delivery — no advance payment",
                "🎨 Premium colour powders in stock",
                `⏰ ${settings?.openingHours || "Open daily 8am – 8pm"}`,
                "📦 Fast delivery island-wide",
                "⭐ Quality guaranteed"
              ].map((t, j) => (
                <span key={j} className="text-white/90 text-xs font-medium whitespace-nowrap">{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <main>
        {/* Categories */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="flex items-end justify-between mb-7">
            <div>
              <p className="text-[#D72638] text-sm font-bold uppercase tracking-wider mb-1">Browse</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900">Shop by Category</h2>
            </div>
            <Link href="/products" className="flex items-center gap-1.5 text-sm font-semibold text-[#D72638] hover:underline">
              All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 md:grid md:grid-cols-5">
            {CATS.map(c => (
              <Link key={c.name} href={`/products?category=${c.slug}`} className="shrink-0 w-36 md:w-auto group">
                <div className={`${c.cls} rounded-2xl p-4 md:p-5 group-hover:opacity-90 group-hover:scale-[1.03] transition-all`}>
                  <div className="text-3xl mb-1.5">{c.emoji}</div>
                  <div className="font-display font-bold text-sm md:text-base leading-snug">{c.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        {featured.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 md:pb-16">
            <div className="flex items-end justify-between mb-7">
              <div>
                <p className="text-[#D72638] text-sm font-bold uppercase tracking-wider mb-1">Best Sellers</p>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900">⭐ Featured Products</h2>
              </div>
              <Link href="/products" className="flex items-center gap-1.5 text-sm font-semibold text-[#D72638] hover:underline">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductGrid products={featured as ProductCard[]} />
          </section>
        )}

        {/* Why us */}
        <section className="bg-white border-t border-gray-100 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <p className="text-[#D72638] text-sm font-bold uppercase tracking-wider mb-1">Why Choose Us</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900">The Roja Difference</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: Truck,       title: "Fast Delivery",     desc: "Island-wide delivery. Free on orders over Rs. 2,000.", color: "bg-blue-50 text-blue-500" },
                { icon: ShieldCheck, title: "Pay on Delivery",   desc: "No advance needed. Pay safely when your order arrives.", color: "bg-green-50 text-green-500" },
                { icon: Phone,       title: "WhatsApp Support",  desc: "Order directly on WhatsApp. Fast response guaranteed.", color: "bg-red-50 text-[#D72638]" },
              ].map(it => (
                <div key={it.title} className="flex gap-4 p-6 bg-gray-50 rounded-2xl">
                  <div className={`w-12 h-12 rounded-2xl ${it.color} flex items-center justify-center shrink-0`}>
                    <it.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base mb-1">{it.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{it.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Site reviews */}
        {siteReviews.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
            <div className="flex items-end justify-between mb-7">
              <div>
                <p className="text-[#D72638] text-sm font-bold uppercase tracking-wider mb-1">Testimonials</p>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900">What Customers Say</h2>
                {avgSite > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgSite) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />)}</div>
                    <span className="text-sm font-semibold">{avgSite.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">({siteReviews.length} reviews)</span>
                  </div>
                )}
              </div>
              <Link href="/about#reviews" className="flex items-center gap-1.5 text-sm font-semibold text-[#D72638] hover:underline">
                All Reviews <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {siteReviews.map(r => (
                <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                  <div className="flex mb-2">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />)}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">&ldquo;{r.comment}&rdquo;</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: "linear-gradient(135deg,#D72638,#FF8C00)" }}>
                      {r.buyerName[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-gray-900">{r.buyerName}</span>
                      <p className="text-xs text-gray-400">{formatTimeAgo(r.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer settings={settings} />
    </>
  );
}
