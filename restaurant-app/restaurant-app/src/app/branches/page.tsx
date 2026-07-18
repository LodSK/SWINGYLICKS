"use client";

import { useEffect, useState } from "react";

type Branch = {
  branch_id: string;
  name: string;
  address: string;
  phone: string;
  opens_at: string;
  closes_at: string;
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    fetch("/api/branches").then((r) => r.json()).then((d) => setBranches(d.branches ?? []));
  }, []);

  return (
    <main style={{ background: "var(--ivory)" }}>
      <div className="px-6 py-16" style={{ background: "var(--espresso)" }}>
        <div className="mx-auto max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "var(--gold)" }}>
            Find us
          </span>
          <h1 className="font-display mt-2 text-4xl" style={{ color: "var(--ivory)" }}>
            Branches near you
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2">
          {branches.map((b) => (
            <div key={b.branch_id} className="rounded-lg border p-5" style={{ borderColor: "rgba(43,24,16,0.1)" }}>
              <h3 className="font-display text-xl" style={{ color: "var(--espresso)" }}>
                {b.name}
              </h3>
              <p className="mt-1 text-sm" style={{ color: "rgba(43,24,16,0.7)" }}>
                {b.address}
              </p>
              <p className="font-mono mt-3 text-sm" style={{ color: "var(--brick)" }}>
                {b.phone}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--herb)" }}>
                Open {b.opens_at?.slice(0, 5)} – {b.closes_at?.slice(0, 5)}
              </p>
            </div>
          ))}
        </div>
        {branches.length === 0 && (
          <p className="text-sm" style={{ color: "var(--ink)" }}>
            No branches listed yet.
          </p>
        )}
      </div>
    </main>
  );
}
