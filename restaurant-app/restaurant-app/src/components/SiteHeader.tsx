"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/branches", label: "Branches" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { lines } = useCart();
  const count = lines.reduce((n, l) => n + l.quantity, 0);

  return (
    <header
      className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 px-6 py-4"
      style={{ background: "var(--espresso)" }}
    >
      <Link href="/" className="font-display text-xl" style={{ color: "var(--ivory)" }}>
        Swingy Licks
      </Link>
      <nav className="flex flex-wrap items-center gap-5">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="text-sm" style={{ color: "var(--ivory-dim)" }}>
            {item.label}
          </Link>
        ))}
        <a
          href="tel:+233302810990"
          className="font-mono hidden text-sm sm:inline"
          style={{ color: "var(--gold)" }}
        >
          +233 302 810 990
        </a>
        <Link
          href="/menu#cart"
          className="font-mono flex items-center gap-2 rounded-full px-3 py-1.5 text-sm"
          style={{ background: "var(--brick)", color: "var(--ivory)" }}
        >
          Order · {count}
        </Link>
      </nav>
    </header>
  );
}
