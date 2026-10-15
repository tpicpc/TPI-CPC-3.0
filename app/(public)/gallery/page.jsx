"use client";

import DomeGallery from "@/components/gallery/DomeGallery";
import Lightbox from "@/components/gallery/Lightbox";
import MasonryGrid from "@/components/gallery/MasonryGrid";
import SectionTitle from "@/components/SectionTitle";
import axios from "axios";
import { ImageIcon, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(null); // { list, index }

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/v1/gallery");
        if (data.success) {
          setImages(data.images);
          setCategories(data.categories || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(
    () => (filter === "All" ? images : images.filter((i) => i.category === filter)),
    [images, filter]
  );

  return (
    <div className="py-16">
      <div className="px-4 md:px-10 container mx-auto">
        <SectionTitle title="Life at TPI CPC" subtitle="Moments from our events, workshops, contests and everyday club life." />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><LoaderCircle className="animate-spin" /></div>
      ) : images.length === 0 ? (
        <div className="px-4 container mx-auto text-center py-20 text-gray-500 dark:text-gray-400">
          <ImageIcon className="mx-auto mb-3" size={40} />
          No photos yet. Check back soon!
        </div>
      ) : (
        <>
          <div className="hidden md:block mb-12">
            <DomeGallery images={images.slice(0, 40)} onOpen={(index) => setOpen({ list: images.slice(0, 40), index })} />
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 -mt-4">Drag to explore · click a photo to view</p>
          </div>

          <div className="px-4 md:px-10 container mx-auto">
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                {["All", ...categories].map((c) => (
                  <button
                    key={c}
                    onClick={() => setFilter(c)}
                    className={`px-4 py-2 rounded-full text-sm transition ${
                      filter === c
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            <MasonryGrid images={filtered} onOpen={(index) => setOpen({ list: filtered, index })} />
          </div>
        </>
      )}

      {open && (
        <Lightbox
          images={open.list}
          index={open.index}
          onClose={() => setOpen(null)}
          onIndexChange={(index) => setOpen((o) => ({ ...o, index }))}
        />
      )}
    </div>
  );
}
