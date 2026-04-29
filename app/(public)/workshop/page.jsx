"use client";

import SectionTitle from "@/components/SectionTitle";
import { CardGridSkeleton } from "@/components/skeletons";
import { formatDate } from "@/lib/utils";
import axios from "axios";
import { BellRing, BookOpen, Calendar, PlayCircle, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function WorkshopPage() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/v1/workshop/list?status=Public");
        if (data.success) setWorkshops(data.workshops);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(workshops.map((w) => w.category).filter(Boolean))],
    [workshops]
  );

  const filtered = workshops.filter((w) =>
    (category === "All" || w.category === category) &&
    w.title.toLowerCase().includes(q.toLowerCase())
  );

  const published = filtered.filter((w) => w.status === "Published");
  const comingSoon = filtered.filter((w) => w.status === "ComingSoon");

  return (
    <div className="px-4 md:px-10 container mx-auto py-16">
      <SectionTitle
        title="Workshops & Courses"
        subtitle="Learn at your own pace — curated video lessons, playlists, and tutorials"
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-sm transition ${
                category === c
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search courses..."
          className="w-full md:w-64 px-4 py-2 rounded-md border bg-background"
        />
      </div>

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5">
          <Sparkles className="mx-auto text-indigo-500 mb-3" size={32} />
          <p className="text-gray-700 dark:text-gray-300 font-medium">More courses coming soon</p>
          <p className="text-sm text-gray-500 mt-1">Stay tuned — we're cooking up something special.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Available now */}
          {published.length > 0 && (
            <section>
              {comingSoon.length > 0 && (
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <PlayCircle size={20} className="text-indigo-500" />
                  Available Now
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400">
                    {published.length}
                  </span>
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {published.map((w) => (
                  <Link
                    key={w._id}
                    href={`/workshop/${w.slug}`}
                    className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col group"
                  >
                    <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img src={w.thumbnail} alt={w.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition">
                        <PlayCircle className="text-white opacity-0 group-hover:opacity-100 transition" size={56} />
                      </div>
                      {w.featured && (
                        <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">★ Featured</span>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs px-2 py-1 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">{w.category}</span>
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{w.level}</span>
                      </div>
                      <h3 className="font-bold text-lg line-clamp-2 text-gray-900 dark:text-white">{w.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2 flex-1">{w.description}</p>
                      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><User size={14} /> {w.instructor}</span>
                        <span className="flex items-center gap-1"><BookOpen size={14} /> {w.lessons?.length || 0} lessons</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Coming Soon */}
          {comingSoon.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-amber-500" />
                Coming Soon
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  {comingSoon.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {comingSoon.map((w) => (
                  <div
                    key={w._id}
                    className="relative rounded-xl border border-amber-300/40 dark:border-amber-400/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10 backdrop-blur-sm overflow-hidden flex flex-col"
                  >
                    <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                    <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img src={w.thumbnail} alt={w.title} className="w-full h-full object-cover opacity-70" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute top-2 right-2 flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500 text-amber-900 shadow-lg">
                        <Sparkles size={12} /> Coming Soon
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs px-2 py-1 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">{w.category}</span>
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{w.level}</span>
                      </div>
                      <h3 className="font-bold text-lg line-clamp-2 text-gray-900 dark:text-white">{w.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3 flex-1">{w.description}</p>
                      <div className="flex items-center gap-3 mt-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                        {w.releaseDate && (
                          <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                            <Calendar size={13} /> {formatDate(w.releaseDate)}
                          </span>
                        )}
                        <span className="flex items-center gap-1"><User size={13} /> {w.instructor}</span>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 rounded-md px-3 py-2">
                        <BellRing size={13} />
                        <span>Get notified — follow our Facebook page for the launch</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
