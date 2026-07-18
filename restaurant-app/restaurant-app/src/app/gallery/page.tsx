const GALLERY_ITEMS = [
  { name: "Jollof Rice", color: "var(--brick)" },
  { name: "Grilled Tilapia", color: "var(--herb)" },
  { name: "Waakye", color: "var(--gold)" },
  { name: "Kelewele", color: "var(--brick-dark, var(--brick))" },
  { name: "Sobolo", color: "var(--herb)" },
  { name: "Banku & Okro Stew", color: "var(--gold)" },
  { name: "Fried Rice Special", color: "var(--brick)" },
  { name: "Grilled Chicken", color: "var(--herb)" },
];

export default function GalleryPage() {
  return (
    <main style={{ background: "var(--ivory)" }}>
      <div className="px-6 py-16" style={{ background: "var(--espresso)" }}>
        <div className="mx-auto max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "var(--gold)" }}>
            Gallery
          </span>
          <h1 className="font-display mt-2 text-4xl" style={{ color: "var(--ivory)" }}>
            A taste, in pictures
          </h1>
          <p className="mt-3 text-sm" style={{ color: "var(--ivory-dim)" }}>
            Placeholder tiles for now — swap these for real kitchen and dish photos in{" "}
            <code className="font-mono">src/app/gallery/page.tsx</code>.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {GALLERY_ITEMS.map((item, i) => (
            <div
              key={i}
              className="flex aspect-square items-end rounded-lg p-4"
              style={{ background: item.color }}
            >
              <span className="font-display text-lg" style={{ color: "var(--ivory)" }}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
