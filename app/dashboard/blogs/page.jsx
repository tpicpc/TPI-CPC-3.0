"use client";

import { ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import axios from "axios";
import { CheckCircle2, Clock, ExternalLink, LoaderCircle, Newspaper, Plus, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MyBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/v1/me/blogs", { headers: { Authorization: `Bearer ${token}` } });
        if (data.success) setBlogs(data.blogs);
      } finally { setLoading(false); }
    })();
  }, []);

  const badge = (status) => {
    if (status === "approved") return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-700 dark:text-green-400"><CheckCircle2 size={11} /> Published</span>;
    if (status === "rejected") return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 dark:text-red-400"><XCircle size={11} /> Rejected</span>;
    return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400"><Clock size={11} /> Pending</span>;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <Newspaper className="text-pink-500" /> My Blogs
        </h1>
        <Link href="/submit-blog"><Button className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white"><Plus size={15} className="mr-1.5" /> Write a blog</Button></Link>
      </div>
      {loading ? (
        <ListSkeleton count={4} />
      ) : blogs.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Newspaper className="mx-auto text-gray-400 mb-3" size={32} />
          <p className="font-medium text-gray-700 dark:text-gray-300">No blogs yet</p>
          <Link href="/submit-blog" className="text-indigo-500 hover:underline text-sm mt-2 inline-block">Write your first post →</Link>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {blogs.map((b) => (
            <Card key={b._id}>
              <CardContent className="p-4 flex gap-4">
                <img src={b.image} alt={b.title} className="w-24 h-24 object-cover rounded shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">{badge(b.status)}</div>
                  <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2">{b.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(b.createdAt)}</p>
                  {b.status === "rejected" && b.rejectionReason && (
                    <p className="text-xs text-red-600 mt-1 italic">Reason: {b.rejectionReason}</p>
                  )}
                </div>
                {b.status === "approved" && (
                  <Link href={`/blogs/${b._id}`} target="_blank" className="self-start">
                    <Button size="sm" variant="outline"><ExternalLink size={13} className="mr-1" /> View</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
