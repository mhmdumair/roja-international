"use client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const CATS = ["","Color Powders","Exercise Books","Soaps","Washing Powder","Bleaching Powder"];
const CAT_LABELS: Record<string,string> = { "":"✨ All","Color Powders":"🎨 Colours","Exercise Books":"📚 Books","Soaps":"🧼 Soaps","Washing Powder":"🫧 Washing","Bleaching Powder":"✨ Bleach" };
const ACTIVE: Record<string,string> = { "":"bg-gray-800 text-white","Color Powders":"bg-pink-500 text-white","Exercise Books":"bg-blue-500 text-white","Soaps":"bg-purple-500 text-white","Washing Powder":"bg-teal-500 text-white","Bleaching Powder":"bg-amber-500 text-white" };

interface Props { counts: Record<string,number>; currentCat: string; currentQ: string; currentSort: string; total: number }

export default function FilterBar({ counts, currentCat, currentQ, currentSort, total }: Props) {
  const router = useRouter();
  const push = (cat?: string, q?: string, sort?: string) => {
    const p = new URLSearchParams();
    const c = cat ?? currentCat; const qu = q ?? currentQ; const s = sort ?? currentSort;
    if (c) p.set("category", c);
    if (qu) p.set("q", qu);
    if (s) p.set("sort", s);
    router.push(`/products?${p.toString()}`);
  };

  const totalAll = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {CATS.map(c => {
          const active = currentCat === c;
          const n = c ? counts[c] || 0 : totalAll;
          return (
            <button key={c} onClick={() => push(c)}
              className={cn("shrink-0 h-9 px-3.5 rounded-full text-sm font-semibold border-2 transition-all whitespace-nowrap",
                active ? cn(ACTIVE[c], "border-transparent") : "bg-white border-gray-200 text-gray-600 hover:border-gray-300")}>
              {CAT_LABELS[c]}
              <span className={cn("ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full", active ? "bg-white/20" : "bg-gray-100")}>{n}</span>
            </button>
          );
        })}
      </div>

      {/* Search + Sort + count */}
      <div className="flex gap-3 items-center">
        <form action="/products" method="get" className="flex-1 relative">
          {currentCat && <input type="hidden" name="category" value={currentCat} />}
          {currentSort && <input type="hidden" name="sort" value={currentSort} />}
          <input name="q" defaultValue={currentQ} placeholder="Search products..." autoComplete="off"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D72638]/25 pr-10" />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </form>
        <select value={currentSort} onChange={e => push(undefined, undefined, e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D72638]/25 cursor-pointer shrink-0">
          <option value="">Featured</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="newest">Newest</option>
        </select>
        <span className="text-sm text-gray-400 shrink-0 hidden sm:block">{total} products</span>
      </div>
    </div>
  );
}
