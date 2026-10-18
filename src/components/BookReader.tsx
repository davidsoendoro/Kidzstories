"use client";

import { useEffect, useState } from "react";

export function BookReader({ storyId, title, pages }: { storyId: string; title: string; pages: string[] }) {
  const [i, setI] = useState(0);
  const total = pages.length;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setI((n) => Math.min(n + 1, total - 1));
      if (e.key === "ArrowLeft") setI((n) => Math.max(n - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  return (
    <div className="card overflow-hidden p-0">
      <div className="grid md:grid-cols-2">
        <div className="relative aspect-[4/3] bg-ink/5 md:aspect-auto md:min-h-[420px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- private, auth-gated illustration */}
          <img key={i} src={`/api/stories/${storyId}/pages/${i}`} alt={`Illustration for page ${i + 1} of ${title}`} className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="flex flex-col justify-between p-8 md:p-10">
          <p className="font-display text-2xl leading-relaxed sm:text-[1.7rem]">{pages[i]}</p>
          <div className="mt-8 flex items-center justify-between">
            <button className="btn-secondary" onClick={() => setI(Math.max(i - 1, 0))} disabled={i === 0}>← Back</button>
            <span className="text-sm font-semibold text-ink/50" aria-live="polite">Page {i + 1} of {total}</span>
            <button className="btn-primary" onClick={() => setI(Math.min(i + 1, total - 1))} disabled={i === total - 1}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
