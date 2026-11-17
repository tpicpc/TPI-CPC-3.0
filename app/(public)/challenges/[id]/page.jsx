"use client";

/* eslint-disable @next/next/no-img-element */
import { panel } from "@/components/club/ClubHero";
import PlatformBadge from "@/components/club/PlatformBadge";
import { ArticleSkeleton } from "@/components/skeletons";
import { useUser } from "@/contexts/UserContext";
import { userApi } from "@/lib/api-client";
import { getDefaultAvatar } from "@/lib/avatars";
import { DIFF_STYLES, fmtDateTime, timeAgo, timeUntil } from "@/lib/club-format";
import { ArrowLeft, BadgeCheck, CheckCircle2, Clock, ExternalLink, Hourglass, Link2, LoaderCircle, Send, ShieldCheck, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ChallengeDetailPage() {
  const { id } = useParams();
  const { userData } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState("");

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
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally { setBusy(""); }
  };

  if (loading) return <div className="px-4 md:px-10 container mx-auto py-10 max-w-5xl"><ArticleSkeleton /></div>;
  if (!data) return <div className="px-4 md:px-10 container mx-auto py-16 text-center">Challenge not found.</div>;
  const { challenge: c, solvers, mine, myCfHandle } = data;
  const active = c.state === "active";

  return (
    <div className="px-4 md:px-10 container mx-auto py-8 md:py-10 max-w-6xl">
      <Link href="/challenges" className="inline-flex items-center gap-2 text-sm text-indigo-500 hover:underline mb-5"><ArrowLeft size={16} /> All challenges</Link>
      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        <article className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">{c.kind} challenge</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${DIFF_STYLES[c.difficulty]}`}>{c.difficulty}</span>
            <PlatformBadge platform={c.platform} size="xs" />
          </div>
          <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">{c.title}</h1>
          <p className="mt-2 text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1"><Clock size={13} /> Opened {fmtDateTime(c.startsAt)}</span>
            {c.endsAt && <span className="inline-flex items-center gap-1"><Hourglass size={13} /> {active ? `Ends ${timeUntil(c.endsAt)}` : `Ended ${fmtDateTime(c.endsAt)}`}</span>}
          </p>
          {c.description && <div className="mt-6 text-[15px] leading-7 text-gray-700 dark:text-gray-300 whitespace-pre-line">{c.description}</div>}
          {c.problemUrl && (
            <a href={c.problemUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-90">
              Open problem <ExternalLink size={15} />
            </a>
          )}

          <section className="mt-10">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Solved by <span className="text-gray-400 font-medium">· {solvers.length}</span></h2>
            {solvers.length === 0 ? <p className="text-sm text-gray-500">Nobody yet — claim first blood!</p> : (
              <div className="flex flex-wrap gap-2">
                {solvers.map((s, i) => (
                  <Link key={s._id} href={`/members/${s.user.username || s.user._id}`} className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 pl-1 pr-3 py-1 text-sm hover:border-indigo-300">
                    <img src={s.user.profileImage || getDefaultAvatar()} alt="" className="w-6 h-6 rounded-full object-cover" />
                    {s.user.fullName}
                    {i === 0 && <span className="text-[10px] font-bold text-rose-500">1st</span>}
                    {s.method === "auto" && <BadgeCheck size={13} className="text-green-500" title="Verified on Codeforces" />}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </article>

        <aside className="lg:sticky lg:top-28 self-start space-y-4">
          <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-indigo-500/20">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Reward</p>
            <p className="text-4xl font-extrabold mt-1">+{c.points} <span className="text-base font-semibold opacity-80">points</span></p>
          </div>
          <div className={`${panel} p-5`}>
            {!userData ? (
              <div className="text-sm">
                <p className="font-semibold text-gray-900 dark:text-white">Solved it?</p>
                <p className="text-gray-500 mt-1">Log in to submit and earn points.</p>
                <Link href={`/login?redirect=/challenges/${id}`} className="mt-4 w-full h-10 inline-flex items-center justify-center rounded-lg bg-indigo-500 text-white font-semibold">Log in</Link>
              </div>
            ) : mine?.status === "accepted" ? (
              <div className="text-sm">
                <p className="flex items-center gap-2 font-semibold text-green-600 dark:text-green-400"><CheckCircle2 size={18} /> Accepted · +{mine.points} pts</p>
                <p className="text-gray-500 mt-1">{mine.method === "auto" ? "Verified automatically on Codeforces" : "Reviewed by an admin"} {timeAgo(mine.reviewedAt || mine.updatedAt)}.</p>
                {mine.link && <a href={mine.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">View submission <ExternalLink size={12} /></a>}
              </div>
            ) : !active ? (
              <p className="text-sm text-gray-500">This challenge has ended. Try the active ones!</p>
            ) : (
              <div className="space-y-4 text-sm">
                {mine?.status === "pending" && <p className="rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-200 px-3 py-2">Your submission is under review. You can update the link below.</p>}
                {mine?.status === "rejected" && <p className="rounded-lg bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 px-3 py-2 flex gap-2"><XCircle size={16} className="shrink-0 mt-0.5" /> {mine.reviewNote || "Not accepted — please check and resubmit."}</p>}
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
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">{c.autoVerify ? "…or paste your accepted submission link" : "Accepted submission link"}</label>
                  <div className="relative">
                    <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="url" required value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://codeforces.com/contest/…/submission/…" className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm" />
                  </div>
                  <button type="submit" disabled={!!busy} className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold">
                    {busy === "link" ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={15} />} Submit for review
                  </button>
                </form>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
