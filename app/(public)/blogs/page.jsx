"use client";

import SectionTitle from "@/components/SectionTitle";
import { CardGridSkeleton } from "@/components/skeletons";
import { formatDate } from "@/lib/utils";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

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

  const filtered = blogs.filter((b) =>
    b.title.toLowerCase().includes(q.toLowerCase())
  );

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((b) => (
            <Link key={b._id} href={`/blogs/${b._id}`} className="rounded-xl border bg-white dark:bg-gray-900 overflow-hidden hover:shadow-xl transition">
              <img src={b.image} alt={b.title} className="w-full h-48 object-cover" />
              <div className="p-5">
                <h3 className="font-bold line-clamp-2">{b.title}</h3>
                <p className="text-xs text-gray-500 mt-2">{formatDate(b.createdAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
