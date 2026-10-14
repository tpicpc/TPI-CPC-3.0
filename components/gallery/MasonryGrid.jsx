"use client";

export default function MasonryGrid({ images, onOpen }) {
  return (
    <div className="columns-2 md:columns-3 xl:columns-4 gap-3 md:gap-4 [column-fill:_balance]">
      {images.map((img, i) => (
        <button
          key={img._id}
          type="button"
          onClick={() => onOpen(i)}
          className="group relative mb-3 md:mb-4 block w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 break-inside-avoid focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          style={img.width && img.height ? { aspectRatio: `${img.width} / ${img.height}` } : undefined}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.mediumUrl || img.thumbUrl || img.url}
            srcSet={[
              img.thumbUrl && `${img.thumbUrl} 180w`,
              img.mediumUrl && `${img.mediumUrl} 640w`,
              img.width ? `${img.url} ${img.width}w` : null,
            ].filter(Boolean).join(", ") || undefined}
            sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw"
            alt={img.title || img.caption || "Gallery image"}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {(img.title || img.category) && (
            <div className="absolute inset-x-0 bottom-0 p-3 text-left bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              {img.category && <span className="text-[10px] uppercase tracking-wide text-indigo-200">{img.category}</span>}
              {img.title && <p className="text-sm font-semibold text-white line-clamp-2">{img.title}</p>}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
