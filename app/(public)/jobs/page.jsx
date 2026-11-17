"use client";

/* eslint-disable @next/next/no-img-element */
import ClubHero, { EmptyState, panel } from "@/components/club/ClubHero";
import Modal from "@/components/club/Modal";
import { ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import { userApi } from "@/lib/api-client";
import { fmtDate, timeAgo } from "@/lib/club-format";
import {
  ArrowUpRight, Briefcase, Building2, CalendarClock, ChevronDown, Code2, Globe, HardHat, Info, Landmark, LayoutGrid, LoaderCircle,
  MapPin, Plus, Search, SlidersHorizontal, Users, Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const TABS = [
  { key: "all", label: "All jobs", icon: LayoutGrid },
  { key: "swe", label: "Software / CSE", icon: Code2 },
  { key: "diploma", label: "Diploma engineering", icon: HardHat },
  { key: "govt", label: "Government (BD)", icon: Landmark },
  { key: "club", label: "Club board", icon: Users },
];
const TYPES = ["Any type", "Internship", "Full-time", "Part-time", "Contract"];
const DEADLINES = [
  { key: "any", label: "Any deadline" },
  { key: "week", label: "Closing within 7 days" },
  { key: "month", label: "Closing within 30 days" },
  { key: "has", label: "Has a deadline" },
];
const TYPE_STYLE = {
  Internship: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "Full-time": "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  "Part-time": "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  Contract: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
};
const CAT_LABEL = { swe: "Software / CSE", diploma: "Diploma", govt: "Government", other: "Other" };
const PAGE = 20;
const emptyForm = { title: "", company: "", kind: "Internship", category: "swe", location: "", description: "", applyUrl: "", salary: "", deadline: "", tags: "" };

function fromClubPost(j) {
  return {
    id: j._id, title: j.title, company: j.company, location: j.location || "", remote: j.kind === "Remote" || /remote/i.test(j.location || ""),
    type: j.kind === "Remote" ? "Full-time" : j.kind, tags: j.tags || [], salary: j.salary || "", deadline: j.deadline, postedAt: j.createdAt,
    url: j.applyUrl, category: j.category || "swe", source: "club", sourceLabel: "TPI CPC", description: j.description || "", club: true,
  };
}

function Logo({ job }) {
  const [broken, setBroken] = useState(false);
  const initial = (job.company || job.title || "?").trim().slice(0, 1).toUpperCase();
  if (job.logo && !broken) {
    return <img src={job.logo} alt="" onError={() => setBroken(true)} className="w-12 h-12 rounded-xl object-contain bg-white border border-gray-200 dark:border-white/10 p-1 shrink-0" loading="lazy" />;
  }
  const grad = job.category === "govt" ? "from-emerald-600 to-green-700" : job.category === "diploma" ? "from-amber-500 to-orange-600" : "from-indigo-500 to-violet-500";
  return <span className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} text-white font-extrabold text-lg flex items-center justify-center shrink-0`}>{initial}</span>;
}

function JobCard({ j, expanded, onToggle }) {
  const daysLeft = j.deadline ? Math.ceil((new Date(j.deadline) - Date.now()) / 86400000) : null;
  const soon = daysLeft != null && daysLeft <= 7;
  return (
    <li className={`${panel} p-4 md:p-5 ${j.club ? "ring-1 ring-indigo-500/25" : ""}`}>
      <div className="flex gap-4">
        <Logo job={j} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${TYPE_STYLE[j.type] || TYPE_STYLE["Full-time"]}`}>{j.type}</span>
            {j.remote && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-700 dark:text-violet-300 inline-flex items-center gap-1"><Globe size={10} /> Remote</span>}
            {j.diplomaRelevant && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">Technical post</span>}
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${j.club ? "border-indigo-300 text-indigo-600 dark:text-indigo-300 dark:border-indigo-500/40" : "border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400"}`}>
              {j.club ? "Shared in the club" : `via ${j.sourceLabel}`}
            </span>
            {j.postedAt && <span className="text-xs text-gray-400">{timeAgo(j.postedAt)}</span>}
          </div>
          <h3 className="mt-1.5 text-base md:text-lg font-bold text-gray-900 dark:text-white leading-snug">{j.title}</h3>
          {j.titleBn && j.titleBn !== j.title && <p className="text-sm text-gray-500 dark:text-gray-400">{j.titleBn}</p>}
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 flex flex-wrap gap-x-4 gap-y-1">
            {j.company && <span className="inline-flex items-center gap-1 font-medium min-w-0"><Building2 size={14} className="shrink-0" /> <span className="truncate">{j.company}</span></span>}
            {j.location && <span className="inline-flex items-center gap-1"><MapPin size={14} /> {j.location}</span>}
            {j.salary && <span className="inline-flex items-center gap-1"><Wallet size={14} /> {j.salary}</span>}
            {j.deadline && (
              <span className={`inline-flex items-center gap-1 ${soon ? "text-rose-600 dark:text-rose-400 font-semibold" : ""}`}>
                <CalendarClock size={14} /> {daysLeft <= 0 ? "Closes today" : soon ? `${daysLeft} day${daysLeft > 1 ? "s" : ""} left` : `Apply by ${fmtDate(j.deadline)}`}
              </span>
            )}
          </p>
          {j.tags?.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{j.tags.map((t) => <span key={t} className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">{t}</span>)}</div>}
          {(j.description || j.summary) && (
            <>
              <p className={`mt-2.5 text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line ${expanded ? "" : "line-clamp-2"}`}>{j.description || j.summary}</p>
              {(j.description || "").length > 160 && <button onClick={onToggle} className="mt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-0.5">{expanded ? "Show less" : "Read more"} <ChevronDown size={13} className={expanded ? "rotate-180" : ""} /></button>}
            </>
          )}
          <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
            <ApplyButtons j={j} />
          </div>
        </div>
        <div className="hidden sm:flex flex-col gap-2 shrink-0 items-stretch">
          <ApplyButtons j={j} />
        </div>
      </div>
    </li>
  );
}

function ApplyButtons({ j }) {
  return (
    <>
      <a href={j.url} target="_blank" rel="noopener noreferrer nofollow" className="h-9 px-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold">
        {j.club ? "Apply" : "View & apply"} <ArrowUpRight size={15} />
      </a>
      {j.applyUrl && (
        <a href={j.applyUrl} target="_blank" rel="noopener noreferrer nofollow" className="h-9 px-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-indigo-300">
          Application site <ArrowUpRight size={14} />
        </a>
      )}
    </>
  );
}

export default function JobsPage() {
  const { userData } = useUser();
  const router = useRouter();
  const [club, setClub] = useState([]);
  const [ext, setExt] = useState({ jobs: [], sources: [] });
  const [loadingClub, setLoadingClub] = useState(true);
  const [loadingExt, setLoadingExt] = useState(true);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [type, setType] = useState("Any type");
  const [loc, setLoc] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [deadline, setDeadline] = useState("any");
  const [source, setSource] = useState("all");
  const [techOnly, setTechOnly] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const [expanded, setExpanded] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userApi().get("/api/v1/jobs").then(({ data }) => data.success && setClub(data.jobs.map(fromClubPost))).catch(() => {}).finally(() => setLoadingClub(false));
    userApi().get("/api/v1/jobs/external").then(({ data }) => data.success && setExt(data)).catch(() => {}).finally(() => setLoadingExt(false));
  }, []);
  useEffect(() => { setLimit(PAGE); setSource("all"); }, [tab]);
  useEffect(() => { setLimit(PAGE); }, [q, type, loc, remoteOnly, deadline, source, techOnly]);

  const all = useMemo(() => [...club, ...ext.jobs], [club, ext.jobs]);
  // Non-technical government posts (cleaner, driver…) only appear in the Government tab with the filter off
  const clerical = (j) => !j.club && j.category === "govt" && !j.diplomaRelevant;
  const counts = useMemo(() => {
    const c = { all: 0, club: club.length, swe: 0, diploma: 0, govt: 0 };
    for (const j of all) {
      if (!clerical(j)) c.all++;
      if (c[j.category] != null && !(j.category === "govt" && techOnly && clerical(j))) c[j.category]++;
    }
    return c;
  }, [all, club, techOnly]);
  const tabSources = useMemo(() => {
    const seen = new Map();
    for (const s of ext.sources) if (tab === "all" || s.category === tab) seen.set(s.label, (seen.get(s.label) || 0) + s.count);
    return [...seen.entries()].map(([label, count]) => ({ label, count }));
  }, [ext.sources, tab]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const l = loc.trim().toLowerCase();
    const now = Date.now();
    return all.filter((j) => {
      if (tab === "club" ? !j.club : tab !== "all" && j.category !== tab) return false;
      if (clerical(j) && (tab === "all" || (tab === "govt" && techOnly))) return false;
      if (s && !`${j.title} ${j.titleBn || ""} ${j.company} ${(j.tags || []).join(" ")}`.toLowerCase().includes(s)) return false;
      if (type !== "Any type" && j.type !== type) return false;
      if (l && !(j.location || "").toLowerCase().includes(l)) return false;
      if (remoteOnly && !j.remote) return false;
      if (source !== "all" && (j.club ? "TPI CPC" : j.sourceLabel) !== source) return false;
      if (deadline !== "any") {
        if (!j.deadline) return false;
        const left = new Date(j.deadline).getTime() - now;
        if (deadline === "week" && left > 7 * 86400000) return false;
        if (deadline === "month" && left > 30 * 86400000) return false;
      }
      return true;
    }).sort((a, b) => (b.club ? 1 : 0) - (a.club ? 1 : 0) || (deadline !== "any" ? new Date(a.deadline) - new Date(b.deadline) : 0));
  }, [all, tab, q, type, loc, remoteOnly, deadline, source, techOnly]);

  const loading = tab === "club" ? loadingClub : loadingClub || (loadingExt && !ext.jobs.length);
  const activeFilters = [type !== "Any type", !!loc.trim(), remoteOnly, deadline !== "any", source !== "all"].filter(Boolean).length;
  const latest = ext.sources.reduce((m, s) => (s.fetchedAt && (!m || s.fetchedAt > m) ? s.fetchedAt : m), null);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userApi().post("/api/v1/jobs", { ...form, submitterName: userData?.fullName });
      toast.success(data.message);
      setOpen(false);
      setForm(emptyForm);
    } catch (err) { toast.error(err.response?.data?.message || "Submission failed"); }
    finally { setSaving(false); }
  };
  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });
  const select = "h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3 text-sm outline-none focus:border-indigo-400";

  return (
    <div>
      <ClubHero eyebrow="Careers" icon={<Briefcase size={14} />} title="Jobs & internships"
        subtitle="Software, diploma-engineering and government jobs, updated automatically from trusted public job boards, plus openings shared by alumni and members.">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none]">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} type="button" onClick={() => setTab(key)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition ${tab === key ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/30" : "bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-indigo-300"}`}>
                <Icon size={15} /> {label}
                <span className={`text-[11px] tabular-nums px-1.5 rounded-md ${tab === key ? "bg-white/20" : "bg-gray-100 dark:bg-white/10 text-gray-500"}`}>{loadingExt && key !== "club" ? "…" : counts[key]}</span>
              </button>
            ))}
          </div>
          <Button onClick={() => (userData ? setOpen(true) : router.push("/login?redirect=/jobs"))} className="rounded-xl shrink-0"><Plus size={16} className="mr-1" /> Share an opening</Button>
        </div>
      </ClubHero>

      <div className="px-4 md:px-10 container mx-auto py-6 md:py-8 max-w-6xl">
        {/* Filters */}
        <div className={`${panel} p-3 md:p-4`}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, company or skill…" aria-label="Search jobs"
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 text-sm outline-none focus:border-indigo-400" />
            </div>
            <button type="button" onClick={() => setShowFilters((v) => !v)} className="md:hidden h-10 px-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm inline-flex items-center gap-1.5">
              <SlidersHorizontal size={15} /> Filters{activeFilters ? ` (${activeFilters})` : ""}
            </button>
          </div>
          <div className={`${showFilters ? "grid" : "hidden"} md:grid grid-cols-2 md:grid-cols-5 gap-2 mt-2`}>
            <select value={type} onChange={(e) => setType(e.target.value)} className={select} aria-label="Job type">{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="Location (e.g. Dhaka)" aria-label="Location" className={`${select} w-full pl-8`} />
            </div>
            <select value={deadline} onChange={(e) => setDeadline(e.target.value)} className={select} aria-label="Deadline">{DEADLINES.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}</select>
            <select value={source} onChange={(e) => setSource(e.target.value)} className={select} aria-label="Source">
              <option value="all">All sources</option>
              {(tab === "all" || tab === "club") && club.length > 0 && <option value="TPI CPC">TPI CPC (club)</option>}
              {tab !== "club" && tabSources.map((s) => <option key={s.label} value={s.label}>{s.label} ({s.count})</option>)}
            </select>
            <label className="h-10 px-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm inline-flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} className="rounded" /> Remote only
            </label>
          </div>
          {tab === "govt" && (
            <label className="mt-3 inline-flex items-center gap-2 text-sm cursor-pointer select-none text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={techOnly} onChange={(e) => setTechOnly(e.target.checked)} className="rounded" />
              Only technical / diploma-level posts (sub-assistant engineer, technician, instructor, computer operator…)
            </label>
          )}
        </div>

        {tab !== "club" && (
          <div className="mt-4 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-500/[0.07] px-4 py-3 text-sm text-amber-900 dark:text-amber-200 flex gap-2.5">
            <Info size={16} className="shrink-0 mt-0.5" />
            <p>
              External listings are collected automatically from public job boards
              {tabSources.length > 0 && <> ({tabSources.map((s) => s.label).join(", ")})</>} and every card links to the original posting.
              TPI CPC isn&apos;t affiliated with these employers. Always confirm details on the original site, and never pay anyone to apply.
              {latest && <span className="text-amber-700/80 dark:text-amber-200/70"> Last updated {timeAgo(latest)}.</span>}
            </p>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between text-sm text-gray-500">
          <span>{loading ? "Loading listings…" : `${list.length} ${list.length === 1 ? "opening" : "openings"}`}</span>
          {(activeFilters > 0 || q) && <button onClick={() => { setQ(""); setType("Any type"); setLoc(""); setRemoteOnly(false); setDeadline("any"); setSource("all"); }} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Clear filters</button>}
        </div>

        <div className="mt-3">
          {loading ? <ListSkeleton count={5} /> : list.length === 0 ? (
            <EmptyState icon={<Briefcase size={20} />} title={tab === "club" ? "No club-shared openings right now" : "No openings match these filters"}>
              {tab === "club" ? "Share one you know about, or check the other tabs." : "Try clearing a filter or check back later; listings refresh every few hours."}
            </EmptyState>
          ) : (
            <>
              <ul className="space-y-3">
                {list.slice(0, limit).map((j) => <JobCard key={j.id} j={j} expanded={expanded === j.id} onToggle={() => setExpanded(expanded === j.id ? null : j.id)} />)}
              </ul>
              {list.length > limit && (
                <div className="mt-6 text-center">
                  <Button variant="outline" onClick={() => setLimit((n) => n + PAGE)} className="rounded-xl">Show more <span className="ml-1 text-gray-400">({list.length - limit} left)</span></Button>
                </div>
              )}
            </>
          )}
          {loadingExt && !loading && tab !== "club" && (
            <p className="mt-4 text-center text-xs text-gray-400 inline-flex items-center gap-1.5 w-full justify-center"><LoaderCircle size={13} className="animate-spin" /> Fetching the latest listings…</p>
          )}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Share an opening" description="It goes live after an admin approves it." wide>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Role title *</Label><Input required maxLength={100} {...f("title")} placeholder="Junior Backend Engineer" /></div>
            <div className="space-y-1.5"><Label>Company *</Label><Input required maxLength={80} {...f("company")} /></div>
            <div className="space-y-1.5"><Label>Type</Label>
              <select {...f("kind")} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{["Internship", "Full-time", "Part-time", "Contract", "Remote"].map((k) => <option key={k}>{k}</option>)}</select>
            </div>
            <div className="space-y-1.5"><Label>Board</Label>
              <select {...f("category")} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {Object.entries(CAT_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-1.5"><Label>Location</Label><Input maxLength={80} {...f("location")} placeholder="Dhaka / Remote" /></div>
            <div className="space-y-1.5"><Label>Salary / stipend</Label><Input maxLength={60} {...f("salary")} placeholder="Optional" /></div>
            <div className="space-y-1.5"><Label>Deadline</Label><Input type="date" {...f("deadline")} /></div>
          </div>
          <div className="space-y-1.5"><Label>Apply link *</Label><Input type="url" required {...f("applyUrl")} placeholder="https://…" /></div>
          <div className="space-y-1.5"><Label>Tags (comma separated)</Label><Input {...f("tags")} placeholder="Node.js, MongoDB, Fresher" /></div>
          <div className="space-y-1.5"><Label>Description</Label><Textarea rows={4} maxLength={2000} {...f("description")} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? <LoaderCircle size={16} className="animate-spin" /> : "Submit for review"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
