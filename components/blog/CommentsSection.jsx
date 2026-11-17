"use client";

/* eslint-disable @next/next/no-img-element */
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import { LoaderCircle, MessageCircle, ShieldAlert, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as Dialog from "@radix-ui/react-dialog";

const MAX_LEN = 1000;

export function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 604800) return `${Math.round(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Avatar({ name, src, size = 36 }) {
  const style = { width: size, height: size };
  if (src) return <img src={src} alt={name} style={style} className="rounded-full object-cover shrink-0" />;
  const init = (name || "?").split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  return (
    <span style={{ ...style, fontSize: size * 0.38 }} className="rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-semibold flex items-center justify-center shrink-0">
      {init}
    </span>
  );
}

export function ConfirmDelete({ open, onOpenChange, onConfirm, busy, description = "This comment will be permanently removed." }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed z-[81] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(400px,calc(100vw-2rem))] rounded-xl bg-white dark:bg-gray-900 border p-6 shadow-2xl focus:outline-none">
          <Dialog.Title className="text-lg font-semibold">Delete comment?</Dialog.Title>
          <Dialog.Description className="mt-1.5 text-sm text-gray-500">{description}</Dialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close className="h-9 px-4 rounded-md border text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5">Cancel</Dialog.Close>
            <button type="button" onClick={onConfirm} disabled={busy} className="h-9 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60">
              {busy && <LoaderCircle size={14} className="animate-spin" />} Delete
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Responses section under a blog post. */
export default function CommentsSection({ blogId, initialCount = 0 }) {
  const { userData } = useUser();
  const [comments, setComments] = useState(null);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const authHeader = useCallback(() => {
    const admin = localStorage.getItem("admin_token");
    const user = localStorage.getItem("token");
    const t = admin || user;
    return t ? { Authorization: `Bearer ${t}` } : {};
  }, []);

  useEffect(() => {
    setIsAdmin(!!localStorage.getItem("admin_token"));
    axios
      .get(`/api/v1/blog/${blogId}/comments`, { headers: authHeader() })
      .then(({ data }) => setComments(data.success ? data.comments : []))
      .catch(() => setComments([]));
  }, [blogId, authHeader]);

  const post = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (value.length < 2) return toast.error("Write a little more");
    setPosting(true);
    try {
      const { data } = await axios.post(
        `/api/v1/blog/${blogId}/comments`,
        { text: value },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (!data.success) throw new Error(data.message);
      setComments((c) => [data.comment, ...(c || [])]);
      setText("");
      toast.success("Response posted");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Couldn't post your comment");
    } finally {
      setPosting(false);
    }
  };

  const doDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const { data } = await axios.delete(`/api/v1/blog/${blogId}/comments/${pendingDelete}`, { headers: authHeader() });
      if (!data.success) throw new Error(data.message);
      setComments((c) => c.filter((x) => x._id !== pendingDelete));
      toast.success("Comment deleted");
      setPendingDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const count = comments ? comments.length : initialCount;

  return (
    <section id="responses" className="mx-auto max-w-[728px] px-5 sm:px-6 mt-14 scroll-mt-28" aria-labelledby="responses-title">
      <h2 id="responses-title" className="text-xl font-bold text-gray-950 dark:text-white flex items-center gap-2">
        Responses <span className="text-gray-400 font-medium">({count})</span>
      </h2>

      {/* Composer */}
      <div className="mt-5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm">
        {userData && userData.emailVerified !== false ? (
          <form onSubmit={post} className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <Avatar name={userData.fullName} src={userData.profileImage} size={32} />
              <span className="text-sm font-medium">{userData.fullName}</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
              placeholder="What are your thoughts?"
              rows={3}
              className="w-full resize-y min-h-[84px] bg-transparent text-[15px] leading-relaxed placeholder:text-gray-400 focus:outline-none"
              aria-label="Write a response"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className={`text-xs tabular-nums ${text.length > MAX_LEN * 0.9 ? "text-amber-600" : "text-gray-400"}`}>
                {text.length}/{MAX_LEN}
              </span>
              <div className="flex gap-2">
                {text && (
                  <button type="button" onClick={() => setText("")} className="h-9 px-4 rounded-full text-sm hover:bg-gray-100 dark:hover:bg-white/10">
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={posting || text.trim().length < 2}
                  className="h-9 px-5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 disabled:opacity-40 inline-flex items-center gap-2"
                >
                  {posting && <LoaderCircle size={14} className="animate-spin" />} Respond
                </button>
              </div>
            </div>
          </form>
        ) : userData ? (
          <div className="p-4 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/verify-email" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Verify your email</Link> to join the conversation.
          </div>
        ) : (
          <div className="p-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">Sign in to share your thoughts on this story.</p>
            <div className="flex gap-2">
              <Link href="/login" className="h-9 px-4 rounded-full border text-sm font-medium inline-flex items-center hover:bg-gray-50 dark:hover:bg-white/5">Sign in</Link>
              <Link href="/signup" className="h-9 px-4 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 inline-flex items-center">Join TPI CPC</Link>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="mt-6">
        {comments === null ? (
          <div className="py-8 flex justify-center"><LoaderCircle className="animate-spin text-gray-400" /></div>
        ) : comments.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">
            <MessageCircle className="mx-auto mb-2 text-gray-300 dark:text-gray-600" size={28} />
            No responses yet. Be the first to share your thoughts.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200/80 dark:divide-white/10">
            {comments.map((c) => {
              const mine = userData && String(c.user) === String(userData._id);
              return (
                <li key={c._id} className="py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar name={c.name} src={c.avatar} />
                      <div className="min-w-0">
                        {c.username ? (
                          <Link href={`/members/${c.username}`} className="block text-sm font-medium text-gray-900 dark:text-gray-100 hover:underline truncate">{c.name}</Link>
                        ) : (
                          <span className="block text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{c.name}</span>
                        )}
                        <time className="block text-xs text-gray-500" dateTime={c.createdAt} title={new Date(c.createdAt).toLocaleString()}>
                          {timeAgo(c.createdAt)}
                        </time>
                      </div>
                    </div>
                    {(mine || isAdmin) && (
                      <button
                        type="button"
                        onClick={() => setPendingDelete(c._id)}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                        aria-label="Delete comment"
                        title={mine ? "Delete your comment" : "Delete (admin)"}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">{c.text}</p>
                  {isAdmin && c.ip && (
                    <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded px-1.5 py-0.5" title={c.userAgent}>
                      <ShieldAlert size={11} /> Admin only · IP {c.ip}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDelete open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)} onConfirm={doDelete} busy={deleting} />
    </section>
  );
}
