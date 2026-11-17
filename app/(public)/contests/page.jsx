"use client";

import ClubHero, { Chip, EmptyState, panel } from "@/components/club/ClubHero";
import PlatformBadge from "@/components/club/PlatformBadge";
import { ListSkeleton } from "@/components/skeletons";
import { formatDuration, PLATFORMS, timeUntil } from "@/lib/club-format";
import axios from "axios";
import { AlertTriangle, CalendarPlus, Clock, ExternalLink, Radio, Timer, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const FILTERS = ["all", "codeforces", "codechef", "atcoder"];

function gcalLink(c) {
  const fmt = (d) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = new Date(new Date(c.start).getTime() + (c.durationMinutes || 120) * 60000);
  const p = new URLSearchParams({ action: "TEMPLATE", text: c.name, dates: `${fmt(c.start)}/${fmt(end)}`, details: c.url });
  return `https://calendar.google.com/calendar/render?${p}`;
}

function dayLabel(d) {
  const date = new Date(d);
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);
  const same = (a, b) => a.toDateString() === b.toDateString();
  if (same(date, today)) return "Today";
  if (same(date, tomorrow)) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export default function ContestsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [, tick] = useState(0);

  useEffect(() => {
    axios.get("/api/v1/contests").then(({ data }) => data.success && setData(data)).catch(() => {}).finally(() => setLoading(false));
    const t = setInterval(() => tick((x) => x + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const list = useMemo(() => (data?.contests || []).filter((c) => filter === "all" || c.platform === filter), [data, filter]);
  const groups = useMemo(() => {
    const g = [];
    for (const c of list) {
      const label = c.live ? "Running now" : dayLabel(c.start);
      const last = g[g.length - 1];
      if (last && last.label === label) last.items.push(c);
      else g.push({ label, items: [c] });
    }
    return g;
  }, [list]);
  const counts = useMemo(() => {
    const m = { all: data?.contests?.length || 0 };
    for (const c of data?.contests || []) m[c.platform] = (m[c.platform] || 0) + 1;
    return m;
  }, [data]);
  const failed = Object.keys(data?.errors || {});
  const next = list.find((c) => !c.live);

  return (
    <div>
      <ClubHero
        eyebrow="Practice"
        icon={<Trophy size={14} />}
        title="Contest tracker"
        subtitle="Every upcoming Codeforces, CodeChef and AtCoder round in one place. Times are shown in your local timezone."
      >
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f === "all" ? "All platforms" : PLATFORMS[f].label}
              <span className="ml-1.5 opacity-70">{counts[f] || 0}</span>
            </Chip>
          ))}
        </div>
      </ClubHero>

      <div className="px-4 md:px-10 container mx-auto py-8 grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="min-w-0">
          {failed.length > 0 && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-300/60 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>
                Couldn&apos;t refresh {failed.map((f) => PLATFORMS[f]?.label || f).join(", ")} right now — showing what we have. It&apos;ll retry automatically.
              </span>
            </div>
          )}

          {loading ? (
            <ListSkeleton count={6} />
          ) : groups.length === 0 ? (
            <EmptyState icon={<Trophy size={20} />} title="No upcoming contests found">
              {failed.length === 3 ? "Contest sources are unreachable at the moment. Please check back soon." : "Try another platform filter."}
            </EmptyState>
          ) : (
            <div className="space-y-8">
              {groups.map((g) => (
                <section key={g.label}>
                  <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    {g.label === "Running now" && <Radio size={13} className="text-red-500 animate-pulse" />}
                    {g.label}
                    <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
                  </h2>
                  <ul className="space-y-3">
                    {g.items.map((c) => (
                      <li key={c.id} className={`${panel} p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition`}>
                        <div className="flex sm:flex-col items-center sm:items-center gap-2 sm:w-20 shrink-0">
                          <span className="text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums leading-none">
                            {new Date(c.start).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="text-xs font-semibold text-gray-500">{new Date(c.start).toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <PlatformBadge platform={c.platform} size="xs" />
                            {c.live ? (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">● Live</span>
                            ) : (
                              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Starts {timeUntil(c.start)}</span>
                            )}
                          </div>
                          <a href={c.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2">
                            {c.name}
                          </a>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                            <span className="inline-flex items-center gap-1"><Clock size={12} />{new Date(c.start).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                            <span className="inline-flex items-center gap-1"><Timer size={12} />{formatDuration(c.durationMinutes)}</span>
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <a href={gcalLink(c)} target="_blank" rel="noopener noreferrer" title="Add to Google Calendar"
                            className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:text-indigo-600 hover:border-indigo-300">
                            <CalendarPlus size={16} />
                          </a>
                          <a href={c.url} target="_blank" rel="noopener noreferrer"
                            className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium">
                            {c.live ? "Enter" : "Register"} <ExternalLink size={13} />
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 self-start">
          {next && (
            <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-indigo-500/20">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Next up</p>
              <p className="mt-1.5 font-bold leading-snug">{next.name}</p>
              <p className="mt-3 text-3xl font-extrabold">{timeUntil(next.start).replace("in ", "")}</p>
              <p className="text-xs opacity-80">{PLATFORMS[next.platform].label} · {formatDuration(next.durationMinutes)}</p>
            </div>
          )}
          <div className={`${panel} p-5 text-sm`}>
            <p className="font-semibold text-gray-900 dark:text-white">Show your ratings here</p>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Add your Codeforces, CodeChef and AtCoder handles in your dashboard — your ratings appear on your member profile automatically.</p>
            <a href="/dashboard/portfolio" className="mt-3 inline-flex text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Add handles →</a>
          </div>
          {data?.fetchedAt && (
            <p className="text-xs text-gray-400 px-1">Updated {new Date(data.fetchedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} · refreshed every 30 min</p>
          )}
        </aside>
      </div>
    </div>
  );
}
