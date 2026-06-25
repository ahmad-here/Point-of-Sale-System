
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import { PaymentProvider } from "@/app/payments/context";
import { CheckoutProvider } from "@/app/dashboard/checkout-context";
import { SalesProvider } from "@/app/sales/context";
import { InventoryProvider } from "@/app/inventory/context";
import { DataManagerProvider } from "@/lib/storage";
import { ToastProvider } from "@/app/providers/toast-provider";
import { ToastContainer } from "@/app/providers/toast-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TOSPOS - Modern Point of Sale System",
  description: "Complete POS solution for your business. Manage inventory, sales, payments, and analytics all in one platform. Start your free trial today.",
  keywords: "POS system, point of sale, inventory management, sales tracking, payment processing, retail management",
  authors: [{ name: "TOSPOS Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tospos.com",
    title: "TOSPOS - Modern Point of Sale System",
    description: "Complete POS solution for your business.",
    images: [
      {
        url: "https://tospos.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "TOSPOS - POS System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TOSPOS - Modern Point of Sale System",
    description: "Complete POS solution for your business.",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  alternates: {
    canonical: "https://tospos.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex h-screen bg-[#fffcf2]">
        <DataManagerProvider>
          <ToastProvider>
              <InventoryProvider>
                <CheckoutProvider>
                  <PaymentProvider>
                    <SalesProvider>
                      <Sidebar />
                      <main className="flex-1 overflow-auto ml-[72px]">
                        {children}
                      </main>
                    </SalesProvider>
                  </PaymentProvider>
                </CheckoutProvider>
              </InventoryProvider>
            
          </ToastProvider>
        </DataManagerProvider>
      </body>
    </html>
  );
}
