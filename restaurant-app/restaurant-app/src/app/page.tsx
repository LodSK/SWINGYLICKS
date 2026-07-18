"use client";

import { useEffect, useState } from "react";
import { CartProvider, useCart } from "@/lib/cart-context";

type MenuItem = {
  item_id: string;
  name: string;
  description: string;
  price: string;
  category: string;
};

type ChatMsg = { sender: "user" | "bot"; content: string };

export default function Home() {
  return (
    <CartProvider>
      <PageContent />
    </CartProvider>
  );
}

function PageContent() {
  const [menu, setMenu] = useState<MenuItem[]>([]);

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((d) => setMenu(d.items ?? []));
  }, []);

  const grouped = menu.reduce<Record<string, MenuItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <main className="min-h-screen" style={{ background: "var(--ivory)" }}>
      <Header />
      <Hero />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-14 lg:grid-cols-[1fr_360px]">
        <section id="menu">
          <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "var(--brick)" }}>
            The Menu
          </span>
          <h2 className="font-display mt-2 mb-8 text-3xl" style={{ color: "var(--espresso)" }}>
            What's cooking today
          </h2>

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

          <ChatWidget />
        </section>

        <CartPanel />
      </div>

      <Footer />
    </main>
  );
}

function Header() {
  const { lines } = useCart();
  const count = lines.reduce((n, l) => n + l.quantity, 0);
  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-6 py-4"
      style={{ background: "var(--espresso)" }}
    >
      <span className="font-display text-xl" style={{ color: "var(--ivory)" }}>
        FoodFusion
      </span>
      <nav className="flex items-center gap-6">
        <a href="#menu" className="text-sm" style={{ color: "var(--ivory-dim)" }}>
          Menu
        </a>
        <a
          href="#cart"
          className="font-mono flex items-center gap-2 rounded-full px-3 py-1.5 text-sm"
          style={{ background: "var(--brick)", color: "var(--ivory)" }}
        >
          Order · {count}
        </a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section
      className="relative overflow-hidden px-6 py-20"
      style={{ background: "var(--espresso)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, var(--gold) 0px, var(--gold) 2px, transparent 2px, transparent 40px)",
        }}
      />
      <div className="relative mx-auto max-w-3xl">
        <span className="font-mono text-xs uppercase tracking-[0.25em]" style={{ color: "var(--gold)" }}>
          Accra · Est. today
        </span>
        <h1 className="font-display mt-4 text-5xl leading-tight sm:text-6xl" style={{ color: "var(--ivory)" }}>
          Ghana on a plate,
          <br />
          <em style={{ color: "var(--gold)" }}>made to order.</em>
        </h1>
        <p className="mt-5 max-w-lg text-base" style={{ color: "var(--ivory-dim)" }}>
          Jollof, grilled classics, and cold sobolo — order online, book a table, or ask
          our assistant what to try first.
        </p>
        <a
          href="#menu"
          className="mt-8 inline-block rounded-full px-6 py-3 text-sm font-medium"
          style={{ background: "var(--brick)", color: "var(--ivory)" }}
        >
          See the menu
        </a>
      </div>
    </section>
  );
}

function MenuCard({ item }: { item: MenuItem }) {
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

function CartPanel() {
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

function ChatWidget() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { sender: "bot", content: "Hungry? Tell me what you're craving and I'll point you to the right dish." },
  ]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [sending, setSending] = useState(false);

  async function sendMessage() {
    if (!input.trim() || sending) return;
    const text = input;
    setInput("");
    setMessages((m) => [...m, { sender: "user", content: text }]);
    setSending(true);
    try {
      const res = await fetch("/api/ai/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversationId, message: text }),
      });
      const data = await res.json();
      setConversationId(data.conversation_id);
      setMessages((m) => [...m, { sender: "bot", content: data.reply }]);
    } catch {
      setMessages((m) => [...m, { sender: "bot", content: "Sorry, something went wrong." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-12 rounded-lg border p-5" style={{ borderColor: "rgba(43,24,16,0.15)" }}>
      <h3 className="font-display mb-3 text-lg" style={{ color: "var(--espresso)" }}>
        Ask our assistant
      </h3>
      <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className="max-w-[85%] rounded-lg px-3 py-2 text-sm"
            style={
              m.sender === "user"
                ? { marginLeft: "auto", background: "var(--brick)", color: "var(--ivory)" }
                : { background: "var(--ivory-dim)", color: "var(--ink)" }
            }
          >
            {m.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded border px-3 py-2 text-sm"
          style={{ borderColor: "rgba(43,24,16,0.2)" }}
          placeholder="What should I order?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={sending}
          className="rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50"
          style={{ background: "var(--herb)", color: "var(--ivory)" }}
        >
          Ask
        </button>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="px-6 py-10 text-center text-xs" style={{ background: "var(--espresso)", color: "var(--ivory-dim)" }}>
      FoodFusion Restaurant · Accra, Ghana
    </footer>
  );
}
