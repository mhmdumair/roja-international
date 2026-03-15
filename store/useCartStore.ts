"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem { productId: string; name: string; price: number; image: string; unit: string; quantity: number; slug: string; stock: number; }
interface CartStore {
  items: CartItem[]; isOpen: boolean;
  add: (p: CartItem, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  count: () => number;
  total: () => number;
}
export const useCart = create<CartStore>()(persist((set, get) => ({
  items: [], isOpen: false,
  add: (p, qty = 1) => set(s => {
    const ex = s.items.find(i => i.productId === p.productId);
    if (ex) return { items: s.items.map(i => i.productId === p.productId ? { ...i, quantity: Math.min(i.quantity + qty, p.stock) } : i), isOpen: true };
    return { items: [...s.items, { ...p, quantity: qty }], isOpen: true };
  }),
  remove: (id) => set(s => ({ items: s.items.filter(i => i.productId !== id) })),
  setQty: (id, qty) => { if (qty < 1) { get().remove(id); return; } set(s => ({ items: s.items.map(i => i.productId === id ? { ...i, quantity: qty } : i) })); },
  clear: () => set({ items: [] }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  count: () => get().items.reduce((s, i) => s + i.quantity, 0),
  total: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
}), { name: "roja-cart" }));
