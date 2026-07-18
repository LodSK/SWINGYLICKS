"use client";

import Link from "next/link";
import { useState } from "react";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function subscribe() {
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer style={{ background: "var(--espresso)", color: "var(--ivory-dim)" }}>
      <div
        className="border-b px-6 py-12 text-center"
        style={{ borderColor: "rgba(251,241,222,0.1)" }}
      >
        <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "var(--gold)" }}>
          Stay updated
        </span>
        <h3 className="font-display mt-2 text-2xl" style={{ color: "var(--ivory)" }}>
          Get exclusive offers &amp; new menu drops
        </h3>
        <div className="mx-auto mt-5 flex max-w-md gap-2">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-full border px-4 py-2 text-sm"
            style={{ background: "var(--ivory)", color: "var(--ink)", borderColor: "transparent" }}
          />
          <button
            onClick={subscribe}
            disabled={status === "sending" || !email}
            className="rounded-full px-5 py-2 text-sm font-medium disabled:opacity-50"
            style={{ background: "var(--gold)", color: "var(--espresso)" }}
          >
            Subscribe
          </button>
        </div>
        {status === "done" && (
          <p className="mt-2 text-xs" style={{ color: "var(--herb)" }}>
            You're on the list.
          </p>
        )}
        {status === "error" && (
          <p className="mt-2 text-xs" style={{ color: "var(--brick)" }}>
            Something went wrong — try again.
          </p>
        )}
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 text-sm sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <span className="font-display text-lg" style={{ color: "var(--ivory)" }}>
            Swingy Licks
          </span>
          <p className="mt-2 text-xs leading-relaxed">
            Ghana's flavor, made fresh daily. Pioneer of home-style fast food across Accra and beyond.
          </p>
        </div>
        <div>
          <p className="mb-2 font-semibold" style={{ color: "var(--ivory)" }}>
            Quick links
          </p>
          <ul className="space-y-1">
            <li><Link href="/menu">Menu</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/branches">Branches</Link></li>
            <li><Link href="/gallery">Gallery</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 font-semibold" style={{ color: "var(--ivory)" }}>
            Menu
          </p>
          <ul className="space-y-1">
            <li><Link href="/menu?category=Mains">Mains</Link></li>
            <li><Link href="/menu?category=Drinks">Drinks</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 font-semibold" style={{ color: "var(--ivory)" }}>
            Contact
          </p>
          <ul className="space-y-1 text-xs">
            <li>Head Office: Spintex Road, Accra</li>
            <li>+233 302 810 990</li>
            <li>hello@swingylicks.com</li>
            <li>10:00 AM – 10:30 PM</li>
          </ul>
        </div>
      </div>

      <div
        className="border-t px-6 py-4 text-center text-xs"
        style={{ borderColor: "rgba(251,241,222,0.1)" }}
      >
        © 2026 Swingy Licks. All rights reserved.
      </div>
    </footer>
  );
}
