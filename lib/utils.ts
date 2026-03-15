import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatPrice(n: number) {
  return `Rs. ${n.toLocaleString("en-LK", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-").replace(/-+/g,"-");
}

export function cloudinaryUrl(url: string, w = 800, h = 800): string {
  if (!url || !url.includes("cloudinary.com")) return url || "/placeholder.jpg";
  return url.replace("/upload/", `/upload/w_${w},h_${h},c_fill,q_auto,f_auto/`);
}

export function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-LK", { day:"numeric", month:"short", year:"numeric" });
}

export function timeAgo(d: Date | string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const mo = Math.floor(days / 30);
  return mo === 1 ? "1 month ago" : `${mo} months ago`;
}

export function maskName(name: string) {
  const p = name.trim().split(" ");
  return p.length === 1 ? p[0] : `${p[0]} ${p[p.length - 1][0]}.`;
}
