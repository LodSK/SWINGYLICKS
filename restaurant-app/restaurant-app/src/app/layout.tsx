import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FoodFusion Restaurant",
  description: "Order food, book a table, and chat with our AI assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
