"use client";

import ArticleView from "@/components/blog/ArticleView";
import { ArticleSkeleton } from "@/components/skeletons";
import { sanitizeBlogHtmlClient } from "@/lib/sanitize-blog-client";
import axios from "axios";
import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Client-side view for posts the server can't show publicly (pending review, etc.). */
export default function BlogPreviewFallback({ id }) {
  const [state, setState] = useState({ loading: true, blog: null, author: null });

  useEffect(() => {
    const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
    axios
      .get(`/api/v1/blog/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(({ data }) => setState({ loading: false, blog: data.success ? data.blog : null, author: data.authorInfo }))
      .catch(() => setState({ loading: false, blog: null, author: null }));
  }, [id]);

  if (state.loading) {
    return (
      <div className="mx-auto max-w-[728px] px-5 py-16">
        <ArticleSkeleton />
      </div>
    );
  }

  if (!state.blog) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <FileQuestion className="mx-auto text-gray-400" size={40} />
        <h1 className="mt-4 text-2xl font-bold">Story not found</h1>
        <p className="mt-2 text-gray-500">It may have been removed, or it&apos;s still waiting for review.</p>
        <Link href="/blogs" className="mt-6 inline-block font-medium text-indigo-600 hover:underline">Browse all posts</Link>
      </div>
    );
  }

  const status = state.blog.status;
  return (
    <>
      {status && status !== "approved" && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-sm text-center px-4 py-2.5">
          This story is <strong className="capitalize">{status}</strong> and only visible to you{status === "pending" ? " until an admin approves it" : ""}.
        </div>
      )}
      <ArticleView
        blog={state.blog}
        author={state.author || { name: state.blog.author || "TPI CPC", isClub: !state.blog.submittedBy }}
        html={sanitizeBlogHtmlClient(state.blog.description)}
      />
    </>
  );
}
