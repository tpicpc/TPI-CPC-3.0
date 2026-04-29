"use client";

import SectionTitle from "@/components/SectionTitle";
import { CardGridSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 9;

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/v1/blog/list");
        if (data.success) setBlogs(data.blogs);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(
    () => blogs.filter((b) => b.title.toLowerCase().includes(q.toLowerCase())),
    [blogs, q]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [q]);

  // Build a compact page-number list with ellipses
  const pageNums = useMemo(() => {
    const pages = new Set([1, totalPages, safePage, safePage - 1, safePage + 1]);
    const list = [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
    const out = [];
    for (let i = 0; i < list.length; i++) {
      if (i > 0 && list[i] - list[i - 1] > 1) out.push("…");
      out.push(list[i]);
    }
    return out;
  }, [safePage, totalPages]);

  const goTo = (n) => {
    setPage(n);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="px-4 md:px-10 container mx-auto py-16">
      <SectionTitle title="Blogs" subtitle="Articles, tutorials and stories from our community" />

      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search blogs..."
          className="w-full px-4 py-2 rounded-md border bg-background"
        />
      </div>

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500">No blogs found.</p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground text-center mb-4">
            Showing <strong>{start + 1}</strong>–<strong>{start + visible.length}</strong> of{" "}
            <strong>{filtered.length}</strong> blogs
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map((b) => (
              <Link
                key={b._id}
                href={`/blogs/${b._id}`}
                className="rounded-xl border bg-white dark:bg-gray-900 overflow-hidden hover:shadow-xl transition"
              >
                <img src={b.image} alt={b.title} className="w-full h-48 object-cover" />
                <div className="p-5">
                  <h3 className="font-bold line-clamp-2">{b.title}</h3>
                  <p className="text-xs text-gray-500 mt-2">{formatDate(b.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-10 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goTo(safePage - 1)}
                disabled={safePage === 1}
              >
                <ChevronLeft size={14} className="mr-1" /> Prev
              </Button>

              {pageNums.map((n, i) =>
                n === "…" ? (
                  <span key={`gap-${i}`} className="px-2 text-gray-400 select-none">
                    …
                  </span>
                ) : (
                  <button
                    key={n}
                    onClick={() => goTo(n)}
                    className={`min-w-[36px] h-9 px-2 rounded-md text-sm font-medium transition ${
                      n === safePage
                        ? "bg-indigo-500 text-white"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {n}
                  </button>
                )
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => goTo(safePage + 1)}
                disabled={safePage === totalPages}
              >
                Next <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
