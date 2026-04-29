"use client";

import { ArticleSkeleton } from "@/components/skeletons";
import { formatDate } from "@/lib/utils";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewBlogPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`/api/v1/blog/${id}`);
        if (data.success) setBlog(data.blog);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return (
    <article className="px-4 md:px-10 container mx-auto py-16 max-w-3xl">
      <ArticleSkeleton />
    </article>
  );
  if (!blog) return <div className="px-4 md:px-10 container mx-auto py-16 text-center">Blog not found.</div>;

  return (
    <article className="px-4 md:px-10 container mx-auto py-16 max-w-3xl">
      <img src={blog.image} alt={blog.title} className="w-full rounded-xl mb-6 max-h-[420px] object-cover" />
      <h1 className="text-3xl md:text-4xl font-extrabold">{blog.title}</h1>
      <p className="text-sm text-gray-500 mt-2">By {blog.author || "TPI CPC"} · {formatDate(blog.createdAt)}</p>
      <div className="prose dark:prose-invert mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: blog.description }} />
    </article>
  );
}
