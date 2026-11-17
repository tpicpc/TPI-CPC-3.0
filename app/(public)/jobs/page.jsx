"use client";

import ClubHero, { Chip, EmptyState, panel } from "@/components/club/ClubHero";
import Modal from "@/components/club/Modal";
import { ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import { userApi } from "@/lib/api-client";
import { fmtDate, timeAgo } from "@/lib/club-format";
import { ArrowUpRight, Briefcase, Building2, CalendarClock, ChevronDown, LoaderCircle, MapPin, Plus, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const KINDS = ["All", "Internship", "Full-time", "Part-time", "Contract", "Remote"];
const KIND_STYLE = {
  Internship: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "Full-time": "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  "Part-time": "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  Contract: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  Remote: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
};
const emptyForm = { title: "", company: "", kind: "Internship", location: "", description: "", applyUrl: "", salary: "", deadline: "", tags: "" };

export default function JobsPage() {
  const { userData } = useUser();
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userApi().get("/api/v1/jobs").then(({ data }) => data.success && setJobs(data.jobs)).catch(() => {}).finally(() => setLoading(false));
  }, []);
  const list = useMemo(() => jobs.filter((j) => kind === "All" || j.kind === kind), [jobs, kind]);

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

  return (
    <div>
      <ClubHero eyebrow="Community" icon={<Briefcase size={14} />} title="Jobs & internships"
        subtitle="Openings shared by alumni, partners and members. Spotted a good one? Share it with the club.">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex flex-wrap gap-2">{KINDS.map((k) => <Chip key={k} active={kind === k} onClick={() => setKind(k)}>{k}</Chip>)}</div>
          <Button onClick={() => (userData ? setOpen(true) : router.push("/login?redirect=/jobs"))} className="rounded-xl"><Plus size={16} className="mr-1" /> Share an opening</Button>
        </div>
      </ClubHero>
      <div className="px-4 md:px-10 container mx-auto py-8 max-w-5xl">
        {loading ? <ListSkeleton count={5} /> : list.length === 0 ? (
          <EmptyState icon={<Briefcase size={20} />} title="No open positions right now">Check back soon, or share one you know about.</EmptyState>
        ) : (
          <ul className="space-y-3">
            {list.map((j) => {
              const isOpen = expanded === j._id;
              const soon = j.deadline && new Date(j.deadline) - Date.now() < 7 * 86400000;
              return (
                <li key={j._id} className={`${panel} p-5`}>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-extrabold text-lg flex items-center justify-center shrink-0">{j.company.slice(0, 1).toUpperCase()}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${KIND_STYLE[j.kind]}`}>{j.kind}</span>
                        <span className="text-xs text-gray-500">{timeAgo(j.createdAt)}</span>
                      </div>
                      <h3 className="mt-1.5 text-lg font-bold text-gray-900 dark:text-white">{j.title}</h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 flex flex-wrap gap-x-4 gap-y-1">
                        <span className="inline-flex items-center gap-1 font-medium"><Building2 size={14} /> {j.company}</span>
                        {j.location && <span className="inline-flex items-center gap-1"><MapPin size={14} /> {j.location}</span>}
                        {j.salary && <span className="inline-flex items-center gap-1"><Wallet size={14} /> {j.salary}</span>}
                        {j.deadline && <span className={`inline-flex items-center gap-1 ${soon ? "text-rose-600 dark:text-rose-400 font-medium" : ""}`}><CalendarClock size={14} /> Apply by {fmtDate(j.deadline)}</span>}
                      </p>
                      {j.tags?.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{j.tags.map((t) => <span key={t} className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">{t}</span>)}</div>}
                      {j.description && (
                        <>
                          <p className={`mt-3 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line ${isOpen ? "" : "line-clamp-2"}`}>{j.description}</p>
                          {j.description.length > 160 && <button onClick={() => setExpanded(isOpen ? null : j._id)} className="mt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-0.5">{isOpen ? "Show less" : "Read more"} <ChevronDown size={13} className={isOpen ? "rotate-180" : ""} /></button>}
                        </>
                      )}
                    </div>
                    <a href={j.applyUrl} target="_blank" rel="noopener noreferrer" className="h-10 px-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold shrink-0">Apply <ArrowUpRight size={15} /></a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Share an opening" description="It goes live after an admin approves it." wide>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Role title *</Label><Input required maxLength={100} {...f("title")} placeholder="Junior Backend Engineer" /></div>
            <div className="space-y-1.5"><Label>Company *</Label><Input required maxLength={80} {...f("company")} /></div>
            <div className="space-y-1.5"><Label>Type</Label>
              <select {...f("kind")} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{KINDS.slice(1).map((k) => <option key={k}>{k}</option>)}</select>
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
