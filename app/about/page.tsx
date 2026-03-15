import { Metadata } from "next";
import { Star, BadgeCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import SiteReviewSection from "./SiteReviewSection";
import { formatTimeAgo } from "@/app/helpers";

export const metadata: Metadata = { title: "About Us", description: "Learn about Roja International — Sri Lanka's favourite colour powder store." };
export const revalidate = 60;

export default async function AboutPage() {
  let reviews: Awaited<ReturnType<typeof prisma.siteReview.findMany>> = [];
  let settings = null;
  try {
    [reviews, settings] = await Promise.all([
      prisma.siteReview.findMany({ where: { isApproved: true }, orderBy: { createdAt: "desc" } }),
      prisma.storeSettings.findFirst(),
    ]);
  } catch {}

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const byCounts = [5,4,3,2,1].map(r => ({ r, n: reviews.filter(x => x.rating === r).length }));

  return (
    <>
      <Navbar />
      <PageHero title="About Roja International" subtitle="Bringing colour and joy to Sri Lankan homes since our founding" gradient="linear-gradient(135deg,#7B2FBE 0%,#D72638 50%,#FF8C00 100%)" />

      <main>
        {/* Story */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[#D72638] text-sm font-bold uppercase tracking-wider mb-2">Our Story</p>
              <h2 className="font-display text-3xl font-bold text-gray-900 mb-5 leading-snug">Sri Lanka's Colour Store</h2>
              <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                <p>{settings?.aboutText || "Roja International was founded with a simple mission: to bring the most vibrant, high-quality colour powders and household essentials to Sri Lankan families at fair prices."}</p>
                <p>We source premium gulal and holi colour powders, along with quality everyday essentials like soaps, washing powder, bleaching powder, and exercise books — everything your home needs, in one place.</p>
                <p>Every order is handled personally by our team. We believe in honest business — that's why we offer pay-on-delivery with no advance payment required.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: "500+", label: "Happy Customers", color: "from-[#D72638] to-[#FF8C00]" },
                { num: "50+",  label: "Products",        color: "from-[#7B2FBE] to-[#00B4D8]" },
                { num: "5★",   label: "Average Rating",  color: "from-[#FF8C00] to-[#FFD600]" },
                { num: "100%", label: "Pay on Delivery",  color: "from-[#06D6A0] to-[#00B4D8]" },
              ].map(s => (
                <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white text-center`}>
                  <div className="font-display text-3xl font-bold mb-1">{s.num}</div>
                  <div className="text-white/80 text-xs font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section id="reviews" className="bg-gray-50 py-14 md:py-20 scroll-mt-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <p className="text-[#D72638] text-sm font-bold uppercase tracking-wider mb-2">Testimonials</p>
              <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">What Our Customers Say</h2>
              {avg > 0 && (
                <div className="flex items-center justify-center gap-2">
                  <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`w-5 h-5 ${s <= Math.round(avg) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />)}</div>
                  <span className="font-bold text-lg">{avg.toFixed(1)}</span>
                  <span className="text-gray-500 text-sm">({reviews.length} reviews)</span>
                </div>
              )}
            </div>

            {/* Rating breakdown */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-2xl p-6 mb-8 max-w-sm mx-auto shadow-sm">
                {byCounts.map(({ r, n }) => (
                  <div key={r} className="flex items-center gap-3 mb-2">
                    <span className="w-3 text-sm font-semibold text-right">{r}</span>
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: reviews.length ? `${(n/reviews.length)*100}%` : "0%" }} />
                    </div>
                    <span className="text-xs text-gray-400 w-4">{n}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Write review button */}
            <SiteReviewSection />

            {/* Reviews grid */}
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex mb-3">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />)}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">&ldquo;{r.comment}&rdquo;</p>
                    <div className="flex items-center gap-2.5 border-t border-gray-50 pt-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: "linear-gradient(135deg,#D72638,#FF8C00)" }}>
                        {r.buyerName[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm">{r.buyerName}</span>
                          <BadgeCheck className="w-3.5 h-3.5 text-green-500" />
                        </div>
                        <p className="text-xs text-gray-400">{formatTimeAgo(r.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Star className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p>No reviews yet — be the first!</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
