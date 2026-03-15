import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import ProductGrid, { ProductCard } from "@/components/ProductGrid";
import FilterBar from "./FilterBar";

export const revalidate = 60;
export const metadata: Metadata = { title: "Products", description: "Browse all our colour powders, soaps, exercise books and household essentials." };

interface Props { searchParams: { category?: string; q?: string; sort?: string } }

export default async function ProductsPage({ searchParams }: Props) {
  const { category, q, sort } = searchParams;
  const where: Record<string, unknown> = { isActive: true };
  if (category) where.category = category;
  if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }];
  let orderBy: Record<string, string> = { sortOrder: "asc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };
  if (sort === "newest") orderBy = { createdAt: "desc" };

  let products: ProductCard[] = [];
  let counts: Record<string, number> = {};
  let settings = null;
  try {
    const [raw, all, s] = await Promise.all([
      prisma.product.findMany({ where, orderBy, include: { reviews: { where: { isApproved: true }, select: { id:true, rating:true, buyerName:true, comment:true, createdAt:true } } } }),
      prisma.product.findMany({ where: { isActive: true }, select: { category: true } }),
      prisma.storeSettings.findFirst(),
    ]);
    products = raw as ProductCard[];
    settings = s;
    all.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
  } catch {}

  return (
    <>
      <Navbar />
      <PageHero title={category || "All Products"} subtitle="Click any product to view details, images and place an order" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-12">
        <FilterBar counts={counts} currentCat={category || ""} currentQ={q || ""} currentSort={sort || ""} total={products.length} />
        <div className="mt-6">
          <ProductGrid products={products} />
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}
