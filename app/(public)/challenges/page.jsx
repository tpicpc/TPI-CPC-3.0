"use client";

/* eslint-disable @next/next/no-img-element */
import ClubHero, { Chip, EmptyState, panel } from "@/components/club/ClubHero";
import PlatformBadge from "@/components/club/PlatformBadge";
import { ListSkeleton } from "@/components/skeletons";
import { userApi } from "@/lib/api-client";
import { getDefaultAvatar } from "@/lib/avatars";
import { DIFF_STYLES, timeUntil } from "@/lib/club-format";
import { ArrowRight, CheckCircle2, Clock, Flame, Hourglass, Target, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function ChallengesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");

  useEffect(() => {
    userApi().get("/api/v1/challenges").then(({ data }) => data.success && setData(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const list = useMemo(() => (data?.challenges || []).filter((c) => (tab === "active" ? c.state === "active" : c.state === "ended")), [data, tab]);
  const featured = list.filter((c) => c.state === "active");

  return (
    <div>
      <ClubHero eyebrow="Practice" icon={<Target size={14} />} title="Daily & weekly challenges"
        subtitle="One curated problem at a time. Solve it, submit your accepted link — or let us verify it on Codeforces automatically — and earn points.">
        <div className="flex gap-2">
          <Chip active={tab === "active"} onClick={() => setTab("active")}>Active</Chip>
          <Chip active={tab === "ended"} onClick={() => setTab("ended")}>Past</Chip>
        </div>
      </ClubHero>

      <div className="px-4 md:px-10 container mx-auto py-8 grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="min-w-0">
          {loading ? <ListSkeleton count={4} /> : list.length === 0 ? (
            <EmptyState icon={<Target size={20} />} title={tab === "active" ? "No active challenges right now" : "No past challenges yet"}>The next one drops soon — keep an eye on your notifications.</EmptyState>
          ) : (
            <ul className="space-y-4">
              {list.map((c) => (
                <li key={c._id}>
                  <Link href={`/challenges/${c._id}`} className={`${panel} group block p-5 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-lg transition ${featured[0]?._id === c._id ? "ring-1 ring-indigo-500/30" : ""}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${c.kind === "daily" ? "bg-orange-500/15 text-orange-700 dark:text-orange-300" : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300"}`}>
                        {c.kind === "daily" ? <Flame size={11} className="inline -mt-0.5 mr-0.5" /> : <Zap size={11} className="inline -mt-0.5 mr-0.5" />}{c.kind}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${DIFF_STYLES[c.difficulty]}`}>{c.difficulty}</span>
                      <PlatformBadge platform={c.platform} size="xs" />
                      {c.autoVerify && <span className="text-[11px] text-green-600 dark:text-green-400 font-medium">Auto-verify</span>}
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{c.title}</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{c.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">+{c.points}</p>
                        <p className="text-[11px] text-gray-500">points</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1"><Users size={13} /> {c.solvedBy} solved</span>
                      {c.endsAt && (c.state === "active"
                        ? <span className="inline-flex items-center gap-1"><Hourglass size={13} /> Ends {timeUntil(c.endsAt)}</span>
                        : <span className="inline-flex items-center gap-1"><Clock size={13} /> Ended {new Date(c.endsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>)}
                      {c.mine?.status === "accepted" && <span className="inline-flex items-center gap-1 text-green-600 font-semibold"><CheckCircle2 size={13} /> Solved</span>}
                      {c.mine?.status === "pending" && <span className="text-amber-600 font-semibold">Under review</span>}
                      <span className="ml-auto inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">Open <ArrowRight size={13} /></span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 self-start space-y-4">
          <div className={`${panel} p-5`}>
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Flame size={17} className="text-orange-500" /> Top solvers this month</h2>
            {!data?.standings?.length ? (
              <p className="mt-3 text-sm text-gray-500">No accepted solutions yet this month. Be the first!</p>
            ) : (
              <ol className="mt-4 space-y-3">
                {data.standings.map((s, i) => (
                  <li key={s._id} className="flex items-center gap-3">
                    <span className={`w-6 text-center text-sm font-extrabold ${i === 0 ? "text-amber-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-orange-600" : "text-gray-400"}`}>{i + 1}</span>
                    <img src={s.profileImage || getDefaultAvatar()} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <Link href={`/members/${s.username || s._id}`} className="flex-1 min-w-0 text-sm font-medium truncate hover:text-indigo-600">{s.name}</Link>
                    <span className="text-sm font-bold tabular-nums">{s.points}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div className={`${panel} p-5 text-sm text-gray-600 dark:text-gray-300 space-y-2`}>
            <p className="font-semibold text-gray-900 dark:text-white">How it works</p>
            <p>1. Solve the problem on its judge.</p>
            <p>2. Paste the link to your <b>accepted</b> submission — or use <b>Verify on Codeforces</b> if your handle is linked.</p>
            <p>3. Points land on your profile once accepted.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
