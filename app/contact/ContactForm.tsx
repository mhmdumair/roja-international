"use client";
import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";

export default function ContactForm({ whatsappNumber }: { whatsappNumber: string }) {
  const [form, setForm] = useState({ name: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleWA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) return;
    const msg = `Hi Roja International!\n\nName: ${form.name}\nPhone: ${form.phone || "—"}\nSubject: ${form.subject || "General Inquiry"}\n\nMessage:\n${form.message}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
    setSent(true);
  };

  const iClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D72638]/25 transition-colors placeholder-gray-400";

  if (sent) return (
    <div className="flex flex-col items-center py-10 text-center gap-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <MessageCircle className="w-8 h-8 text-green-500" />
      </div>
      <h4 className="font-display font-bold text-xl">WhatsApp Opened!</h4>
      <p className="text-gray-500 text-sm max-w-xs">Your message has been pre-filled in WhatsApp. Just press send to reach us!</p>
      <button onClick={() => { setSent(false); setForm({ name:"",phone:"",subject:"",message:"" }); }}
        className="mt-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">
        Send Another Message
      </button>
    </div>
  );

  return (
    <form onSubmit={handleWA} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name *</label>
          <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Kamal Perera" className={iClass} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
          <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+94 77 123 4567" className={iClass} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
        <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Product enquiry, order, delivery..." className={iClass} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message *</label>
        <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Type your message here..." className={`${iClass} resize-none`} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button type="submit"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95"
          style={{ background: "#25D366" }}>
          <MessageCircle className="w-5 h-5" /> Send via WhatsApp
        </button>
      </div>
      <p className="text-xs text-gray-400 text-center">
        This will open WhatsApp with your message pre-filled. You can review before sending.
      </p>
    </form>
  );
}
