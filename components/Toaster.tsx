"use client";
import { create } from "zustand";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

interface Toast { id: string; msg: string; type: "success" | "error" | "info" }
interface Store { toasts: Toast[]; add: (msg: string, type?: Toast["type"]) => void; rm: (id: string) => void; }
export const useToast = create<Store>((set) => ({
  toasts: [],
  add: (msg, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    set(s => ({ toasts: [...s.toasts, { id, msg, type }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 4000);
  },
  rm: id => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

export function toast(msg: string, type: Toast["type"] = "info") { useToast.getState().add(msg, type); }

export default function Toaster() {
  const { toasts, rm } = useToast();
  return (
    <div className="fixed top-4 right-4 z-[200] space-y-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-start gap-3 p-3.5 rounded-xl shadow-lg border text-sm ${t.type === "success" ? "bg-green-50 border-green-200 text-green-800" : t.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-white border-gray-200 text-gray-800"}`}>
          {t.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-500" /> : t.type === "error" ? <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" /> : null}
          <p className="flex-1">{t.msg}</p>
          <button onClick={() => rm(t.id)} className="text-gray-400 hover:text-gray-600 shrink-0"><X className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
}
