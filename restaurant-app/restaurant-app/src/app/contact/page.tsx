"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // No backend endpoint for messages yet — this is a placeholder confirmation.
    // Wire this up to an email service (e.g. Resend) or a `contact_messages` table when ready.
    setSent(true);
  }

  return (
    <main style={{ background: "var(--ivory)" }}>
      <div className="px-6 py-16" style={{ background: "var(--espresso)" }}>
        <div className="mx-auto max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "var(--gold)" }}>
            Get in touch
          </span>
          <h1 className="font-display mt-2 text-4xl" style={{ color: "var(--ivory)" }}>
            Contact us
          </h1>
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-2">
        <div>
          <h2 className="font-display mb-4 text-xl" style={{ color: "var(--espresso)" }}>
            Head office
          </h2>
          <ul className="space-y-2 text-sm" style={{ color: "rgba(43,24,16,0.75)" }}>
            <li>Plot 12, Spintex Road, Accra, Ghana</li>
            <li className="font-mono">+233 302 810 990</li>
            <li>hello@swingylicks.com</li>
            <li>10:00 AM – 10:30 PM daily</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {sent ? (
            <p className="rounded-lg border p-4 text-sm" style={{ borderColor: "var(--herb)", color: "var(--herb)" }}>
              Thanks — we'll get back to you soon.
            </p>
          ) : (
            <>
              <input
                required
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm"
                style={{ borderColor: "rgba(43,24,16,0.2)" }}
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm"
                style={{ borderColor: "rgba(43,24,16,0.2)" }}
              />
              <textarea
                required
                placeholder="Message"
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm"
                style={{ borderColor: "rgba(43,24,16,0.2)" }}
              />
              <button
                type="submit"
                className="rounded-full px-5 py-2 text-sm font-medium"
                style={{ background: "var(--brick)", color: "var(--ivory)" }}
              >
                Send message
              </button>
            </>
          )}
        </form>
      </div>
    </main>
  );
}
