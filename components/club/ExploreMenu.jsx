"use client";

import { EXPLORE_GROUPS, EXPLORE_PATHS } from "@/lib/explore-nav";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, CalendarDays, ChevronDown, GraduationCap, Megaphone, Route, Target, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const EXPLORE_ICONS = { Trophy, Target, Route, Megaphone, CalendarDays, GraduationCap, Briefcase };

/** Desktop nav-pill dropdown. */
export default function ExploreMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef(null);
  const timer = useRef(null);
  const active = EXPLORE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, []);

  const hoverOpenedAt = useRef(0);
  const enter = () => {
    clearTimeout(timer.current);
    setOpen((v) => { if (!v) hoverOpenedAt.current = Date.now(); return true; });
  };
  // A click right after hover opened the menu should keep it open (not toggle it shut)
  const toggle = () => setOpen((v) => (v && Date.now() - hoverOpenedAt.current < 400 ? true : !v));
  const leave = () => { timer.current = setTimeout(() => setOpen(false), 120); };

  return (
    <li className="relative" ref={ref} onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="true"
        className={`relative flex items-center gap-1 px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
          active ? "text-white" : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        }`}
      >
        {active && (
          <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 shadow-md shadow-indigo-500/30" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
        )}
        <span className="relative z-10">Explore</span>
        <ChevronDown size={14} className={`relative z-10 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -6, x: "-50%" }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 top-full pt-3 z-50"
          >
            <div className="w-[560px] grid grid-cols-2 gap-1 p-3 rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl">
              {EXPLORE_GROUPS.map((g) => (
                <div key={g.title}>
                  <p className="px-3 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{g.title}</p>
                  {g.items.map((it) => {
                    const Icon = EXPLORE_ICONS[it.icon];
                    const on = pathname === it.path || pathname.startsWith(`${it.path}/`);
                    return (
                      <Link key={it.path} href={it.path} className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition ${on ? "bg-indigo-50 dark:bg-indigo-500/10" : "hover:bg-gray-50 dark:hover:bg-white/5"}`}>
                        <span className="mt-0.5 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/15 to-violet-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0"><Icon size={16} /></span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-gray-900 dark:text-white">{it.name}</span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">{it.desc}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/** Mobile drawer section. */
export function ExploreDrawerSection({ isActive }) {
  return (
    <div className="px-3 pt-2 pb-2">
      {EXPLORE_GROUPS.map((g) => (
        <div key={g.title} className="mb-2">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">{g.title}</p>
          <ul className="grid grid-cols-2 gap-1">
            {g.items.map((it) => {
              const Icon = EXPLORE_ICONS[it.icon];
              return (
                <li key={it.path}>
                  <Link href={it.path} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive(it.path) ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"}`}>
                    <Icon size={15} className="text-indigo-500 shrink-0" /> <span className="truncate">{it.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
