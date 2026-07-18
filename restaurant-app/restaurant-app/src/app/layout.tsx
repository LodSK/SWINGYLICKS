import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingChat } from "@/components/FloatingChat";

export const metadata: Metadata = {
  title: "Swingy Licks | Ghana's Flavor, Made Fresh Daily",
  description: "Order Jollof, grilled classics, and sobolo online. Book a table or find a Swingy Licks branch near you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <FloatingChat />
        </CartProvider>
      </body>
    </html>
  );
}
