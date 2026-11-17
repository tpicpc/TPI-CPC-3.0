"use client";

/* eslint-disable @next/next/no-img-element */
import { EmptyState, panel } from "@/components/club/ClubHero";
import { BigCountdown, Countdown, DifficultyBadge, KindBadge, TagList } from "@/components/club/challenge-ui";
import PlatformBadge from "@/components/club/PlatformBadge";
import { useUser } from "@/contexts/UserContext";
import { userApi } from "@/lib/api-client";
import { getDefaultAvatar } from "@/lib/avatars";
import { fmtDateTime, formatDuration, PLATFORMS, timeAgo } from "@/lib/club-format";
import {
  BadgeCheck, CheckCircle2, ChevronRight, Clock, Copy, Crown, ExternalLink, FileText, History, Link2, ListOrdered, LoaderCircle, Lock,
  Send, ShieldCheck, Target, Trophy, Users, XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const RESULT_STYLE = {
  accepted: { label: "Accepted", cls: "bg-green-500/15 text-green-700 dark:text-green-300" },
  pending: { label: "In review", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  rejected: { label: "Rejected", cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
  failed: { label: "Not found", cls: "bg-gray-500/15 text-gray-600 dark:text-gray-300" },
};
const METHOD_LABEL = { auto: "Codeforces auto-verify", manual: "Submission link", review: "Admin review" };

function DetailSkeleton() {
  return (
    <div className="px-4 md:px-10 container mx-auto py-8 max-w-6xl animate-pulse">
      <div className="h-4 w-40 rounded bg-gray-200 dark:bg-white/10" />
      <div className="mt-6 h-40 rounded-2xl bg-gray-100 dark:bg-white/5" />
      <div className="mt-6 grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="h-80 rounded-2xl bg-gray-100 dark:bg-white/5" />
        <div className="h-60 rounded-2xl bg-gray-100 dark:bg-white/5" />
      </div>
    </div>
  );
}

function CodeBlock({ title, value }) {
  const copy = () => navigator.clipboard?.writeText(value).then(() => toast.success("Copied")).catch(() => {});
  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-white/[0.04] border-b border-gray-200 dark:border-white/10">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{title}</span>
        <button type="button" onClick={copy} className="text-xs text-gray-500 hover:text-indigo-600 inline-flex items-center gap-1"><Copy size={12} /> Copy</button>
      </div>
      <pre className="p-3 text-sm font-mono leading-6 overflow-x-auto text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-950/40">{value}</pre>
    </div>
  );
}

function Statement({ c }) {
  const judge = PLATFORMS[c.platform]?.label || "the judge";
  return (
    <div className="space-y-5">
      {c.statement ? (
        <div className="text-[15px] leading-7 text-gray-700 dark:text-gray-300 whitespace-pre-line">{c.statement}</div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-white/15 p-4 text-sm text-gray-600 dark:text-gray-300 flex gap-3">
          <FileText size={18} className="text-indigo-500 shrink-0 mt-0.5" />
          <p>The full statement, constraints and tests live on {judge}. Read it there, then come back to submit.</p>
        </div>
      )}
      {(c.sampleInput || c.sampleOutput) && (
        <div className="grid md:grid-cols-2 gap-3">
          {c.sampleInput && <CodeBlock title="Sample input" value={c.sampleInput} />}
          {c.sampleOutput && <CodeBlock title="Sample output" value={c.sampleOutput} />}
        </div>
      )}
      {c.description && (
        <div className="rounded-xl bg-indigo-50/70 dark:bg-indigo-500/[0.07] border border-indigo-100 dark:border-indigo-500/20 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Mentor&apos;s note</p>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{c.description}</p>
        </div>
      )}
      {c.problemUrl && (
        <a href={c.problemUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-90">
          Open on {judge} <ExternalLink size={15} />
        </a>
      )}
    </div>
  );
}

function HistoryList({ history, loggedIn }) {
  if (!loggedIn) return <EmptyState icon={<History size={20} />} title="Log in to see your submissions" />;
  if (!history.length) return <EmptyState icon={<History size={20} />} title="No submissions yet">Your attempts and review results will show up here.</EmptyState>;
  return (
    <ol className="relative border-l border-gray-200 dark:border-white/10 ml-2 space-y-5">
      {history.map((h, i) => {
        const st = RESULT_STYLE[h.result] || RESULT_STYLE.pending;
        return (
          <li key={h._id || i} className="ml-5">
            <span className={`absolute -left-[7px] mt-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-white dark:ring-gray-950 ${h.result === "accepted" ? "bg-green-500" : h.result === "rejected" ? "bg-rose-500" : h.result === "failed" ? "bg-gray-400" : "bg-amber-500"}`} />
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{METHOD_LABEL[h.method] || h.method}</span>
              <span className="text-xs text-gray-400" title={fmtDateTime(h.at)}>{timeAgo(h.at)}</span>
            </div>
            {h.message && <p className="mt-1 text-sm text-gray-500">{h.message}</p>}
            {h.link && <a href={h.link} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline break-all"><Link2 size={12} /> {h.link.replace(/^https?:\/\//, "")}</a>}
          </li>
        );
      })}
    </ol>
  );
}

function MiniLeaderboard({ rows, meId }) {
  if (!rows.length) return <EmptyState icon={<Trophy size={20} />} title="Nobody has solved it yet">Claim first blood!</EmptyState>;
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-wider text-gray-400 text-left">
            <th className="px-2 py-2 w-12">#</th><th className="px-2 py-2">Member</th><th className="px-2 py-2">Solved after</th><th className="px-2 py-2 hidden sm:table-cell">Tries</th><th className="px-2 py-2 text-right">Points</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
          {rows.map((r) => {
            const me = meId && String(r.user._id) === String(meId);
            return (
              <tr key={r._id} className={me ? "bg-indigo-50/70 dark:bg-indigo-500/10" : ""}>
                <td className="px-2 py-2.5 font-extrabold tabular-nums">
                  {r.rank === 1 ? <Crown size={16} className="text-amber-500" /> : <span className={r.rank <= 3 ? "text-orange-500" : "text-gray-400"}>{r.rank}</span>}
                </td>
                <td className="px-2 py-2.5">
                  <Link href={`/members/${r.user.username || r.user._id}`} className="flex items-center gap-2 min-w-0 hover:text-indigo-600">
                    <img src={r.user.profileImage || getDefaultAvatar()} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                    <span className="truncate font-medium">{r.user.fullName}{me && <span className="ml-1 text-[11px] text-indigo-500">(you)</span>}</span>
                    {r.method === "auto" && <BadgeCheck size={14} className="text-green-500 shrink-0" aria-label="Verified on Codeforces" />}
                    {r.rank === 1 && <span className="text-[10px] font-bold text-rose-500 shrink-0">FIRST</span>}
                  </Link>
                </td>
                <td className="px-2 py-2.5 tabular-nums text-gray-600 dark:text-gray-300">{r.minutes != null ? formatDuration(r.minutes) : "—"}</td>
                <td className="px-2 py-2.5 tabular-nums text-gray-500 hidden sm:table-cell">{r.tries}</td>
                <td className="px-2 py-2.5 text-right font-bold tabular-nums">+{r.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ChallengeDetailPage() {
  const { id } = useParams();
  const { userData } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState("");
  const [tab, setTab] = useState("problem");

  const load = useCallback(async () => {
    try {
      const { data } = await userApi().get(`/api/v1/challenges/${id}`);
      if (data.success) setData(data);
    } catch {} finally { setLoading(false); }
  }, [id]);
  useEffect(() => { load(); }, [load, userData]);

  const submit = async (auto) => {
    setBusy(auto ? "auto" : "link");
    try {
      const { data } = await userApi().post(`/api/v1/challenges/${id}/submit`, auto ? { auto: true } : { link });
      toast.success(data.message);
      setLink("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally { setBusy(""); load(); }
  };

  if (loading) return <DetailSkeleton />;
  if (!data) {
    return (
      <div className="px-4 md:px-10 container mx-auto py-16 max-w-xl">
        <EmptyState icon={<Target size={20} />} title="Challenge not found">It may have been removed. <Link href="/challenges" className="text-indigo-500 hover:underline">See all challenges</Link></EmptyState>
      </div>
    );
  }
  const { challenge: c, leaderboard, stats, mine, history, myCfHandle } = data;
  const active = c.state === "active";
  const upcoming = c.state === "upcoming";
  const TABS = [
    { key: "problem", label: "Problem", icon: FileText },
    { key: "history", label: "My submissions", icon: History, n: history.length },
    { key: "board", label: "Leaderboard", icon: ListOrdered, n: leaderboard.length },
  ];

  return (
    <div className="px-4 md:px-10 container mx-auto py-6 md:py-8 max-w-6xl">
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4">
        <Link href="/challenges" className="hover:text-indigo-600">Challenges</Link><ChevronRight size={14} /><span className="truncate text-gray-700 dark:text-gray-300">{c.title}</span>
      </nav>

      <header className={`${panel} relative overflow-hidden p-5 md:p-6`}>
        <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <KindBadge kind={c.kind} />
              <DifficultyBadge level={c.difficulty} />
              <PlatformBadge platform={c.platform} size="xs" />
              {c.autoVerify && <span className="text-[11px] font-medium text-green-600 dark:text-green-400 inline-flex items-center gap-0.5"><BadgeCheck size={12} /> Auto-verify</span>}
              {mine?.status === "accepted" && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-500 text-white inline-flex items-center gap-1"><CheckCircle2 size={11} /> Solved</span>}
            </div>
            <h1 className="mt-2.5 text-2xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">{c.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500">
              <TagList tags={c.tags} max={6} />
              <span className="inline-flex items-center gap-1"><Clock size={13} /> {upcoming ? "Opens" : "Opened"} {fmtDateTime(c.startsAt)}</span>
              {active && c.endsAt && <Countdown target={c.endsAt} prefix="Ends in" />}
              {c.state === "ended" && c.endsAt && <span>Closed {fmtDateTime(c.endsAt)}</span>}
            </div>
          </div>
          {upcoming ? <BigCountdown target={c.startsAt} label="Opens in" tone="dark" /> : (
            <div className="grid grid-cols-3 gap-2 text-center shrink-0">
              <div className="rounded-xl bg-indigo-500/10 px-3 py-2"><p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">+{c.points}</p><p className="text-[11px] text-gray-500">points</p></div>
              <div className="rounded-xl bg-emerald-500/10 px-3 py-2"><p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.solved}</p><p className="text-[11px] text-gray-500">solved</p></div>
              <div className="rounded-xl bg-amber-500/10 px-3 py-2"><p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{stats.rate}%</p><p className="text-[11px] text-gray-500">success</p></div>
            </div>
          )}
        </div>
      </header>

      {upcoming ? (
        <div className="mt-6">
          <EmptyState icon={<Lock size={20} />} title="This challenge hasn't opened yet">The problem unlocks when the countdown ends. You&apos;ll get a notification.</EmptyState>
        </div>
      ) : (
        <div className="mt-6 grid lg:grid-cols-[1fr_340px] gap-6">
          <section className={`${panel} min-w-0`}>
            <div className="flex gap-1 px-2 pt-2 border-b border-gray-100 dark:border-white/5 overflow-x-auto [scrollbar-width:none]">
              {TABS.map(({ key, label, icon: Icon, n }) => (
                <button key={key} type="button" onClick={() => setTab(key)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${tab === key ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}>
                  <Icon size={15} /> {label}{n ? <span className="text-[11px] tabular-nums px-1.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-500">{n}</span> : null}
                </button>
              ))}
            </div>
            <div className="p-5">
              {tab === "problem" && <Statement c={c} />}
              {tab === "history" && <HistoryList history={history} loggedIn={!!userData} />}
              {tab === "board" && <MiniLeaderboard rows={leaderboard} meId={userData?._id} />}
            </div>
          </section>

          <aside className="lg:sticky lg:top-28 self-start space-y-4">
            <div className={`${panel} p-5`}>
              {!userData ? (
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">Solved it?</p>
                  <p className="text-gray-500 mt-1">Log in to submit and earn +{c.points} points.</p>
                  <Link href={`/login?redirect=/challenges/${id}`} className="mt-4 w-full h-10 inline-flex items-center justify-center rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold">Log in</Link>
                </div>
              ) : mine?.status === "accepted" ? (
                <div className="text-sm">
                  <p className="flex items-center gap-2 font-semibold text-green-600 dark:text-green-400"><CheckCircle2 size={18} /> Accepted · +{mine.points} pts</p>
                  <p className="text-gray-500 mt-1">{mine.method === "auto" ? "Verified automatically on Codeforces" : "Reviewed by an admin"} {timeAgo(mine.reviewedAt)}.{mine.myRank ? ` You're #${mine.myRank} on this problem.` : ""}</p>
                  {mine.link && <a href={mine.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">View submission <ExternalLink size={12} /></a>}
                </div>
              ) : !active ? (
                <p className="text-sm text-gray-500">This challenge has ended. <Link href="/challenges" className="text-indigo-500 hover:underline">Try an active one!</Link></p>
              ) : (
                <div className="space-y-4 text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Send size={15} className="text-indigo-500" /> Submit your solution</p>
                  {mine?.status === "pending" && <p className="rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-200 px-3 py-2">Your submission is under review. You can update the link below.</p>}
                  {mine?.status === "rejected" && <p className="rounded-lg bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 px-3 py-2 flex gap-2"><XCircle size={16} className="shrink-0 mt-0.5" /> {mine.reviewNote || "Not accepted. Please check and resubmit."}</p>}
                  {c.autoVerify && (
                    <div>
                      <button onClick={() => submit(true)} disabled={!!busy || !myCfHandle} className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold">
                        {busy === "auto" ? <LoaderCircle size={16} className="animate-spin" /> : <ShieldCheck size={16} />} Verify on Codeforces
                      </button>
                      <p className="mt-1.5 text-xs text-gray-500">
                        {myCfHandle ? <>Checks <b>{myCfHandle}</b>&apos;s recent accepted submissions.</> : <>Link your handle in <Link href="/dashboard/portfolio" className="text-indigo-500 hover:underline">Public profile</Link> to use this.</>}
                      </p>
                    </div>
                  )}
                  <form onSubmit={(e) => { e.preventDefault(); submit(false); }} className="space-y-2">
                    <label htmlFor="sublink" className="text-xs font-semibold text-gray-600 dark:text-gray-300">{c.autoVerify ? "…or paste your accepted submission link" : "Accepted submission link"}</label>
                    <div className="relative">
                      <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input id="sublink" type="url" required value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://codeforces.com/contest/…/submission/…" className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm" />
                    </div>
                    <button type="submit" disabled={!!busy} className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold">
                      {busy === "link" ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={15} />} Submit for review
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className={`${panel} p-5`}>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Trophy size={16} className="text-amber-500" /> First solvers</p>
                {leaderboard.length > 3 && <button type="button" onClick={() => setTab("board")} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">See all</button>}
              </div>
              {!leaderboard.length ? <p className="mt-2 text-sm text-gray-500">No one yet. Be the first!</p> : (
                <ol className="mt-3 space-y-2.5">
                  {leaderboard.slice(0, 3).map((r) => (
                    <li key={r._id} className="flex items-center gap-2.5 text-sm">
                      <span className={`w-5 text-center font-extrabold ${r.rank === 1 ? "text-amber-500" : "text-gray-400"}`}>{r.rank}</span>
                      <img src={r.user.profileImage || getDefaultAvatar()} alt="" className="w-7 h-7 rounded-full object-cover" />
                      <span className="flex-1 truncate">{r.user.fullName}</span>
                      <span className="text-xs text-gray-400 tabular-nums">{r.minutes != null ? formatDuration(r.minutes) : ""}</span>
                    </li>
                  ))}
                </ol>
              )}
              <p className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 text-xs text-gray-500 flex items-center gap-1"><Users size={12} /> {stats.attempted} participants · {stats.solved} accepted</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
