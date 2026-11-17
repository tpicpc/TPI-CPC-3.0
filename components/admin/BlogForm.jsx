"use client";

import BlogEditor from "@/components/blog/BlogEditor";
import { adminApi } from "@/lib/api-client";
import { useRouter } from "next/navigation";

/** Admin create/edit wrapper around the shared Medium-style blog editor. */
export default function BlogForm({ id }) {
  const router = useRouter();
  return (
    <div className="-m-4 md:-m-6 min-h-[calc(100vh-57px)] bg-white dark:bg-gray-950">
      <BlogEditor mode="admin" blogId={id || null} api={adminApi} backHref="/admin/blogs" onDone={() => router.push("/admin/blogs")} />
    </div>
  );
}
