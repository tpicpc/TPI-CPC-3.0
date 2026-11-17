"use client";

/* eslint-disable @next/next/no-img-element */
import ClubHero, { EmptyState, panel } from "@/components/club/ClubHero";
import Modal from "@/components/club/Modal";
import { TeamGridSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import { userApi } from "@/lib/api-client";
import { getDefaultAvatar } from "@/lib/avatars";
import { Briefcase, Building2, Crown, Facebook, Github, GraduationCap, Linkedin, LoaderCircle, MapPin, Plus, Quote, Search, Star, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const emptyForm = { name: "", company: "", position: "", location: "", batch: "", department: "", linkedin: "", quote: "", photo: "" };

const VIEWS = [
  { key: "everyone", label: "Everyone" },
  { key: "committees", label: "Committees" },
  { key: "careers", label: "Career network" },
];
const LEADER_RE = /president|general secretary/i;

function CommitteeMember({ m }) {
  const leader = LEADER_RE.test(m.position || "") && !/assistant/i.test(m.position || "");
  return (
    <div className={`${panel} group p-4 flex flex-col items-center text-center hover:-translate-y-0.5 hover:shadow-lg transition`}>
      <div className={`relative w-20 h-20 rounded-full p-[3px] ${leader ? "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500" : "bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-500"}`}>
        <img src={m.memberProfile || getDefaultAvatar(m.gender)} alt={m.name} loading="lazy" className="w-full h-full rounded-full object-cover bg-white dark:bg-gray-900 ring-2 ring-white dark:ring-gray-950" />
        {leader && <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center shadow ring-2 ring-white dark:ring-gray-950"><Crown size={12} /></span>}
      </div>
      <h4 className="mt-3 font-bold text-sm text-gray-900 dark:text-white leading-tight line-clamp-2">{m.name}</h4>
      <p className="mt-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 line-clamp-1">{m.position}</p>
      {(m.session || m.department) && <p className="mt-0.5 text-[11px] text-gray-400 line-clamp-1">{[m.department, m.session && `Session ${m.session}`].filter(Boolean).join(" · ")}</p>}
      {m.nowAt && <p className="mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1 max-w-full"><Briefcase size={10} className="shrink-0" /> <span className="truncate">Now at {m.nowAt.company}</span></p>}
      {(m.facebook || m.linkedin || m.github) && (
        <div className="mt-2 flex gap-2 text-gray-400">
          {m.facebook && <a href={m.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-blue-600"><Facebook size={14} /></a>}
          {m.linkedin && <a href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-blue-600"><Linkedin size={14} /></a>}
          {m.github && <a href={m.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-gray-900 dark:hover:text-white"><Github size={14} /></a>}
        </div>
      )}
    </div>
  );
}

function AlumniCard({ a }) {
  return (
    <div className={`${panel} p-5 flex flex-col relative`}>
      {a.featured && <Star size={15} className="absolute top-4 right-4 text-amber-500 fill-amber-500" aria-label="Featured" />}
      <div className="flex items-center gap-4">
        <img src={a.photo || getDefaultAvatar()} alt={a.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/20" />
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white truncate">{a.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{a.position}</p>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 truncate inline-flex items-center gap-1"><Building2 size={13} /> {a.company}</p>
        </div>
      </div>
      {a.quote && <p className="mt-4 text-sm italic text-gray-600 dark:text-gray-300 flex gap-2 flex-1"><Quote size={14} className="shrink-0 text-indigo-400 mt-0.5" />{a.quote}</p>}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs text-gray-500">
        <span className="truncate">{[a.department, a.location && <span key="l" className="inline-flex items-center gap-0.5"><MapPin size={11} />{a.location}</span>].filter(Boolean).reduce((acc, x, i) => (i ? [...acc, " · ", x] : [x]), [])}</span>
        {a.linkedin && <a href={a.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600" aria-label="LinkedIn"><Linkedin size={16} /></a>}
      </div>
    </div>
  );
}

function GroupHeader({ title, badge, sub, count }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-4 pb-2 border-b border-gray-200/70 dark:border-white/10">
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">{title}</h3>
        {badge}
        {sub && <span className="text-sm text-gray-500">{sub}</span>}
      </div>
      <span className="text-xs text-gray-400 shrink-0">{count} {count === 1 ? "person" : "people"}</span>
    </div>
  );
}

export default function AlumniPage() {
  const { userData } = useUser();
  const router = useRouter();
  const [alumni, setAlumni] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("everyone");
  const [q, setQ] = useState("");
  const [year, setYear] = useState("All");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userApi().get("/api/v1/alumni").then(({ data }) => {
      if (!data.success) return;
      setAlumni(data.alumni || []);
      setCommittees(data.committees || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const s = q.trim().toLowerCase();
  const match = (fields) => !s || fields.filter(Boolean).join(" ").toLowerCase().includes(s);
  const yearOptions = useMemo(() => {
    const ys = new Set(committees.map((c) => String(c.year)));
    for (const a of alumni) if (a.batch) ys.add(a.batch);
    return ["All", ...[...ys].sort().reverse()];
  }, [committees, alumni]);

  const committeeGroups = useMemo(() => committees
    .filter((c) => year === "All" || String(c.year) === year)
    .map((c) => ({ ...c, members: c.members.filter((m) => match([m.name, m.position, m.department, m.session, m.nowAt?.company])) }))
    .filter((c) => c.members.length), [committees, year, s]); // eslint-disable-line react-hooks/exhaustive-deps

  const alumniGroups = useMemo(() => {
    const list = alumni.filter((a) => (year === "All" || a.batch === year) && match([a.name, a.company, a.position, a.location, a.batch, a.department]));
    const groups = new Map();
    for (const a of list) {
      const k = a.batch || "Other";
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(a);
    }
    return [...groups.entries()].sort((x, y) => (x[0] === "Other" ? 1 : y[0] === "Other" ? -1 : y[0].localeCompare(x[0]))).map(([batch, items]) => ({ batch, items }));
  }, [alumni, year, s]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalMembers = committees.reduce((n, c) => n + c.members.length, 0);
  const companies = useMemo(() => new Set(alumni.map((a) => a.company)).size, [alumni]);
  const showCommittees = view !== "careers";
  const showCareers = view !== "committees";
  const nothing = !loading && (!showCommittees || !committeeGroups.length) && (!showCareers || !alumniGroups.length);

  const openForm = () => {
    if (!userData) return router.push("/login?redirect=/alumni");
    setForm({ ...emptyForm, name: userData.fullName || "", department: userData.department || "" });
    setOpen(true);
  };
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userApi().post("/api/v1/alumni", form);
      toast.success(data.message);
      setOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || "Submission failed"); }
    finally { setSaving(false); }
  };
  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div>
      <ClubHero eyebrow="Community" icon={<GraduationCap size={14} />} title="Alumni & committees"
        subtitle="Everyone who has led TPI CPC, from the current executive committee back to the founding teams, plus former members now building careers in tech.">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/5 self-start">
            {VIEWS.map((v) => (
              <button key={v.key} type="button" onClick={() => setView(v.key)} className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${view === v.key ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}>{v.label}</button>
            ))}
          </div>
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, role, company…" aria-label="Search people" className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-950 text-sm" />
          </div>
          <select value={year} onChange={(e) => setYear(e.target.value)} aria-label="Year or session" className="h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-950 px-3 text-sm">
            {yearOptions.map((b) => <option key={b} value={b}>{b === "All" ? "All years & sessions" : b}</option>)}
          </select>
          <Button onClick={openForm} className="h-11 rounded-xl"><Plus size={16} className="mr-1" /> Add an alumnus</Button>
        </div>
        {!loading && (
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 dark:text-gray-300">
            <span><b className="text-gray-900 dark:text-white">{totalMembers}</b> committee members</span>
            <span><b className="text-gray-900 dark:text-white">{committees.length}</b> committees</span>
            <span><b className="text-gray-900 dark:text-white">{alumni.length}</b> alumni profiles · {companies} companies</span>
          </div>
        )}
      </ClubHero>

      <div className="px-4 md:px-10 container mx-auto py-10 space-y-14">
        {loading ? (
          <TeamGridSkeleton count={10} />
        ) : nothing ? (
          <EmptyState icon={<Users size={20} />} title="No one matches">{q || year !== "All" ? "Try a different search or year." : "Be the first to add an alumni profile!"}</EmptyState>
        ) : (
          <>
            {showCommittees && committeeGroups.length > 0 && (
              <section className="space-y-10">
                {view === "everyone" && <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1.5"><Users size={14} /> Executive committees</p>}
                {committeeGroups.map((c) => (
                  <div key={c.year}>
                    <GroupHeader
                      title={`Committee ${c.year}`}
                      badge={c.current ? <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">Current</span> : <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-500">Former</span>}
                      sub={c.session ? `Session ${c.session}` : ""}
                      count={c.members.length}
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                      {c.members.map((m) => <CommitteeMember key={m._id} m={m} />)}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {showCareers && (
              <section className="space-y-10">
                {view === "everyone" && <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1.5"><Briefcase size={14} /> Where our alumni work</p>}
                {alumniGroups.length === 0 ? (
                  view === "careers" && <EmptyState icon={<GraduationCap size={20} />} title="No alumni profiles yet">Know where a senior works now? Add them!</EmptyState>
                ) : alumniGroups.map((g) => (
                  <div key={g.batch}>
                    <GroupHeader title={g.batch === "Other" ? "Other batches" : `Batch ${g.batch}`} count={g.items.length} />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {g.items.map((a) => <AlumniCard key={a._id} a={a} />)}
                    </div>
                  </div>
                ))}
                {view === "everyone" && (
                  <div className={`${panel} p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Are you a former member?</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Add where you work now so juniors can reach out. An admin reviews every submission.</p>
                    </div>
                    <Button onClick={openForm} variant="outline" className="rounded-xl shrink-0"><Plus size={16} className="mr-1" /> Add an alumnus</Button>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add to the alumni directory" description="Submissions are reviewed by an admin before they appear.">
        <form onSubmit={submit} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Full name *</Label><Input required maxLength={80} {...f("name")} /></div>
            <div className="space-y-1.5"><Label>Company *</Label><Input required maxLength={80} {...f("company")} placeholder="e.g. Brain Station 23" /></div>
            <div className="space-y-1.5"><Label>Position</Label><Input maxLength={80} {...f("position")} placeholder="Software Engineer" /></div>
            <div className="space-y-1.5"><Label>Location</Label><Input maxLength={80} {...f("location")} placeholder="Dhaka" /></div>
            <div className="space-y-1.5"><Label>Batch / session</Label><Input maxLength={20} {...f("batch")} placeholder="2019-20" /></div>
            <div className="space-y-1.5"><Label>Department</Label><Input maxLength={60} {...f("department")} /></div>
          </div>
          <div className="space-y-1.5"><Label>LinkedIn URL</Label><Input type="url" {...f("linkedin")} placeholder="https://linkedin.com/in/…" /></div>
          <div className="space-y-1.5"><Label>Photo URL</Label><Input type="url" {...f("photo")} placeholder="https://…" /></div>
          <div className="space-y-1.5"><Label>Advice for juniors</Label><Textarea rows={3} maxLength={280} {...f("quote")} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? <LoaderCircle size={16} className="animate-spin" /> : "Submit for review"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
