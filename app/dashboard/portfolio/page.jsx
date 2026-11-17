"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { userApi } from "@/lib/api-client";
import { cfRankColor, PLATFORMS } from "@/lib/club-format";
import { ExternalLink, IdCard, LoaderCircle, RefreshCw, Save, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const empty = {
  headline: "", bio: "", skills: [], github: "", linkedin: "", facebook: "", website: "",
  handles: { codeforces: "", codechef: "", atcoder: "" }, emailNotifications: true,
};

export default function PortfolioEditPage() {
  const [form, setForm] = useState(empty);
  const [stats, setStats] = useState({});
  const [username, setUsername] = useState("");
  const [id, setId] = useState("");
  const [skill, setSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    userApi().get("/api/v1/me/portfolio").then(({ data }) => {
      if (!data.success) return;
      const p = data.portfolio;
      setUsername(p.username || "");
      setId(p._id);
      setForm({ ...empty, ...p, skills: p.skills || [], handles: { ...empty.handles, ...(p.handles || {}) }, emailNotifications: p.emailNotifications !== false });
      setStats(data.stats || {});
    }).catch(() => toast.error("Couldn't load your profile")).finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setHandle = (p) => (e) => setForm((f) => ({ ...f, handles: { ...f.handles, [p]: e.target.value.trim() } }));
  const addSkill = () => {
    const s = skill.trim().replace(/,$/, "");
    if (!s || form.skills.includes(s) || form.skills.length >= 20) return setSkill("");
    setForm((f) => ({ ...f, skills: [...f.skills, s] }));
    setSkill("");
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { headline, bio, skills, github, linkedin, facebook, website, handles, emailNotifications } = form;
      const { data } = await userApi().put("/api/v1/me/portfolio", { headline, bio, skills, github, linkedin, facebook, website, handles, emailNotifications });
      if (!data.success) throw new Error(data.message);
      setStats(data.stats || {});
      setForm((f) => ({ ...f, ...data.portfolio, handles: { ...empty.handles, ...(data.portfolio.handles || {}) } }));
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      const { data } = await userApi().post("/api/v1/me/portfolio/refresh");
      setStats(data.stats || {});
      toast.success("Ratings refreshed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><LoaderCircle className="animate-spin text-indigo-500" /></div>;
  const publicUrl = `/members/${username || id}`;

  return (
    <form onSubmit={save} className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2"><IdCard className="text-indigo-500" /> Public profile</h1>
          <p className="text-sm text-muted-foreground mt-1">This is your shareable portfolio. Name, photo and department come from <Link href="/dashboard/profile" className="text-indigo-500 hover:underline">Profile</Link>.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" asChild><Link href={publicUrl} target="_blank"><ExternalLink size={15} className="mr-1.5" /> View</Link></Button>
          <Button type="submit" disabled={saving}>{saving ? <LoaderCircle className="animate-spin" size={16} /> : <><Save size={15} className="mr-1.5" /> Save</>}</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">About you</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Headline</Label>
            <Input maxLength={120} value={form.headline} onChange={set("headline")} placeholder="Competitive programmer · MERN developer" />
          </div>
          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea rows={4} maxLength={600} value={form.bio} onChange={set("bio")} placeholder="A few lines about what you build, learn and enjoy." />
            <p className="text-xs text-muted-foreground text-right">{form.bio.length}/600</p>
          </div>
          <div className="space-y-1.5">
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-1.5 rounded-md border border-input bg-background p-2 min-h-10">
              {form.skills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-2 py-1 text-xs font-medium">
                  {s}
                  <button type="button" onClick={() => setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) }))} aria-label={`Remove ${s}`}><X size={12} /></button>
                </span>
              ))}
              <input
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(); } }}
                onBlur={addSkill}
                placeholder={form.skills.length ? "" : "C++, Graphs, React… (press Enter)"}
                className="flex-1 min-w-[140px] bg-transparent text-sm outline-none px-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Competitive programming handles</CardTitle>
              <CardDescription>Ratings and solved counts are fetched automatically and cached for a few hours.</CardDescription>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={refresh} disabled={refreshing}>
              <RefreshCw size={14} className={`mr-1.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          {["codeforces", "codechef", "atcoder"].map((p) => {
            const s = stats[p];
            return (
              <div key={p} className="space-y-1.5">
                <Label>{PLATFORMS[p].label}</Label>
                <Input value={form.handles[p]} onChange={setHandle(p)} placeholder={`${PLATFORMS[p].label} handle`} maxLength={40} />
                <p className="text-xs min-h-4">
                  {!form.handles[p] ? <span className="text-muted-foreground">Not linked</span>
                    : !s ? <span className="text-muted-foreground">Save to fetch stats</span>
                    : s.ok === false && !s.rating ? <span className="text-red-500">{s.error || "Handle not found"}</span>
                    : <span className="text-muted-foreground">Rating <b className={p === "codeforces" ? cfRankColor(s.rating) : "text-foreground"}>{s.rating ?? "—"}</b> · max {s.maxRating ?? "—"}{s.solved != null ? ` · ${s.solved} solved` : ""}</span>}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Links</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>GitHub</Label><Input value={form.github} onChange={set("github")} placeholder="github.com/username or username" /></div>
          <div className="space-y-1.5"><Label>LinkedIn</Label><Input value={form.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/username" /></div>
          <div className="space-y-1.5"><Label>Facebook</Label><Input value={form.facebook} onChange={set("facebook")} placeholder="facebook.com/username" /></div>
          <div className="space-y-1.5"><Label>Website / portfolio</Label><Input value={form.website} onChange={set("website")} placeholder="https://…" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <label className="flex items-start gap-3 text-sm cursor-pointer">
            <input type="checkbox" className="mt-1 rounded" checked={form.emailNotifications} onChange={(e) => setForm((f) => ({ ...f, emailNotifications: e.target.checked }))} />
            <span><span className="font-medium">Email me club announcements</span><br /><span className="text-muted-foreground">You&apos;ll still see them in the notification bell.</span></span>
          </label>
        </CardContent>
      </Card>
    </form>
  );
}
