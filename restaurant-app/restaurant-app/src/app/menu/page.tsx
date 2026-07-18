"use client";

import { useEffect, useState } from "react";
import { MenuCard, MenuItem } from "@/components/MenuCard";
import { CartPanel } from "@/components/CartPanel";

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    fetch("/api/menu").then((r) => r.json()).then((d) => setMenu(d.items ?? []));
  }, []);

  const categories = ["All", ...Array.from(new Set(menu.map((m) => m.category)))];
  const filtered = activeCategory === "All" ? menu : menu.filter((m) => m.category === activeCategory);

  const grouped = filtered.reduce<Record<string, MenuItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <main className="min-h-screen" style={{ background: "var(--ivory)" }}>
      <div className="px-6 py-12" style={{ background: "var(--espresso)" }}>
        <div className="mx-auto max-w-6xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "var(--gold)" }}>
            Full menu
          </span>
          <h1 className="font-display mt-2 text-4xl" style={{ color: "var(--ivory)" }}>
            Order online
          </h1>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="rounded-full px-4 py-1.5 text-sm font-medium"
                style={
                  activeCategory === cat
                    ? { background: "var(--brick)", color: "var(--ivory)" }
                    : { background: "var(--ivory-dim)", color: "var(--ink)" }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-10">
              <h3
                className="mb-3 border-b pb-2 text-sm font-semibold uppercase tracking-wide"
                style={{ borderColor: "rgba(43,24,16,0.15)", color: "var(--herb)" }}
              >
                {category}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((item) => (
                  <MenuCard key={item.item_id} item={item} />
                ))}
              </div>
            </div>
          ))}

          {menu.length === 0 && (
            <p className="text-sm" style={{ color: "var(--ink)" }}>
              The menu is empty right now — connect the database and add some dishes.
            </p>
          )}
        </section>

        <CartPanel />
      </div>
    </main>
  );
}
