"use client";

/* eslint-disable @next/next/no-img-element */
import { panel } from "@/components/club/ClubHero";
import { CardGridSkeleton, ProfileHeroSkeleton } from "@/components/skeletons";
import { getDefaultAvatar } from "@/lib/avatars";
import { cfRankColor, PLATFORMS } from "@/lib/club-format";
import { FEATURES } from "@/lib/features";
import { formatDate } from "@/lib/utils";
import axios from "axios";
import {
  Award, BadgeCheck, BookOpen, Calendar, CalendarCheck, Check, Code2, ExternalLink, Facebook, Flame, FolderGit2,
  Github, Globe, Heart, Linkedin, Medal, Newspaper, PenLine, Share2, Star, Target, Trophy,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const BADGE_ICONS = { trophy: Trophy, star: Star, flame: Flame, pen: PenLine, target: Target, calendar: CalendarCheck, award: Award, medal: Medal };
const TONES = {
  violet: "from-violet-500/15 to-fuchsia-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  blue: "from-blue-500/15 to-cyan-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  green: "from-green-500/15 to-emerald-500/10 text-green-700 dark:text-green-300 border-green-500/20",
  amber: "from-amber-500/15 to-yellow-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20",
  rose: "from-rose-500/15 to-orange-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
  emerald: "from-emerald-500/15 to-teal-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  orange: "from-orange-500/15 to-amber-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
  sky: "from-sky-500/15 to-blue-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  indigo: "from-indigo-500/15 to-violet-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
};

export default function MemberProfilePage() {
  const { handle } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`/api/v1/members/${handle}`);
        if (data.success) setData(data);
      } catch {} finally { setLoading(false); }
    })();
  }, [handle]);

  if (loading) return (
    <div className="px-4 md:px-10 container mx-auto py-10">
      <ProfileHeroSkeleton />
      <div className="mt-8"><CardGridSkeleton count={3} /></div>
    </div>
  );
  if (!data) return <div className="px-4 md:px-10 container mx-auto py-16 text-center">Member not found.</div>;

  const { member, projects, blogs, enrollments, stats, cp = {}, badges = [], certificates = [] } = data;
  const handles = member.handles || {};
  const socials = [
    member.github && { href: member.github, icon: Github, label: "GitHub" },
    member.linkedin && { href: member.linkedin, icon: Linkedin, label: "LinkedIn" },
    member.facebook && { href: member.facebook, icon: Facebook, label: "Facebook" },
    member.website && { href: member.website, icon: Globe, label: "Website" },
  ].filter(Boolean);
  const totalSolved = ["codeforces", "codechef"].reduce((a, p) => a + (cp[p]?.solved || 0), 0);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: `${member.fullName} · TPI CPC`, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-transparent dark:from-indigo-500/20 dark:via-violet-500/10 pointer-events-none" />
      <div className="relative px-4 md:px-10 container mx-auto py-8 md:py-12 grid lg:grid-cols-[320px_1fr] gap-6 lg:gap-8">
        {/* ---------- Identity card ---------- */}
        <aside className="lg:sticky lg:top-28 self-start space-y-4">
          <div className={`${panel} p-6`}>
            <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-500 mx-auto lg:mx-0">
              <img src={member.profileImage || getDefaultAvatar()} alt={member.fullName} className="w-full h-full rounded-full object-cover ring-2 ring-white dark:ring-gray-950 bg-gray-100" />
            </div>
            <div className="mt-4 text-center lg:text-left">
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white inline-flex items-center gap-1.5">
                {member.fullName} {member.emailVerified && <BadgeCheck className="text-green-500" size={20} />}
              </h1>
              {member.username && <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">@{member.username}</p>}
              {member.headline && <p className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-200">{member.headline}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {member.department || "Member"}{member.shift ? ` · ${member.shift} shift` : ""}{member.session ? ` · Session ${member.session}` : ""}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-1.5"><Calendar size={12} /> Joined {formatDate(member.createdAt)}</p>
            </div>
            {member.bio && <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line">{member.bio}</p>}

            {socials.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center lg:justify-start gap-2">
                {socials.map(({ href, icon: Icon, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer me" title={label}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-indigo-600 hover:border-indigo-300 transition">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
            <button onClick={share} className="mt-4 w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-semibold hover:opacity-90">
              {copied ? <><Check size={15} /> Link copied</> : <><Share2 size={15} /> Share profile</>}
            </button>
          </div>

          {member.skills?.length > 0 && (
            <div className={`${panel} p-5`}>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-1.5">
                {member.skills.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">{s}</span>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ---------- Main column ---------- */}
        <main className="min-w-0 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatTile icon={<Code2 size={16} />} label="Problems solved" value={totalSolved || stats.solved || "—"} hint={cp.codeforces?.solved != null ? "Codeforces + CodeChef" : "Add handles to track"} />
            <StatTile icon={<Trophy size={16} />} label="CF rating" value={cp.codeforces?.rating ?? "—"} valueClass={cfRankColor(cp.codeforces?.rating)} hint={cp.codeforces?.rank || ""} />
            <StatTile icon={<Target size={16} />} label="Challenge points" value={stats.points || 0} hint={`${stats.challengesSolved || 0} challenges solved`} />
            <StatTile icon={<Newspaper size={16} />} label="Blog posts" value={stats.blogs} hint={`${stats.eventsAttended || 0} events attended`} />
          </div>

          {(handles.codeforces || handles.codechef || handles.atcoder) && (
            <Section title="Competitive programming" icon={<Trophy size={18} />}>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {["codeforces", "codechef", "atcoder"].filter((p) => handles[p]).map((p) => {
                  const s = cp[p];
                  return (
                    <a key={p} href={PLATFORMS[p].profile(handles[p])} target="_blank" rel="noopener noreferrer" className={`${panel} p-4 group hover:border-indigo-300 dark:hover:border-indigo-500/40 transition`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{PLATFORMS[p].label}</span>
                        <ExternalLink size={13} className="text-gray-400 group-hover:text-indigo-500" />
                      </div>
                      <p className="mt-1 font-semibold text-gray-900 dark:text-white truncate">{s?.displayHandle || handles[p]}</p>
                      {s?.ok === false && !s?.rating ? (
                        <p className="mt-3 text-xs text-gray-400">Stats unavailable right now</p>
                      ) : (
                        <div className="mt-3 flex items-end gap-4">
                          <div>
                            <p className={`text-2xl font-extrabold tabular-nums ${p === "codeforces" ? cfRankColor(s?.rating) : "text-gray-900 dark:text-white"}`}>{s?.rating ?? "—"}</p>
                            <p className="text-[11px] text-gray-500">rating{s?.rank ? ` · ${s.rank}` : ""}</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold tabular-nums text-gray-700 dark:text-gray-200">{s?.maxRating ?? "—"}</p>
                            <p className="text-[11px] text-gray-500">max</p>
                          </div>
                          {s?.solved != null && (
                            <div>
                              <p className="text-lg font-bold tabular-nums text-gray-700 dark:text-gray-200">{s.solved}</p>
                              <p className="text-[11px] text-gray-500">solved</p>
                            </div>
                          )}
                        </div>
                      )}
                    </a>
                  );
                })}
              </div>
            </Section>
          )}

          {badges.length > 0 && (
            <Section title="Badges" icon={<Medal size={18} />} count={badges.length}>
              <div className="flex flex-wrap gap-2">
                {badges.map((b) => {
                  const Icon = BADGE_ICONS[b.icon] || Medal;
                  return (
                    <span key={b.label} className={`inline-flex items-center gap-1.5 rounded-full border bg-gradient-to-r px-3 py-1.5 text-xs font-semibold ${TONES[b.tone] || TONES.indigo}`}>
                      <Icon size={13} /> {b.label}
                    </span>
                  );
                })}
              </div>
            </Section>
          )}

          {FEATURES.projects && (
            <Section title="Projects" icon={<FolderGit2 size={18} />} count={projects.length}>
              {projects.length === 0 ? <Empty>No public projects yet.</Empty> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((p) => (
                    <Link key={p._id} href={`/projects/${p._id}`} className={`${panel} group overflow-hidden`}>
                      <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden"><img src={p.coverImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition" /></div>
                      <div className="p-4"><h3 className="font-bold line-clamp-2">{p.title}</h3><p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Heart size={11} /> {p.likeCount}</p></div>
                    </Link>
                  ))}
                </div>
              )}
            </Section>
          )}

          <Section title="Writing" icon={<Newspaper size={18} />} count={blogs.length}>
            {blogs.length === 0 ? <Empty>No published posts yet.</Empty> : (
              <div className="divide-y divide-gray-200 dark:divide-white/10 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] overflow-hidden">
                {blogs.map((b) => (
                  <Link key={b._id} href={`/blogs/${b.slug || b._id}`} className="flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2">{b.title}</h3>
                      {b.subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{b.subtitle}</p>}
                      <p className="text-xs text-gray-500 mt-2 flex gap-3">
                        <span>{formatDate(b.createdAt)}</span>
                        {b.likeCount > 0 && <span className="inline-flex items-center gap-1"><Heart size={11} /> {b.likeCount}</span>}
                      </p>
                    </div>
                    {b.image && <img src={b.image} alt="" className="w-24 h-16 md:w-32 md:h-20 rounded-lg object-cover shrink-0" />}
                  </Link>
                ))}
              </div>
            )}
          </Section>

          {certificates.length > 0 && (
            <Section title="Certificates" icon={<Award size={18} />} count={certificates.length}>
              <div className="grid sm:grid-cols-2 gap-3">
                {certificates.map((c) => (
                  <Link key={c.number} href={`/certificate/${c.number}`} className={`${panel} p-4 flex items-start gap-3 hover:border-indigo-300 transition`}>
                    <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0"><Award size={18} /></span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">{c.referenceTitle}</p>
                      <p className="text-xs text-gray-500 mt-0.5 capitalize">{c.type === "course" ? "Course completion" : "Event participation"} · {formatDate(c.issuedAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {enrollments.length > 0 && (
            <Section title="Courses" icon={<BookOpen size={18} />} count={enrollments.length}>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {enrollments.map((e) => (
                  <Link key={e._id} href={`/workshop/${e.workshop.slug}`} className={`${panel} group overflow-hidden`}>
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden"><img src={e.workshop.thumbnail} alt={e.workshop.title} className="w-full h-full object-cover group-hover:scale-105 transition" /></div>
                    <div className="p-4"><h3 className="font-bold text-sm line-clamp-2 text-gray-900 dark:text-white">{e.workshop.title}</h3><p className="text-xs text-gray-500 mt-1">{e.workshop.category} · {e.workshop.level}</p></div>
                  </Link>
                ))}
              </div>
            </Section>
          )}
        </main>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, hint, valueClass = "text-gray-900 dark:text-white" }) {
  return (
    <div className={`${panel} p-4`}>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 inline-flex items-center gap-1.5">{icon} {label}</p>
      <p className={`mt-2 text-2xl md:text-3xl font-extrabold tabular-nums ${valueClass}`}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400 truncate capitalize">{hint}</p>}
    </div>
  );
}

function Section({ title, icon, count, children }) {
  return (
    <section>
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
        {icon} {title}
        {count != null && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">{count}</span>}
      </h2>
      {children}
    </section>
  );
}

function Empty({ children }) {
  return <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/15 py-8 text-center text-sm text-gray-500">{children}</div>;
}
