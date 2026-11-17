"use client";

/* eslint-disable @next/next/no-img-element */
import ClubHero, { EmptyState, panel } from "@/components/club/ClubHero";
import Modal from "@/components/club/Modal";
import { CardGridSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import { userApi } from "@/lib/api-client";
import { getDefaultAvatar } from "@/lib/avatars";
import { Building2, GraduationCap, Linkedin, LoaderCircle, MapPin, Plus, Quote, Search, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const emptyForm = { name: "", company: "", position: "", location: "", batch: "", department: "", linkedin: "", quote: "", photo: "" };

export default function AlumniPage() {
  const { userData } = useUser();
  const router = useRouter();
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [batch, setBatch] = useState("All");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userApi().get("/api/v1/alumni").then(({ data }) => data.success && setAlumni(data.alumni)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const batches = useMemo(() => ["All", ...[...new Set(alumni.map((a) => a.batch).filter(Boolean))].sort().reverse()], [alumni]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return alumni.filter((a) => (batch === "All" || a.batch === batch) && (!s || [a.name, a.company, a.position, a.location].join(" ").toLowerCase().includes(s)));
  }, [alumni, q, batch]);
  const companies = useMemo(() => new Set(alumni.map((a) => a.company)).size, [alumni]);

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
      <ClubHero eyebrow="Community" icon={<GraduationCap size={14} />} title="Alumni network"
        subtitle="Club members who've gone on to build careers in tech. Reach out, ask for advice, and see where the path leads.">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, company, role…" className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-950 text-sm" />
          </div>
          <select value={batch} onChange={(e) => setBatch(e.target.value)} className="h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-950 px-3 text-sm">
            {batches.map((b) => <option key={b} value={b}>{b === "All" ? "All batches" : `Batch ${b}`}</option>)}
          </select>
          <Button onClick={openForm} className="h-11 rounded-xl"><Plus size={16} className="mr-1" /> Add an alumnus</Button>
        </div>
        {alumni.length > 0 && <p className="mt-3 text-xs text-gray-500">{alumni.length} alumni · {companies} companies</p>}
      </ClubHero>

      <div className="px-4 md:px-10 container mx-auto py-10">
        {loading ? <CardGridSkeleton count={6} /> : list.length === 0 ? (
          <EmptyState icon={<GraduationCap size={20} />} title="No alumni found">{alumni.length ? "Try a different search." : "Be the first to add one!"}</EmptyState>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((a) => (
              <div key={a._id} className={`${panel} p-5 flex flex-col relative`}>
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
                  <span className="truncate">{[a.batch && `Batch ${a.batch}`, a.department, a.location && <span key="l" className="inline-flex items-center gap-0.5"><MapPin size={11} />{a.location}</span>].filter(Boolean).reduce((acc, x, i) => (i ? [...acc, " · ", x] : [x]), [])}</span>
                  {a.linkedin && <a href={a.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600" aria-label="LinkedIn"><Linkedin size={16} /></a>}
                </div>
              </div>
            ))}
          </div>
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
