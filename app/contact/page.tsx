import { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import ContactForm from "./ContactForm";

export const metadata: Metadata = { title: "Contact Us", description: "Get in touch with Roja International. Order on WhatsApp or send us a message." };
export const revalidate = 300;

export default async function ContactPage() {
  let settings = null;
  try { settings = await prisma.storeSettings.findFirst(); } catch {}

  const waNum = settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "94771234567";

  return (
    <>
      <Navbar />
      <PageHero title="Contact Us" subtitle="We'd love to hear from you! Reach out on WhatsApp or send us a message." gradient="linear-gradient(135deg,#06D6A0 0%,#00B4D8 50%,#7B2FBE 100%)" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <p className="text-[#D72638] text-sm font-bold uppercase tracking-wider mb-2">Get In Touch</p>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-3">Contact Information</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                The fastest way to reach us is via WhatsApp. We respond quickly and can help you with orders, product info, and delivery.
              </p>
            </div>

            {/* WhatsApp CTA - prominent */}
            <a href={`https://wa.me/${waNum}?text=${encodeURIComponent("Hi Roja International! I'd like to know more about your products.")}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl text-white group transition-all hover:scale-[1.02] active:scale-95"
              style={{ background: "linear-gradient(135deg,#25D366,#128C7E)" }}>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <MessageCircle className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <p className="font-display font-bold text-lg leading-none">Chat on WhatsApp</p>
                <p className="text-white/80 text-sm mt-1">Click to start a conversation</p>
                <p className="text-white/60 text-xs mt-0.5">+{waNum}</p>
              </div>
            </a>

            {/* Info list */}
            <div className="space-y-4">
              {settings?.address && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#D72638]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Address</p>
                    <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">{settings.address}</p>
                  </div>
                </div>
              )}
              {settings?.ownerPhone && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-[#D72638]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Phone</p>
                    <a href={`tel:${settings.ownerPhone}`} className="text-gray-500 text-sm mt-0.5 hover:text-[#D72638] transition-colors">{settings.ownerPhone}</a>
                  </div>
                </div>
              )}
              {settings?.ownerEmail && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#D72638]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Email</p>
                    <a href={`mailto:${settings.ownerEmail}`} className="text-gray-500 text-sm mt-0.5 hover:text-[#D72638] transition-colors">{settings.ownerEmail}</a>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#D72638]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">Opening Hours</p>
                  <p className="text-gray-500 text-sm mt-0.5">{settings?.openingHours || "Open daily 8:00am – 8:00pm"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-bold text-xl text-gray-900 mb-5">Send a Message</h3>
              <ContactForm whatsappNumber={waNum} />
            </div>
          </div>
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}
