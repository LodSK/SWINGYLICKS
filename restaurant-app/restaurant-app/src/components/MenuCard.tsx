"use client";

import { useCart } from "@/lib/cart-context";

export type MenuItem = {
  item_id: string;
  name: string;
  description: string;
  price: string;
  category: string;
};

export function MenuCard({ item }: { item: MenuItem }) {
  const { addItem } = useCart();
  return (
    <div
      className="rounded-lg border p-4"
      style={{ background: "var(--ivory)", borderColor: "rgba(43,24,16,0.12)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-display text-lg" style={{ color: "var(--espresso)" }}>
          {item.name}
        </span>
        <span className="font-mono shrink-0 text-sm" style={{ color: "var(--brick)" }}>
          GHS {item.price}
        </span>
      </div>
      {item.description && (
        <p className="mt-1 text-sm" style={{ color: "rgba(43,24,16,0.7)" }}>
          {item.description}
        </p>
      )}
      <button
        onClick={() => addItem({ item_id: item.item_id, name: item.name, price: parseFloat(item.price) })}
        className="mt-3 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide"
        style={{ background: "var(--herb)", color: "var(--ivory)" }}
      >
        Add to order
      </button>
    </div>
  );
}
