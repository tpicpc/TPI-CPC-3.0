"use client";

import SectionTitle from "@/components/SectionTitle";
import { CardGridSkeleton } from "@/components/skeletons";
import axios from "axios";
import { Download, FileText, Search, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams();
        if (category !== "all") params.set("category", category);
        if (q) params.set("q", q);
        const { data } = await axios.get(`/api/v1/resources?${params}`);
        if (data.success) {
          setResources(data.resources);
          setCategories(data.categories);
        }
      } finally { setLoading(false); }
    })();
  }, [category, q]);

  const allCategories = useMemo(() => ["all", ...categories], [categories]);

  return (
    <div className="px-4 md:px-10 container mx-auto py-16">
      <SectionTitle
        title="Resource Library"
        subtitle="Free notes, cheat sheets, and e-books curated by TPI CPC. Click to download."
      />

      <div className="flex flex-col md:flex-row gap-3 mb-6 items-stretch md:items-center">
        <div className="flex flex-wrap gap-2">
          {allCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-sm transition capitalize ${
                category === c ? "bg-indigo-500 text-white" : "bg-white dark:bg-gray-800 border hover:bg-gray-100"
              }`}
            >
              {c === "all" ? "All categories" : c}
            </button>
          ))}
        </div>
        <div className="relative flex-1 md:max-w-sm md:ml-auto">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-4 py-2 rounded-md border bg-background" />
        </div>
      </div>

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : resources.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed">
          <FileText className="mx-auto text-indigo-500 mb-3" size={32} />
          <p className="text-gray-700 dark:text-gray-300 font-medium">No resources yet</p>
          <p className="text-sm text-gray-500 mt-1">Check back soon — we're curating content for you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((r) => (
            <a
              key={r._id}
              href={`/api/v1/resources/${r._id}/download`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col group"
            >
              <div className="aspect-video bg-gradient-to-br from-indigo-500/20 to-violet-500/20 overflow-hidden relative flex items-center justify-center">
                {r.thumbnailUrl ? (
                  <img src={r.thumbnailUrl} alt={r.title} className="w-full h-full object-cover" />
                ) : (
                  <FileText size={48} className="text-indigo-400" />
                )}
                {r.featured && <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><Star size={12} /> Featured</span>}
                {r.fileType && <span className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded uppercase">{r.fileType}</span>}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <span className="text-[10px] uppercase tracking-wide text-indigo-600 dark:text-indigo-400 font-bold">{r.category}</span>
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mt-1">{r.title}</h3>
                {r.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3 flex-1">{r.description}</p>}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Download size={12} /> {r.downloads} downloads {r.fileSize && `· ${r.fileSize}`}</span>
                  <span className="text-xs font-bold text-indigo-500 group-hover:underline">Download →</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
