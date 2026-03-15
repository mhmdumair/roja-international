"use client";
import { useState } from "react";
import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";
import ProductPopup from "./ProductPopup";
import { formatPrice, cloudinaryUrl, cn } from "@/lib/utils";

export interface ProductCard {
  id: string; name: string; slug: string; description: string; longDesc?: string | null;
  price: number; comparePrice?: number | null; unit: string; stock: number;
  category: string; images: string[]; featured: boolean;
  reviews?: { id: string; rating: number; buyerName: string; comment: string; createdAt: string }[];
}

const CAT_COLORS: Record<string, string> = {
  "Color Powders":    "bg-pink-100 text-pink-700",
  "Exercise Books":   "bg-blue-100 text-blue-700",
  "Soaps":            "bg-purple-100 text-purple-700",
  "Washing Powder":   "bg-teal-100 text-teal-700",
  "Bleaching Powder": "bg-amber-100 text-amber-700",
};

export default function ProductGrid({ products }: { products: ProductCard[] }) {
  const [selected, setSelected] = useState<ProductCard | null>(null);

  if (!products.length) return (
    <div className="col-span-full flex flex-col items-center justify-center py-20">
      <div className="text-5xl mb-4">🎨</div>
      <h3 className="font-display font-bold text-lg text-gray-700 mb-2">No products found</h3>
      <p className="text-gray-400 text-sm">Try a different category or search</p>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {products.map(p => {
          const img = p.images[0] ? cloudinaryUrl(p.images[0], 400, 400) : "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop";
          const discount = p.comparePrice && p.comparePrice > p.price ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0;
          const avgRating = p.reviews?.length ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0;

          return (
            <div key={p.id}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setSelected(p)}>
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <Image src={img} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw" />
                {discount > 0 && <span className="absolute top-2 left-2 bg-[#D72638] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{discount}%</span>}
                {!p.stock && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="bg-white text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span></div>}
                {p.featured && !discount && <span className="absolute top-2 left-2 bg-[#FF8C00] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">⭐ Featured</span>}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="bg-white text-gray-800 text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5" /> View Product
                  </span>
                </div>
              </div>
              {/* Info */}
              <div className="p-3">
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", CAT_COLORS[p.category] || "bg-gray-100 text-gray-600")}>
                  {p.category}
                </span>
                <h3 className="font-display font-semibold text-gray-900 text-sm mt-1.5 line-clamp-2 leading-snug">{p.name}</h3>
                {avgRating > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className={cn("w-3 h-3", s <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200")} />)}
                    <span className="text-[11px] text-gray-400 ml-0.5">({p.reviews?.length})</span>
                  </div>
                )}
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="font-bold text-[#D72638] text-base">{formatPrice(p.price)}</span>
                  {discount > 0 && <span className="text-xs text-gray-400 line-through">{formatPrice(p.comparePrice!)}</span>}
                </div>
                <p className="text-[11px] text-gray-400">{p.unit}</p>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <ProductPopup product={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
