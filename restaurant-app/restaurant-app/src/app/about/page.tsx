export default function AboutPage() {
  return (
    <main style={{ background: "var(--ivory)" }}>
      <div className="px-6 py-16" style={{ background: "var(--espresso)" }}>
        <div className="mx-auto max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "var(--gold)" }}>
            Our story
          </span>
          <h1 className="font-display mt-2 text-4xl" style={{ color: "var(--ivory)" }}>
            Cooking Ghana's flavor since day one
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-6 py-16 text-base leading-relaxed" style={{ color: "var(--ink)" }}>
        <p>
          Swingy Licks started with one simple idea: real Ghanaian cooking, served fast, without
          cutting a single corner. What began as a single kitchen has grown into a small family of
          branches across Accra and beyond — but the pots are still watched the same way they always
          were, and the jollof still gets the same patient attention.
        </p>
        <p>
          Every dish on our menu is built from ingredients sourced close to home, prepared fresh
          each morning by cooks who grew up eating this food, not just cooking it. We believe fast
          food doesn't have to mean forgettable food — it just means we've gotten very good at doing
          things right, quickly.
        </p>
        <p>
          Today, our kitchens serve thousands of plates a week, our AI assistant helps first-timers
          find their new favorite dish, and our team keeps growing — but the goal hasn't changed:
          make you feel like you just ate at home.
        </p>

        <div className="mt-10 grid grid-cols-3 gap-6 border-t pt-8" style={{ borderColor: "rgba(43,24,16,0.1)" }}>
          <div>
            <div className="font-display text-3xl" style={{ color: "var(--brick)" }}>30+</div>
            <div className="text-sm" style={{ color: "rgba(43,24,16,0.6)" }}>Years of flavor</div>
          </div>
          <div>
            <div className="font-display text-3xl" style={{ color: "var(--brick)" }}>200+</div>
            <div className="text-sm" style={{ color: "rgba(43,24,16,0.6)" }}>Team members</div>
          </div>
          <div>
            <div className="font-display text-3xl" style={{ color: "var(--brick)" }}>4</div>
            <div className="text-sm" style={{ color: "rgba(43,24,16,0.6)" }}>Locations</div>
          </div>
        </div>
      </div>
    </main>
  );
}
