"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
      if (res.ok) { router.push("/admin"); router.refresh(); }
      else { const d = await res.json(); setError(d.error || "Invalid password"); setPw(""); }
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg,#D72638,#FF8C00)" }}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Roja International</p>
        </div>
        <form onSubmit={submit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
            <div className="relative">
              <input type={show ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} placeholder="Enter admin password" autoFocus required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-[#D72638]/40 placeholder-gray-600" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-red-400 text-sm text-center">{error}</div>}
          <button type="submit" disabled={loading || !pw}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#D72638,#FF8C00)" }}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying...</> : "Enter Admin Panel"}
          </button>
        </form>
        <p className="text-center text-gray-700 text-xs mt-5">© {new Date().getFullYear()} Roja International</p>
      </div>
    </div>
  );
}
