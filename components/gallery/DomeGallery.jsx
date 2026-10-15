"use client";

// Interactive 3D "dome" of photos, inspired by the Life at Spark gallery.
// Drag (or swipe) to rotate; click a tile to open it in the lightbox.
import { useEffect, useMemo, useRef, useState } from "react";

const COLS = 14;
const ROWS = 5;

export default function DomeGallery({ images, onOpen }) {
  const [rot, setRot] = useState({ x: -8, y: 0 });
  const drag = useRef(null);
  const moved = useRef(false);
  const autoRef = useRef(true);

  const tiles = useMemo(() => {
    if (!images.length) return [];
    const out = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = (r * COLS + c) % images.length;
        out.push({ key: `${r}-${c}`, img: images[i], index: i, r, c });
      }
    }
    return out;
  }, [images]);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let raf;
    const tick = () => {
      if (autoRef.current && !drag.current) setRot((p) => ({ ...p, y: p.y + 0.05 }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onDown = (e) => {
    drag.current = { x: e.clientX, y: e.clientY, rot };
    moved.current = false;
    autoRef.current = false;
  };
  const onMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true;
    setRot({
      x: Math.max(-30, Math.min(30, drag.current.rot.x - dy * 0.15)),
      y: drag.current.rot.y + dx * 0.2,
    });
  };
  const onUp = () => {
    drag.current = null;
    setTimeout(() => { autoRef.current = true; }, 2500);
  };

  if (!tiles.length) return null;

  const radius = "clamp(380px, 55vw, 760px)";
  return (
    <div
      className="relative h-[420px] md:h-[560px] overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing"
      style={{ perspective: "1400px" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
    >
      <div
        className="absolute left-1/2 top-1/2 w-0 h-0"
        style={{ transformStyle: "preserve-3d", transform: `translateZ(calc(${radius} * -1)) rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}
      >
        {tiles.map((t) => {
          const ry = (360 / COLS) * t.c + (t.r % 2 ? 360 / COLS / 2 : 0);
          const rx = (t.r - (ROWS - 1) / 2) * 13;
          return (
            <button
              key={t.key}
              type="button"
              aria-label={t.img.title || "Open image"}
              onClick={() => { if (!moved.current) onOpen(t.index); }}
              className="absolute block overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-800 shadow-lg hover:ring-2 hover:ring-indigo-500 transition-shadow"
              style={{
                width: "clamp(110px, 13vw, 190px)",
                height: "clamp(80px, 9.5vw, 140px)",
                marginLeft: "calc(clamp(110px, 13vw, 190px) / -2)",
                marginTop: "calc(clamp(80px, 9.5vw, 140px) / -2)",
                transform: `rotateY(${ry}deg) rotateX(${-rx}deg) translateZ(${radius})`,
                backfaceVisibility: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.img.thumbUrl || t.img.mediumUrl || t.img.url} alt="" loading="lazy" decoding="async" draggable={false} className="w-full h-full object-cover pointer-events-none" />
            </button>
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,white_88%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_45%,rgb(2,6,23)_88%)]" />
    </div>
  );
}
