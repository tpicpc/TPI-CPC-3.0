"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function Lightbox({ images, index, onClose, onIndexChange }) {
  const [loaded, setLoaded] = useState(false);
  const image = images[index];
  const count = images.length;

  const go = useCallback(
    (dir) => {
      setLoaded(false);
      onIndexChange((index + dir + count) % count);
    },
    [index, count, onIndexChange]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [go, onClose]);

  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.title || "Image viewer"}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
        <X size={22} />
      </button>
      {count > 1 && (
        <>
          <button aria-label="Previous" onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-2 md:left-6 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
            <ChevronLeft size={24} />
          </button>
          <button aria-label="Next" onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-2 md:right-6 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
            <ChevronRight size={24} />
          </button>
        </>
      )}
      <figure className="max-w-6xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex items-center justify-center w-full">
          {!loaded && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.mediumUrl || image.thumbUrl || image.url} alt="" aria-hidden className="max-h-[80vh] max-w-full object-contain rounded-lg blur-sm opacity-70" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={image._id}
            src={image.url}
            alt={image.title || image.caption || "Gallery image"}
            onLoad={() => setLoaded(true)}
            className={`max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl ${loaded ? "" : "absolute opacity-0"}`}
          />
        </div>
        {(image.title || image.caption || image.category) && (
          <figcaption className="mt-4 text-center text-white max-w-3xl">
            {image.category && <span className="inline-block text-xs uppercase tracking-wide bg-indigo-500/80 px-2 py-0.5 rounded mb-2">{image.category}</span>}
            {image.title && <p className="font-semibold text-lg">{image.title}</p>}
            {image.caption && <p className="text-sm text-gray-300 mt-1">{image.caption}</p>}
          </figcaption>
        )}
        <p className="mt-2 text-xs text-gray-400">{index + 1} / {count}</p>
      </figure>
    </div>
  );
}
