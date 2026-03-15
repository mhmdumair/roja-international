import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import CheckoutClient from "./CheckoutClient";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  let settings = null;
  try { settings = await prisma.storeSettings.findFirst(); } catch {}
  return (
    <>
      <Navbar />
      <PageHero title="Place Your Order" subtitle="Fill in your details below and we'll contact you to confirm" gradient="linear-gradient(135deg,#06D6A0 0%,#00B4D8 60%,#7B2FBE 100%)" />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 pb-14">
        <CheckoutClient />
      </main>
      <Footer settings={settings} />
    </>
  );
}
