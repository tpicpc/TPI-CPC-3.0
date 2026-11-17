"use client";

/* eslint-disable @next/next/no-img-element */
import ClubHero, { Chip, EmptyState, panel } from "@/components/club/ClubHero";
import { BigCountdown, Countdown, DifficultyBadge, KindBadge, STATUS_LABEL, StatusIcon, TagList } from "@/components/club/challenge-ui";
import PlatformBadge from "@/components/club/PlatformBadge";
import { useUser } from "@/contexts/UserContext";
import { userApi } from "@/lib/api-client";
import { getDefaultAvatar } from "@/lib/avatars";
import { fmtDate } from "@/lib/club-format";
import { ArrowRight, BadgeCheck, CalendarClock, ChevronRight, Crown, Flame, Hourglass, Search, Target, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const TABS = [
  { key: "active", label: "Active" },
  { key: "upcoming", label: "Upcoming" },
  { key: "ended", label: "Past" },
];
const DIFFS = ["All", "Easy", "Medium", "Hard"];

function RowSkeleton() {
  return (
    <div className={`${panel} divide-y divide-gray-100 dark:divide-white/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
          <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-white/10" />
          <div className="flex-1 space-y-2"><div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-white/10" /><div className="h-3 w-1/3 rounded bg-gray-100 dark:bg-white/5" /></div>
          <span className="hidden md:block w-16 h-5 rounded-full bg-gray-200 dark:bg-white/10" />
          <span className="hidden md:block w-10 h-6 rounded bg-gray-200 dark:bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function SolvedBar({ solved, attempted }) {
  const rate = attempted ? Math.round((solved / attempted) * 100) : 0;
  return (
    <div className="w-28">
      <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1"><Users size={12} /> <b className="tabular-nums">{solved}</b> solved</p>
      <div className="mt-1 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden" title={`${rate}% of ${attempted} participants`}>
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${rate}%` }} />
      </div>
    </div>
  );
}

