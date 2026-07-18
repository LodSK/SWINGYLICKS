"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MenuCard, MenuItem } from "@/components/MenuCard";

type Review = { rating: number; comment: string; customer_name: string };

const FEATURES = [
  { title: "Expert Cooks", desc: "Decades of experience behind every pot of jollof.", num: "01" },
  { title: "Fresh Ingredients", desc: "Sourced locally, prepped daily — nothing frozen and forgotten.", num: "02" },
  { title: "Fast Service", desc: "Quick without cutting corners on flavor.", num: "03" },
  { title: "Quality Assured", desc: "The same great taste, every single visit.", num: "04" },
  { title: "Quick Delivery", desc: "Hot food, straight to your door.", num: "05" },
  { title: "Made With Love", desc: "Every plate prepared with real care.", num: "06" },
];

export default function Home() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch("/api/menu").then((r) => r.json()).then((d) => setMenu(d.items ?? []));
    fetch("/api/reviews").then((r) => r.json()).then((d) => setReviews(d.reviews ?? []));
  }, []);

  const featured = menu[0];

  return (
    <main style={{ background: "var(--ivory)" }}>
      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-20" style={{ background: "var(--espresso)" }}>
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, var(--gold) 0px, var(--gold) 2px, transparent 2px, transparent 40px)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <span
              className="font-mono inline-block rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em]"
              style={{ background: "rgba(212,160,23,0.15)", color: "var(--gold)" }}
            >
              🔥 Ghana's flavor, made fresh daily
            </span>
            <h1 className="font-display mt-5 text-5xl leading-tight sm:text-6xl" style={{ color: "var(--ivory)" }}>
              Taste the authentic
              <br />
              <em style={{ color: "var(--gold)" }}>Ghanaian flavor.</em>
            </h1>
            <p className="mt-5 max-w-lg text-base" style={{ color: "var(--ivory-dim)" }}>
              From crispy fried chicken to our famous jollof rice — real Ghanaian cooking,
              served fast, made to order.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/menu"
                className="rounded-full px-6 py-3 text-sm font-medium"
                style={{ background: "var(--brick)", color: "var(--ivory)" }}
              >
                Order now
              </Link>
              <Link
                href="/about"
                className="rounded-full border px-6 py-3 text-sm font-medium"
                style={{ borderColor: "rgba(251,241,222,0.3)", color: "var(--ivory)" }}
              >
                Our story
              </Link>
            </div>
            <div className="mt-10 flex gap-10">
              <Stat number="30+" label="Years of flavor" />
              <Stat number="200+" label="Team members" />
              <Stat number="4" label="Locations" />
            </div>
          </div>

          {featured && (
            <div className="rounded-xl border p-5" style={{ background: "var(--ivory)", borderColor: "rgba(43,24,16,0.1)" }}>
              <span className="font-mono text-xs uppercase tracking-wide" style={{ color: "var(--herb)" }}>
                Signature dish
              </span>
              <h3 className="font-display mt-1 text-2xl" style={{ color: "var(--espresso)" }}>
                {featured.name}
              </h3>
              <p className="mt-1 text-sm" style={{ color: "rgba(43,24,16,0.7)" }}>
                {featured.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span style={{ color: "var(--gold)" }}>★★★★★ <span className="text-xs" style={{color:"rgba(43,24,16,0.6)"}}>4.9 · 2,000+ reviews</span></span>
                <span className="font-mono text-lg" style={{ color: "var(--brick)" }}>
                  GHS {featured.price}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* POPULAR MENU PREVIEW */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "var(--brick)" }}>
              Fan favorites
            </span>
            <h2 className="font-display mt-2 text-3xl" style={{ color: "var(--espresso)" }}>
              Our popular menu
            </h2>
          </div>
          <Link href="/menu" className="text-sm font-medium" style={{ color: "var(--herb)" }}>
            View full menu →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {menu.slice(0, 6).map((item) => (
            <MenuCard key={item.item_id} item={item} />
          ))}
        </div>
        {menu.length === 0 && (
          <p className="text-sm" style={{ color: "var(--ink)" }}>
            No dishes yet — add some to the menu to see them here.
          </p>
        )}
      </section>

      {/* WHY CHOOSE US */}
      <section className="px-6 py-16" style={{ background: "var(--ivory-dim)" }}>
        <div className="mx-auto max-w-6xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "var(--brick)" }}>
            Why Swingy Licks
          </span>
          <h2 className="font-display mt-2 mb-10 text-3xl" style={{ color: "var(--espresso)" }}>
            The difference is in every plate
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.num} className="rounded-lg border p-5" style={{ background: "var(--ivory)", borderColor: "rgba(43,24,16,0.1)" }}>
                <span className="font-mono text-xs" style={{ color: "var(--gold)" }}>{f.num}</span>
                <h3 className="font-display mt-2 text-lg" style={{ color: "var(--espresso)" }}>{f.title}</h3>
                <p className="mt-1 text-sm" style={{ color: "rgba(43,24,16,0.7)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {reviews.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "var(--brick)" }}>
            What people say
          </span>
          <h2 className="font-display mt-2 mb-10 text-3xl" style={{ color: "var(--espresso)" }}>
            Straight from our customers
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <div key={i} className="rounded-lg border p-5" style={{ borderColor: "rgba(43,24,16,0.1)" }}>
                <span style={{ color: "var(--gold)" }}>{"★".repeat(r.rating)}</span>
                <p className="mt-2 text-sm" style={{ color: "var(--ink)" }}>"{r.comment}"</p>
                <p className="font-mono mt-3 text-xs" style={{ color: "var(--herb)" }}>
                  — {r.customer_name}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PROMO BANNER */}
      <section className="px-6 py-16" style={{ background: "var(--brick)" }}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl" style={{ color: "var(--ivory)" }}>
            Hungry? Order now.
          </h2>
          <p className="mt-2 text-sm" style={{ color: "rgba(251,241,222,0.85)" }}>
            Fresh, fast, and full of flavor — order online or call ahead.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/menu"
              className="rounded-full px-6 py-3 text-sm font-medium"
              style={{ background: "var(--gold)", color: "var(--espresso)" }}
            >
              Order online
            </Link>
            <a
              href="tel:+233302810990"
              className="rounded-full border px-6 py-3 text-sm font-medium"
              style={{ borderColor: "var(--ivory)", color: "var(--ivory)" }}
            >
              Call to order
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl" style={{ color: "var(--gold)" }}>
        {number}
      </div>
      <div className="text-xs" style={{ color: "var(--ivory-dim)" }}>
        {label}
      </div>
    </div>
  );
}
