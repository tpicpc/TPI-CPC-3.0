import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getCurrentYear() {
  return new Date().getFullYear();
}

// Position-rank — order of checks matters because "Vice President" contains "President".
// Lower number = higher in the team display (President is always row 1, col 1).
export function rankPosition(p = "") {
  const s = (p || "").toLowerCase().trim();
  if (/founding[- ]?president/.test(s)) return 1;
  if (/associate[- ]?vice[- ]?president/.test(s)) return 3;
  if (/vice[- ]?president/.test(s)) return 2;
  if (/(^|\s)president(\s|$|,|\/)/.test(s)) return 1;
  if (/assistant[- ]?general[- ]?secretary/.test(s)) return 5;
  if (/general[- ]?secretary/.test(s)) return 4;
  if (/co[- ]?treasurer/.test(s)) return 7;
  if (/treasurer/.test(s)) return 6;
  if (/assistant[- ]?press[- ]?secretary/.test(s)) return 9;
  if (/press[- ]?secretary/.test(s)) return 8;
  if (/media[- ]?secretary/.test(s)) return 10;
  if (/digital[- ]?content/.test(s)) return 11;
  if (/lead[- ]?creative/.test(s)) return 12;
  if (/creative[- ]?designer/.test(s)) return 13;
  if (/secretary/.test(s)) return 14;
  if (/event[- ]?manager/.test(s)) return 15;
  if (/executive/.test(s)) return 16;
  if (/member/.test(s)) return 17;
  return 99;
}

export function sortMembers(list = []) {
  return [...list].sort((a, b) => {
    // Position rank first — President always at the top
    const rankDiff = rankPosition(a.position) - rankPosition(b.position);
    if (rankDiff !== 0) return rankDiff;
    // Then admin's manual `order` field as tie-breaker
    const orderDiff = (a.order ?? 0) - (b.order ?? 0);
    if (orderDiff !== 0) return orderDiff;
    // Finally alphabetic by name for stable ordering
    return (a.name || "").localeCompare(b.name || "");
  });
}
