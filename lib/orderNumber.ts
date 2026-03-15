import { prisma } from "./prisma";
export async function generateOrderNumber() {
  const yr = new Date().getFullYear();
  const n = await prisma.order.count({ where: { createdAt: { gte: new Date(`${yr}-01-01`) } } });
  return `RI-${yr}-${String(n + 1).padStart(4, "0")}`;
}
