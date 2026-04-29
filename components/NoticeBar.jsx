"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "tpi_notice_dismissed";

export default function NoticeBar() {
  const [notices, setNotices] = useState([]);
  const [dismissedKey, setDismissedKey] = useState(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get("/api/v1/notice/list?active=true");
        if (cancelled) return;
        const list = data.success ? data.notices || [] : [];
        setNotices(list);

        const key = list.length
          ? list.map((n) => n._id).join(",")
          : "default";
        setDismissedKey(key);

        const stored = localStorage.getItem(STORAGE_KEY);
        setHidden(stored === key);
      } catch {
        if (!cancelled) {
          setNotices([]);
          setDismissedKey("default");
          setHidden(localStorage.getItem(STORAGE_KEY) === "default");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = () => {
    if (dismissedKey) localStorage.setItem(STORAGE_KEY, dismissedKey);
    setHidden(true);
  };

  if (hidden) return null;

  const text = notices.length
    ? notices.map((n) => n.message).join("    •    ")
    : "Welcome to TPI CPC — stay tuned for upcoming workshops and events.";

  const duration = Math.max(20, text.length / 4);

  return (
    <div className="relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white overflow-hidden">
      <div className="px-4 md:px-12 py-2 pr-12 overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap text-sm md:text-base tracking-wide gap-12"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration, ease: "linear" }}
        >
          <span className="font-medium">{text}</span>
          <span className="font-medium" aria-hidden="true">{text}</span>
        </motion.div>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss notice"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center bg-white/10 hover:bg-white/20 transition"
      >
        <X size={16} />
      </button>
    </div>
  );
}
