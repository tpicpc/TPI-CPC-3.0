"use client";

/* eslint-disable @next/next/no-img-element */
import PageHeader from "@/components/admin/PageHeader";
import { ConfirmDelete } from "@/components/blog/CommentsSection";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import { ExternalLink, LoaderCircle, MessageSquareText, Search, ShieldAlert, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [pending, setPending] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (query = "") => {
    setLoading(true);
    try {
      const { data } = await adminApi().get(`/api/v1/blog/comments${query ? `?q=${encodeURIComponent(query)}` : ""}`);
      if (data.success) setComments(data.comments);
    } catch {
      toast.error("Couldn't load comments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const doDelete = async () => {
    if (!pending) return;
    setDeleting(true);
    try {
      const blogId = pending.blog?._id || pending.blog;
      const { data } = await adminApi().delete(`/api/v1/blog/${blogId}/comments/${pending._id}`);
      if (!data.success) throw new Error(data.message);
      setComments((c) => c.filter((x) => x._id !== pending._id));
      toast.success("Comment deleted");
      setPending(null);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Blog comments"
        description="Latest responses across all posts. IP address and device are stored for moderation and visible to admins only."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load(q.trim());
        }}
        className="mb-4 flex gap-2 max-w-md"
      >
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search text, name or exact IP…"
            className="w-full h-10 pl-9 pr-3 rounded-md border bg-background text-sm"
          />
        </div>
        <button type="submit" className="h-10 px-4 rounded-md bg-indigo-500 text-white text-sm font-medium">Search</button>
      </form>

      {loading ? (
        <div className="py-16 flex justify-center"><LoaderCircle className="animate-spin text-indigo-500" /></div>
      ) : comments.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-sm text-muted-foreground">
          <MessageSquareText className="mx-auto mb-2 text-gray-300" size={32} /> No comments found.
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <Card key={c._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {c.avatar ? (
                      <img src={c.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <span className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-xs font-semibold flex items-center justify-center">
                        {(c.name || "?").slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(c.createdAt)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPending(c)}
                    className="w-8 h-8 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                    aria-label="Delete comment"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="mt-3 text-sm whitespace-pre-wrap break-words">{c.text}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {c.blog ? (
                    <Link href={`/blogs/${c.blog.slug || c.blog._id}#responses`} target="_blank" className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline max-w-xs truncate">
                      {c.blog.title} <ExternalLink size={11} />
                    </Link>
                  ) : (
                    <span>Deleted post</span>
                  )}
                  <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                    <ShieldAlert size={12} /> IP: <code className="font-mono">{c.ip || "unknown"}</code>
                  </span>
                  {c.userAgent && <span className="truncate max-w-md" title={c.userAgent}>{c.userAgent}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDelete
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        onConfirm={doDelete}
        busy={deleting}
        description={pending ? `Delete ${pending.name}'s comment? This can't be undone.` : undefined}
      />
    </div>
  );
}
