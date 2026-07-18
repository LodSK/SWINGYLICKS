"use client";

import { useState } from "react";

type ChatMsg = { sender: "user" | "bot"; content: string };

// In production, staff_id would come from an authenticated session (Supabase Auth).
const DEMO_STAFF_ID = "22222222-2222-2222-2222-222222222222";

export default function AdminDashboard() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { sender: "bot", content: "Ask me about sales, low stock, or upcoming reservations." },
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
      const res = await fetch("/api/ai/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff_id: DEMO_STAFF_ID, conversation_id: conversationId, message: text }),
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
    <main className="min-h-screen px-6 py-10" style={{ background: "var(--espresso)" }}>
      <div className="mx-auto max-w-2xl">
        <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "var(--gold)" }}>
          Back of house
        </span>
        <h1 className="font-display mt-2 mb-6 text-3xl" style={{ color: "var(--ivory)" }}>
          Operations dashboard
        </h1>

        <div className="flex h-[560px] flex-col rounded-lg border" style={{ borderColor: "rgba(251,241,222,0.15)", background: "var(--ivory)" }}>
          <div
            className="border-b px-4 py-3 font-display text-sm"
            style={{ borderColor: "rgba(43,24,16,0.1)", color: "var(--espresso)" }}
          >
            Operations assistant
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className="max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm"
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
          <div className="flex gap-2 border-t p-3" style={{ borderColor: "rgba(43,24,16,0.1)" }}>
            <input
              className="flex-1 rounded border px-3 py-2 text-sm"
              style={{ borderColor: "rgba(43,24,16,0.2)" }}
              placeholder="e.g. What should I reorder this week?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={sending}
              className="rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50"
              style={{ background: "var(--gold)", color: "var(--espresso)" }}
            >
              Ask
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