function ChallengeRow({ c }) {
  const locked = c.state === "upcoming";
  const status = c.mine?.status;
  return (
    <li>
      <Link href={`/challenges/${c._id}`} className="group flex items-start md:items-center gap-3 md:gap-4 p-4 hover:bg-indigo-50/60 dark:hover:bg-white/[0.03] transition">
        <span className="mt-0.5 md:mt-0 shrink-0" title={locked ? "Opens soon" : STATUS_LABEL[status] || "Not attempted"}><StatusIcon status={status} locked={locked} /></span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <KindBadge kind={c.kind} />
            <PlatformBadge platform={c.platform} size="xs" />
            {c.autoVerify && <span className="text-[11px] font-medium text-green-600 dark:text-green-400 inline-flex items-center gap-0.5"><BadgeCheck size={12} /> Auto-verify</span>}
            <span className="md:hidden"><DifficultyBadge level={c.difficulty} /></span>
          </div>
          <h3 className="mt-1 font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">{c.title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <TagList tags={c.tags} />
            {status && <span className={`font-semibold ${status === "accepted" ? "text-green-600 dark:text-green-400" : status === "pending" ? "text-amber-600" : "text-orange-600"}`}>{STATUS_LABEL[status]}</span>}
            <span className="md:hidden inline-flex items-center gap-1"><Users size={12} /> {c.solvedBy} solved</span>
          </div>
        </div>
        <div className="hidden md:block w-24 shrink-0"><DifficultyBadge level={c.difficulty} /></div>
        <div className="hidden md:block shrink-0">{locked ? <p className="w-28 text-xs text-gray-400">Opens soon</p> : <SolvedBar solved={c.solvedBy} attempted={c.attemptedBy} />}</div>
        <div className="hidden lg:block w-40 shrink-0 text-xs text-gray-500">
          {c.state === "active" && c.endsAt ? <Countdown target={c.endsAt} prefix="Ends in" />
            : locked ? <Countdown target={c.startsAt} prefix="Opens in" />
            : <span className="inline-flex items-center gap-1"><CalendarClock size={13} /> {c.endsAt ? `Ended ${fmtDate(c.endsAt)}` : "Open"}</span>}
        </div>
        <div className="text-right shrink-0 w-14">
          <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums leading-none">+{c.points}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">pts</p>
        </div>
        <ChevronRight size={16} className="hidden md:block text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition shrink-0" />
      </Link>
      {(c.state === "active" && c.endsAt) || locked ? (
        <div className="lg:hidden px-4 -mt-2 pb-3 pl-12 text-xs text-gray-500">
          {locked ? <Countdown target={c.startsAt} prefix="Opens in" /> : <Countdown target={c.endsAt} prefix="Ends in" />}
        </div>
      ) : null}
    </li>
  );
}

export default function ChallengesPage() {
  const { userData } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");
  const [diff, setDiff] = useState("All");
  const [kind, setKind] = useState("all");
  const [tag, setTag] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    userApi().get("/api/v1/challenges").then(({ data }) => data.success && setData(data)).catch(() => {}).finally(() => setLoading(false));
  }, [userData]);

  const all = useMemo(() => data?.challenges || [], [data]);
  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.key, all.filter((c) => c.state === t.key).length])), [all]);
  const tags = useMemo(() => [...new Set(all.flatMap((c) => c.tags || []))].sort(), [all]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return all.filter((c) => c.state === tab && (diff === "All" || c.difficulty === diff) && (kind === "all" || c.kind === kind) &&
      (tag === "all" || (c.tags || []).includes(tag)) && (!s || `${c.title} ${(c.tags || []).join(" ")}`.toLowerCase().includes(s)));
  }, [all, tab, diff, kind, tag, q]);
  const spotlight = tab === "active" && diff === "All" && kind === "all" && tag === "all" && !q ? all.find((c) => c.state === "active" && c.endsAt) : null;

  return (
    <div>
      <ClubHero eyebrow="Practice" icon={<Target size={14} />} title="Daily & weekly challenges"
        subtitle="One curated problem at a time. Solve it on the judge, submit your accepted link or let us verify it on Codeforces, and climb the board.">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
          {[
            ["Active now", counts.active ?? 0, "text-indigo-600 dark:text-indigo-400"],
            ["Opening soon", counts.upcoming ?? 0, "text-violet-600 dark:text-violet-400"],
            [data?.me ? "You solved" : "Past challenges", data?.me ? data.me.solved : counts.ended ?? 0, "text-emerald-600 dark:text-emerald-400"],
            [data?.me ? "Your points" : "Top solvers", data?.me ? data.me.points : data?.standings?.length ?? 0, "text-amber-600 dark:text-amber-400"],
          ].map(([label, value, color]) => (
            <div key={label} className={`${panel} px-4 py-3`}>
              <p className={`text-2xl font-extrabold tabular-nums ${color}`}>{loading ? "–" : value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </ClubHero>

      <div className="px-4 md:px-10 container mx-auto py-8 grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="min-w-0 space-y-5">
          {spotlight && (
            <Link href={`/challenges/${spotlight._id}`} className="block rounded-2xl p-5 md:p-6 text-white bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 shadow-lg shadow-indigo-500/20 hover:shadow-xl transition">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75 inline-flex items-center gap-1.5"><Flame size={13} /> Spotlight · {spotlight.kind} challenge</p>
                  <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">{spotlight.title}</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 rounded-full bg-white/15 font-semibold text-xs">{spotlight.difficulty}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/15 font-semibold text-xs">+{spotlight.points} points</span>
                    <span className="text-white/80 text-xs inline-flex items-center gap-1"><Users size={12} /> {spotlight.solvedBy} solved</span>
                    {spotlight.mine?.status === "accepted" && <span className="px-2 py-0.5 rounded-full bg-emerald-400/90 text-emerald-950 font-bold text-xs">Solved ✓</span>}
                  </div>
                </div>
                <div className="flex items-end gap-4">
                  <BigCountdown target={spotlight.endsAt} label="Ends in" />
                  <span className="hidden sm:inline-flex h-10 px-4 items-center gap-1.5 rounded-lg bg-white text-indigo-700 text-sm font-bold">Solve <ArrowRight size={15} /></span>
                </div>
              </div>
            </Link>
          )}

          <div className={`${panel} p-3 space-y-3`}>
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
              <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/5 self-start">
                {TABS.map((t) => (
                  <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition inline-flex items-center gap-1.5 ${tab === t.key ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}>
                    {t.label} <span className="text-[11px] tabular-nums text-gray-400">{counts[t.key] ?? 0}</span>
                  </button>
                ))}
              </div>
              <div className="relative md:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search problems or tags…" aria-label="Search challenges" className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-950 text-sm outline-none focus:border-indigo-400" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {DIFFS.map((d) => <Chip key={d} active={diff === d} onClick={() => setDiff(d)}>{d === "All" ? "All levels" : d}</Chip>)}
              <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Type" className="h-8 rounded-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3 text-sm">
                <option value="all">Daily & weekly</option><option value="daily">Daily</option><option value="weekly">Weekly</option>
              </select>
              {tags.length > 0 && (
                <select value={tag} onChange={(e) => setTag(e.target.value)} aria-label="Tag" className="h-8 rounded-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3 text-sm">
                  <option value="all">All tags</option>{tags.map((t) => <option key={t} value={t}>#{t}</option>)}
                </select>
              )}
            </div>
          </div>

          {loading ? <RowSkeleton /> : list.length === 0 ? (
            <EmptyState icon={tab === "upcoming" ? <Hourglass size={20} /> : <Target size={20} />}
              title={all.some((c) => c.state === tab) ? "No challenges match these filters" : tab === "active" ? "No active challenges right now" : tab === "upcoming" ? "Nothing scheduled yet" : "No past challenges yet"}>
              {all.some((c) => c.state === tab) ? "Try another level, tag or keyword." : "The next one drops soon. Keep an eye on the notification bell."}
            </EmptyState>
          ) : (
            <div className={`${panel} overflow-hidden`}>
              <div className="hidden md:flex items-center gap-4 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-white/[0.02]">
                <span className="w-5" /><span className="flex-1">Problem</span><span className="w-24">Difficulty</span><span className="w-28">Solved</span>
                <span className="hidden lg:block w-40">{tab === "ended" ? "Closed" : tab === "upcoming" ? "Opens" : "Time left"}</span><span className="w-14 text-right">Reward</span><span className="w-4" />
              </div>
              <ul className="divide-y divide-gray-100 dark:divide-white/5">{list.map((c) => <ChallengeRow key={c._id} c={c} />)}</ul>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 self-start space-y-4">
          {data?.me ? (
            <div className={`${panel} p-5`}>
              <p className="font-bold text-gray-900 dark:text-white">Your progress</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-emerald-500/10 py-2"><p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{data.me.solved}</p><p className="text-[11px] text-gray-500">Solved</p></div>
                <div className="rounded-xl bg-orange-500/10 py-2"><p className="text-lg font-extrabold text-orange-600 dark:text-orange-400">{data.me.attempted}</p><p className="text-[11px] text-gray-500">In progress</p></div>
                <div className="rounded-xl bg-indigo-500/10 py-2"><p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{data.me.pointsFromChallenges}</p><p className="text-[11px] text-gray-500">Points</p></div>
              </div>
            </div>
          ) : !loading && (
            <div className={`${panel} p-5 text-sm`}>
              <p className="font-bold text-gray-900 dark:text-white">Track your progress</p>
              <p className="mt-1 text-gray-500">Log in to submit solutions, earn points and see what you&apos;ve solved.</p>
              <Link href="/login?redirect=/challenges" className="mt-3 h-9 inline-flex items-center justify-center w-full rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold">Log in</Link>
            </div>
          )}
          <div className={`${panel} p-5`}>
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Trophy size={17} className="text-amber-500" /> Top solvers this month</h2>
            {loading ? (
              <div className="mt-4 space-y-3 animate-pulse">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 rounded bg-gray-100 dark:bg-white/5" />)}</div>
            ) : !data?.standings?.length ? (
              <p className="mt-3 text-sm text-gray-500">No accepted solutions yet this month. Be the first!</p>
            ) : (
              <ol className="mt-4 space-y-2.5">
                {data.standings.map((s, i) => (
                  <li key={s._id} className={`flex items-center gap-3 ${i < 3 ? "" : "opacity-90"}`}>
                    <span className={`w-6 text-center text-sm font-extrabold ${i === 0 ? "text-amber-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-orange-600" : "text-gray-400"}`}>{i === 0 ? <Crown size={15} className="inline" /> : i + 1}</span>
                    <img src={s.profileImage || getDefaultAvatar()} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <Link href={`/members/${s.username || s._id}`} className="block text-sm font-medium truncate hover:text-indigo-600">{s.name}</Link>
                      <p className="text-[11px] text-gray-400">{s.solved} solved</p>
                    </div>
                    <span className="text-sm font-bold tabular-nums">{s.points}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div className={`${panel} p-5 text-sm text-gray-600 dark:text-gray-300 space-y-2`}>
            <p className="font-semibold text-gray-900 dark:text-white">How it works</p>
            <p>1. Open the problem and solve it on its judge.</p>
            <p>2. Paste your <b>accepted</b> submission link, or use <b>Verify on Codeforces</b> if your handle is linked.</p>
            <p>3. Points land on your profile once accepted.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
