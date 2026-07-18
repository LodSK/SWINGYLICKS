"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type CartLine = {
  item_id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartContextType = {
  lines: CartLine[];
  addItem: (item: { item_id: string; name: string; price: number }) => void;
  removeItem: (item_id: string) => void;
  updateQuantity: (item_id: string, quantity: number) => void;
  clear: () => void;
  subtotal: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  function addItem(item: { item_id: string; name: string; price: number }) {
    setLines((prev) => {
      const existing = prev.find((l) => l.item_id === item.item_id);
      if (existing) {
        return prev.map((l) =>
          l.item_id === item.item_id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function removeItem(item_id: string) {
    setLines((prev) => prev.filter((l) => l.item_id !== item_id));
  }

  function updateQuantity(item_id: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(item_id);
      return;
    }
    setLines((prev) => prev.map((l) => (l.item_id === item_id ? { ...l, quantity } : l)));
  }

  function clear() {
    setLines([]);
  }

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  return (
    <CartContext.Provider value={{ lines, addItem, removeItem, updateQuantity, clear, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
