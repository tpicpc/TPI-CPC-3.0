"use client";

// Flat bento-style photo grid (inspired by the rounded tile look of Life at Spark).
// Tiles follow a repeating size pattern; `grid-flow-dense` back-fills gaps so the
// layout stays tight at every breakpoint.

// Repeating pattern of tile shapes: [colSpan, rowSpan]
const PATTERN = [
  "col-span-2 row-span-2", // feature
  "",
  "row-span-2", // tall
  "",
  "col-span-2", // wide
  "",
  "",
  "row-span-2",
  "col-span-2",
  "",
];

const sizesFor = (cls) =>
  cls.includes("col-span-2")
    ? "(min-width:1280px) 40vw, (min-width:768px) 50vw, 100vw"
    : "(min-width:1280px) 20vw, (min-width:768px) 25vw, 50vw";

export default function GalleryGrid({ images, onOpen }) {
  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 grid-flow-dense gap-3 md:gap-4 auto-rows-[150px] sm:auto-rows-[190px] lg:auto-rows-[220px]`}
    >
      {images.map((img, i) => {
        const shape = PATTERN[i % PATTERN.length];
        return (
          <button
            key={img._id}
            type="button"
            onClick={() => onOpen(i)}
            aria-label={`Open ${img.title || img.caption || "photo"}`}
            className={`group relative block overflow-hidden rounded-2xl md:rounded-3xl bg-gray-100 dark:bg-gray-800/80 ring-1 ring-black/5 dark:ring-white/10 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/20 dark:hover:ring-indigo-400/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${shape}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.mediumUrl || img.thumbUrl || img.url}
              srcSet={
                [
                  img.thumbUrl && `${img.thumbUrl} 180w`,
                  img.mediumUrl && `${img.mediumUrl} 640w`,
                  img.width ? `${img.url} ${img.width}w` : null,
                ]
                  .filter(Boolean)
                  .join(", ") || undefined
              }
              sizes={sizesFor(shape)}
              alt={img.title || img.caption || "Gallery image"}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/85 via-indigo-950/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            {(img.title || img.category) && (
              <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 text-left translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {img.category && (
                  <span className="inline-block mb-1 rounded-full bg-indigo-500/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                    {img.category}
                  </span>
                )}
                {img.title && <p className="text-sm md:text-base font-semibold text-white line-clamp-2">{img.title}</p>}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
