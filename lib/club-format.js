// Client-safe formatting helpers for the club features.
export const PLATFORMS = {
  codeforces: { label: "Codeforces", short: "CF", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300", dot: "bg-sky-500", profile: (h) => `https://codeforces.com/profile/${h}` },
  codechef: { label: "CodeChef", short: "CC", color: "bg-amber-500/15 text-amber-800 dark:text-amber-300", dot: "bg-amber-600", profile: (h) => `https://www.codechef.com/users/${h}` },
  atcoder: { label: "AtCoder", short: "AC", color: "bg-gray-500/15 text-gray-800 dark:text-gray-200", dot: "bg-gray-700 dark:bg-gray-300", profile: (h) => `https://atcoder.jp/users/${h}` },
  other: { label: "Other", short: "•", color: "bg-violet-500/15 text-violet-700 dark:text-violet-300", dot: "bg-violet-500" },
};

export function cfRankColor(rating) {
  if (rating == null) return "text-gray-500";
  if (rating >= 2400) return "text-red-600 dark:text-red-400";
  if (rating >= 2100) return "text-orange-500";
  if (rating >= 1900) return "text-violet-600 dark:text-violet-400";
  if (rating >= 1600) return "text-blue-600 dark:text-blue-400";
  if (rating >= 1400) return "text-cyan-600 dark:text-cyan-400";
  if (rating >= 1200) return "text-green-600 dark:text-green-400";
  return "text-gray-500 dark:text-gray-400";
}

export function formatDuration(min) {
  if (!min && min !== 0) return "—";
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  if (d) return `${d}d ${h ? `${h}h` : ""}`.trim();
  return `${h ? `${h}h ` : ""}${m ? `${m}m` : ""}`.trim() || "0m";
}

export function timeUntil(date) {
  const ms = new Date(date).getTime() - Date.now();
  if (ms <= 0) return "now";
  const m = Math.floor(ms / 60000);
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  if (d >= 1) return `in ${d}d ${h}h`;
  if (h >= 1) return `in ${h}h ${m % 60}m`;
  return `in ${m}m`;
}

export function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export const fmtDate = (d, opts = {}) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", ...opts }) : "";
export const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";

/** Parse an event's datetime-local string as Bangladesh time (matches the server helper). */
export function parseEventTime(s) {
  if (!s) return null;
  const str = String(s);
  const d = new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(str) ? str : `${str.length === 16 ? `${str}:00` : str}+06:00`);
  return isNaN(d) ? null : d;
}

export const LEVEL_STYLES = {
  Beginner: { chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300", bar: "from-emerald-500 to-teal-500", ring: "ring-emerald-500/30" },
  Intermediate: { chip: "bg-blue-500/15 text-blue-700 dark:text-blue-300", bar: "from-blue-500 to-indigo-500", ring: "ring-blue-500/30" },
  Advanced: { chip: "bg-violet-500/15 text-violet-700 dark:text-violet-300", bar: "from-violet-500 to-fuchsia-500", ring: "ring-violet-500/30" },
};

export const DIFF_STYLES = {
  Easy: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  Medium: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  Hard: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};
