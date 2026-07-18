"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

export function CartPanel() {
  const { lines, updateQuantity, subtotal, clear } = useCart();
  const [step, setStep] = useState<"cart" | "details" | "confirmed">("cart");
  const [form, setForm] = useState({ full_name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<any>(null);

  const tax = subtotal * 0.125;
  const total = subtotal + tax;

  async function placeOrder() {
    setSubmitting(true);
    setError(null);
    try {
      const custRes = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const custData = await custRes.json();
      if (!custRes.ok) throw new Error(custData.error?.formErrors?.[0] ?? "Could not save your details");

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: custData.customer_id,
          channel: "takeaway",
          items: lines.map((l) => ({ item_id: l.item_id, quantity: l.quantity })),
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error ?? "Could not place your order");

      setConfirmation(orderData.order);
      setStep("confirmed");
      clear();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <aside
      id="cart"
      className="h-fit rounded-lg border p-5 lg:sticky lg:top-24"
      style={{ background: "var(--espresso)", borderColor: "rgba(251,241,222,0.1)" }}
    >
      <h3 className="font-display mb-4 text-lg" style={{ color: "var(--gold)" }}>
        Your order
      </h3>

      {step === "confirmed" && confirmation ? (
        <div className="font-mono text-sm" style={{ color: "var(--ivory)" }}>
          <p style={{ color: "var(--gold)" }}>✓ Order placed</p>
          <p className="mt-2 text-xs" style={{ color: "var(--ivory-dim)" }}>
            Order #{confirmation.order_id.slice(0, 8)}
          </p>
          <div className="mt-3 space-y-1 border-t border-dotted pt-3" style={{ borderColor: "rgba(251,241,222,0.3)" }}>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>GHS {confirmation.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>GHS {confirmation.tax_total}</span>
            </div>
            <div className="flex justify-between font-semibold" style={{ color: "var(--gold)" }}>
              <span>Total</span>
              <span>GHS {confirmation.grand_total}</span>
            </div>
          </div>
          <button
            onClick={() => setStep("cart")}
            className="mt-4 rounded-full px-4 py-1.5 text-xs"
            style={{ background: "var(--brick)", color: "var(--ivory)" }}
          >
            Start a new order
          </button>
        </div>
      ) : lines.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--ivory-dim)" }}>
          Nothing here yet — add a dish from the menu.
        </p>
      ) : step === "cart" ? (
        <>
          <div className="font-mono space-y-2 text-sm" style={{ color: "var(--ivory)" }}>
            {lines.map((l) => (
              <div key={l.item_id} className="receipt-line" style={{ color: "var(--ivory)" }}>
                <span>
                  {l.quantity}× {l.name}
                </span>
                <span className="leader" style={{ borderColor: "rgba(251,241,222,0.25)" }} />
                <span>{(l.price * l.quantity).toFixed(2)}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => updateQuantity(l.item_id, l.quantity - 1)}
                    aria-label={`Remove one ${l.name}`}
                    className="px-1 text-xs"
                    style={{ color: "var(--gold)" }}
                  >
                    −
                  </button>
                  <button
                    onClick={() => updateQuantity(l.item_id, l.quantity + 1)}
                    aria-label={`Add one ${l.name}`}
                    className="px-1 text-xs"
                    style={{ color: "var(--gold)" }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div
            className="font-mono mt-4 space-y-1 border-t border-dotted pt-3 text-sm"
            style={{ borderColor: "rgba(251,241,222,0.3)", color: "var(--ivory)" }}
          >
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>GHS {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ color: "var(--ivory-dim)" }}>
              <span>Tax (12.5%)</span>
              <span>GHS {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold" style={{ color: "var(--gold)" }}>
              <span>Total</span>
              <span>GHS {total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={() => setStep("details")}
            className="mt-4 w-full rounded-full py-2 text-sm font-medium"
            style={{ background: "var(--gold)", color: "var(--espresso)" }}
          >
            Checkout
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <input
            placeholder="Full name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ background: "var(--ivory)", borderColor: "rgba(251,241,222,0.2)" }}
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ background: "var(--ivory)", borderColor: "rgba(251,241,222,0.2)" }}
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ background: "var(--ivory)", borderColor: "rgba(251,241,222,0.2)" }}
          />
          {error && (
            <p className="text-xs" style={{ color: "var(--brick)" }}>
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setStep("cart")}
              className="flex-1 rounded-full py-2 text-sm"
              style={{ background: "rgba(251,241,222,0.1)", color: "var(--ivory)" }}
            >
              Back
            </button>
            <button
              onClick={placeOrder}
              disabled={submitting || !form.full_name || !form.email || !form.phone}
              className="flex-1 rounded-full py-2 text-sm font-medium disabled:opacity-50"
              style={{ background: "var(--gold)", color: "var(--espresso)" }}
            >
              {submitting ? "Placing..." : "Place order"}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
