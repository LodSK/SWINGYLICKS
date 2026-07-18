"use client";

import { useEffect, useState } from "react";

type MenuItem = {
  item_id: string;
  name: string;
  description: string;
  price: string;
  category: string;
};

type ChatMsg = { sender: "user" | "bot"; content: string };

export default function Home() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { sender: "bot", content: "Hi! I can recommend dishes or help you order. What are you in the mood for?" },
  ]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((d) => setMenu(d.items ?? []));
  }, []);

  const grouped = menu.reduce<Record<string, MenuItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

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
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold">FoodFusion Restaurant</h1>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 p-6 md:grid-cols-3">
        <section className="md:col-span-2">
          <h2 className="mb-4 text-lg font-medium">Menu</h2>
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                {category}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((item) => (
                  <div key={item.item_id} className="rounded-lg border border-neutral-200 bg-white p-4">
                    <div className="flex items-start justify-between">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-neutral-600">GHS {item.price}</span>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-sm text-neutral-500">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {menu.length === 0 && (
            <p className="text-sm text-neutral-500">
              No menu data yet — connect DATABASE_URL to your Supabase project.
            </p>
          )}
        </section>

        <aside className="flex h-[600px] flex-col rounded-lg border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-4 py-3 font-medium">Ask our assistant</div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  m.sender === "user" ? "ml-auto bg-neutral-900 text-white" : "bg-neutral-100"
                }`}
              >
                {m.content}
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t border-neutral-200 p-3">
            <input
              className="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm"
              placeholder="Ask about dishes, allergies, place an order..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={sending}
              className="rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
