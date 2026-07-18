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
    <main className="min-h-screen bg-neutral-50 p-6 text-neutral-900">
      <h1 className="mb-6 text-xl font-semibold">Admin Dashboard</h1>
      <div className="flex h-[600px] max-w-2xl flex-col rounded-lg border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-4 py-3 font-medium">Operations Assistant</div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
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
            placeholder="e.g. What should I reorder this week?"
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
      </div>
    </main>
  );
}
