"use client";

import { useEffect, useState } from "react";

/** Thin progress bar at the very top of the viewport while reading an article. */
export default function ReadingProgress({ targetId = "article-body" }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById(targetId);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const read = Math.min(Math.max(-rect.top + window.innerHeight * 0.2, 0), Math.max(total, 1));
      setPct(Math.round((read / Math.max(total, 1)) * 100));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetId]);

  return (
    <div className="fixed top-0 inset-x-0 h-[3px] z-[60] pointer-events-none" aria-hidden="true">
      <div
        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-150"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
