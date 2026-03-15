import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });
    productUrls = products.map(p => ({ url: `${base}/products`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 }));
  } catch {}
  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    ...productUrls,
  ];
}
