"use client";

import { DIFF_STYLES } from "@/lib/club-format";
import { CheckCircle2, CircleDashed, CircleDot, Clock3, Flame, Lock, Zap } from "lucide-react";
import { useEffect, useState } from "react";

/** Re-renders every `ms` so countdowns tick. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export function splitDuration(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

/** Compact "2d 4h 12m" / "4h 12m 09s" countdown text. */
export function countdownText(target, now) {
  const { d, h, m, s } = splitDuration(new Date(target).getTime() - now);
  const pad = (n) => String(n).padStart(2, "0");
  if (d) return `${d}d ${h}h ${pad(m)}m`;
  if (h) return `${h}h ${pad(m)}m ${pad(s)}s`;
  return `${m}m ${pad(s)}s`;
}

export function Countdown({ target, prefix, className = "", urgentBelowMs = 6 * 3600 * 1000 }) {
  const now = useNow(1000);
  const left = new Date(target).getTime() - now;
  const urgent = left > 0 && left < urgentBelowMs;
  return (
    <span className={`inline-flex items-center gap-1 tabular-nums ${urgent ? "text-rose-600 dark:text-rose-400 font-semibold" : ""} ${className}`} suppressHydrationWarning>
      <Clock3 size={13} className="shrink-0" />
      {left <= 0 ? "Ended" : <>{prefix} {countdownText(target, now)}</>}
    </span>
  );
}

/** Big segmented countdown for spotlight / upcoming panels. */
export function BigCountdown({ target, label = "Ends in", tone = "light" }) {
  const now = useNow(1000);
  const { d, h, m, s } = splitDuration(new Date(target).getTime() - now);
  const box = tone === "light" ? "bg-white/15 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white";
  return (
    <div suppressHydrationWarning>
      <p className={`text-[11px] font-semibold uppercase tracking-wider ${tone === "light" ? "text-white/75" : "text-gray-500"}`}>{label}</p>
      <div className="mt-1.5 flex gap-1.5">
        {[["d", d], ["h", h], ["m", m], ["s", s]].map(([u, v]) => (
          <span key={u} className={`min-w-[48px] rounded-lg px-2 py-1.5 text-center ${box}`}>
            <span className="block text-xl font-extrabold tabular-nums leading-none">{String(v).padStart(2, "0")}</span>
            <span className="block text-[10px] uppercase opacity-70 mt-0.5">{u}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function DifficultyBadge({ level, className = "" }) {
  const dots = level === "Easy" ? 1 : level === "Medium" ? 2 : 3;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${DIFF_STYLES[level] || DIFF_STYLES.Medium} ${className}`}>
      <span className="flex gap-0.5">{[1, 2, 3].map((i) => <span key={i} className={`w-1 h-2.5 rounded-sm ${i <= dots ? "bg-current" : "bg-current opacity-25"}`} />)}</span>
      {level}
    </span>
  );
}

export function KindBadge({ kind }) {
  const daily = kind === "daily";
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${daily ? "bg-orange-500/15 text-orange-700 dark:text-orange-300" : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300"}`}>
      {daily ? <Flame size={11} /> : <Zap size={11} />}{kind}
    </span>
  );
}

/** solved / attempted / pending / none indicator. */
export function StatusIcon({ status, locked, size = 20 }) {
  if (locked) return <Lock size={size - 3} className="text-gray-400" aria-label="Not open yet" />;
  if (status === "accepted") return <CheckCircle2 size={size} className="text-green-500" aria-label="Solved" />;
  if (status === "pending") return <CircleDot size={size} className="text-amber-500" aria-label="Under review" />;
  if (status === "rejected" || status === "attempted") return <CircleDot size={size} className="text-orange-500" aria-label="Attempted" />;
  return <CircleDashed size={size} className="text-gray-300 dark:text-gray-600" aria-label="Not attempted" />;
}

export const STATUS_LABEL = { accepted: "Solved", pending: "Under review", rejected: "Attempted", attempted: "Attempted" };

export function TagList({ tags = [], max = 4 }) {
  if (!tags.length) return null;
  return (
    <span className="inline-flex flex-wrap gap-1">
      {tags.slice(0, max).map((t) => <span key={t} className="text-[11px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">#{t}</span>)}
      {tags.length > max && <span className="text-[11px] text-gray-400">+{tags.length - max}</span>}
    </span>
  );
}
