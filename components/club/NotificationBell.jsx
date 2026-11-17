"use client";

import { userApi } from "@/lib/api-client";
import { timeAgo } from "@/lib/club-format";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Bell, CalendarCheck, CheckCheck, Megaphone, Target } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const KIND_ICON = { notice: Megaphone, event: CalendarCheck, certificate: Award, challenge: Target };

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [mobileTop, setMobileTop] = useState(null);
  const ref = useRef(null);
  const pathname = usePathname();

  const load = useCallback(async () => {
    try {
      const { data } = await userApi().get("/api/v1/notifications");
      if (data.success) { setItems(data.notifications); setUnread(data.unread); }
    } catch {}
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => document.visibilityState === "visible" && load(), 60000);
    return () => clearInterval(t);
  }, [load]);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const markAll = async () => {
    setUnread(0);
    setItems((l) => l.map((n) => ({ ...n, read: true })));
    try { await userApi().patch("/api/v1/notifications", {}); } catch {}
  };
  const markOne = (n) => {
    if (n.read) return;
    setUnread((u) => Math.max(0, u - 1));
    setItems((l) => l.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
    userApi().patch("/api/v1/notifications", { id: n._id }).catch(() => {});
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          // On phones the panel is fixed full-width; anchor it just below the button
          const r = e.currentTarget.getBoundingClientRect();
          setMobileTop(window.innerWidth < 640 ? r.bottom + 8 : null);
          setOpen((v) => !v);
        }}
        className="relative flex items-center justify-center w-10 h-10 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition"
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-4 text-center ring-2 ring-white dark:ring-gray-950">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={mobileTop != null ? { top: mobileTop } : undefined}
            className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-3 sm:w-96 origin-top-right bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl rounded-xl z-50 border border-gray-200/60 dark:border-white/10 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</p>
              {unread > 0 && (
                <button onClick={markAll} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1 hover:underline"><CheckCheck size={14} /> Mark all read</button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {items.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500"><Bell className="mx-auto mb-2 text-gray-300" size={26} /> You&apos;re all caught up</div>
              ) : (
                items.map((n) => {
                  const Icon = KIND_ICON[n.kind] || Bell;
                  const body = (
                    <div className={`flex gap-3 px-4 py-3 border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 ${n.read ? "" : "bg-indigo-50/60 dark:bg-indigo-500/5"}`}>
                      <span className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0"><Icon size={15} /></span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm leading-snug ${n.read ? "text-gray-700 dark:text-gray-300" : "font-semibold text-gray-900 dark:text-white"}`}>{n.title}</p>
                        {n.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>}
                        <p className="text-[11px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />}
                    </div>
                  );
                  return n.link ? (
                    <Link key={n._id} href={n.link} onClick={() => markOne(n)} className="block">{body}</Link>
                  ) : (
                    <button key={n._id} onClick={() => markOne(n)} className="block w-full text-left">{body}</button>
                  );
                })
              )}
            </div>
            <Link href="/notices" className="block text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 py-2.5 border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">Open notice board</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
