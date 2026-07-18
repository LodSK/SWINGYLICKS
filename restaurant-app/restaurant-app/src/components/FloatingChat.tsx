"use client";

import { useState } from "react";

type ChatMsg = { sender: "user" | "bot"; content: string };

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { sender: "bot", content: "Hi! Ask me about our menu, or what to order." },
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
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div
          className="mb-3 flex h-96 w-80 flex-col rounded-lg border shadow-xl"
          style={{ background: "var(--ivory)", borderColor: "rgba(43,24,16,0.15)" }}
        >
          <div
            className="flex items-center justify-between rounded-t-lg px-4 py-3"
            style={{ background: "var(--espresso)" }}
          >
            <span className="font-display text-sm" style={{ color: "var(--ivory)" }}>
              Ask Swingy Licks
            </span>
            <button onClick={() => setOpen(false)} style={{ color: "var(--ivory-dim)" }} aria-label="Close chat">
              ✕
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
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
          <div className="flex gap-2 border-t p-2" style={{ borderColor: "rgba(43,24,16,0.1)" }}>
            <input
              className="flex-1 rounded border px-2 py-1.5 text-sm"
              style={{ borderColor: "rgba(43,24,16,0.2)" }}
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={sending}
              className="rounded-full px-3 py-1.5 text-xs font-medium disabled:opacity-50"
              style={{ background: "var(--herb)", color: "var(--ivory)" }}
            >
              Ask
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle chat"
        className="flex h-14 w-14 items-center justify-center rounded-full text-xl shadow-lg"
        style={{ background: "var(--brick)", color: "var(--ivory)" }}
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
