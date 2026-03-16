import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const e = await requireAdmin(req); if (e) return e;
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const thirtyAgo = new Date(); thirtyAgo.setDate(thirtyAgo.getDate() - 30);
    const [todayOrders, pendingOrders, totalProducts, pendingReviews, pendingSiteReviews, revenueAgg, recentOrders, lowStock, daily] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.siteReview.count({ where: { isApproved: false } }),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: { items: { include: { product: { select: { name: true } } } } } }),
      prisma.product.findMany({ where: { stock: { lt: 5 }, isActive: true }, select: { id: true, name: true, stock: true } }),
      prisma.order.findMany({ where: { createdAt: { gte: thirtyAgo } }, select: { createdAt: true, totalAmount: true }, orderBy: { createdAt: "asc" } }),
    ]);
    const dailyMap: Record<string, { orders: number; revenue: number }> = {};
    daily.forEach(o => {
      const d = o.createdAt.toISOString().split("T")[0];
      if (!dailyMap[d]) dailyMap[d] = { orders: 0, revenue: 0 };
      dailyMap[d].orders++; dailyMap[d].revenue += o.totalAmount;
    });
    return NextResponse.json({ todayOrders, pendingOrders, totalProducts, pendingReviews: pendingReviews + pendingSiteReviews, totalRevenue: revenueAgg._sum.totalAmount || 0, recentOrders, lowStock, dailyStats: Object.entries(dailyMap).map(([date, v]) => ({ date, ...v })) });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
