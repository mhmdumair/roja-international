import type { Metadata } from "next";
import "./globals.css";
import CartDrawer from "@/components/CartDrawer";
import Toaster from "@/components/Toaster";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: { default: "Roja International — Colour Powders & Household Essentials", template: "%s | Roja International" },
  description: "Sri Lanka's favourite store for vibrant colour powders, gulal, exercise books, soaps & household essentials. Order via WhatsApp. Pay on delivery.",
  keywords: ["colour powder sri lanka", "gulal", "holi powder", "exercise books", "soaps", "washing powder", "household essentials"],
  openGraph: { siteName: "Roja International", type: "website" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#D72638" />
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
      </head>
      <body>
        {children}
        <CartDrawer />
        <Toaster />
      </body>
    </html>
  );
}
