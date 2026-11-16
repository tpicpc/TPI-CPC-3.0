"use client";

import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/** Medium-style like ("clap") button. One like per signed-in member; click again to undo. */
export default function LikeButton({ blogId, initialCount = 0, size = "md" }) {
  const { userData } = useUser();
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pop, setPop] = useState(false);

  // Keep every like button for this post (top bar + footer) in sync.
  const evt = `tpicpc:blog-like:${blogId}`;
  const broadcast = (l, c) => window.dispatchEvent(new CustomEvent(evt, { detail: { liked: l, count: c } }));
  useEffect(() => {
    const on = (e) => {
      setLiked(e.detail.liked);
      setCount(e.detail.count);
    };
    window.addEventListener(evt, on);
    return () => window.removeEventListener(evt, on);
  }, [evt]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !userData) return;
    axios
      .get(`/api/v1/blog/${blogId}/like`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (data.success) {
          setLiked(data.liked);
          setCount(data.likeCount);
        }
      })
      .catch(() => {});
  }, [blogId, userData]);

  const toggle = async () => {
    if (!userData) {
      toast("Sign in to like this story", { icon: "👋" });
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (busy) return;
    setBusy(true);
    // optimistic update
    const next = !liked;
    const optimistic = Math.max(0, count + (next ? 1 : -1));
    broadcast(next, optimistic);
    if (next) {
      setPop(true);
      setTimeout(() => setPop(false), 400);
    }
    try {
      const { data } = await axios.post(`/api/v1/blog/${blogId}/like`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!data.success) throw new Error(data.message);
      broadcast(data.liked, data.likeCount);
    } catch (err) {
      broadcast(!next, count);
      toast.error(err.response?.data?.message || "Couldn't save your like");
    } finally {
      setBusy(false);
    }
  };

  const dim = size === "lg" ? "h-11 pl-3.5 pr-4 text-[15px]" : "h-9 pl-2.5 pr-3 text-sm";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={liked}
      aria-label={liked ? "Unlike this story" : "Like this story"}
      title={liked ? "You liked this" : "Like"}
      className={`group inline-flex items-center gap-1.5 rounded-full transition ${dim} ${
        liked
          ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
      }`}
    >
      <Heart
        size={size === "lg" ? 20 : 18}
        className={`transition-transform duration-300 ${pop ? "scale-125" : "group-active:scale-90"}`}
        fill={liked ? "currentColor" : "none"}
      />
      <span className="tabular-nums font-medium">{count}</span>
    </button>
  );
}
