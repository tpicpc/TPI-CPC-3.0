"use client";

import SectionTitle from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import { ImageIcon, LoaderCircle, Send, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SubmitProjectPage() {
  const router = useRouter();
  const { userData, loading } = useUser();
  const [form, setForm] = useState({ title: "", description: "", demoUrl: "", githubUrl: "", tags: "" });
  const [cover, setCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [shots, setShots] = useState([]);
  const [shotPreviews, setShotPreviews] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !userData) router.push("/login?redirect=/submit-project");
    if (userData && userData.emailVerified === false) router.push("/verify-email?redirect=/submit-project");
  }, [userData, loading, router]);

  const onCover = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) return toast.error("Cover image must be under 4 MB");
    setCover(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const onShots = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 6 - shots.length);
    const valid = files.filter((f) => f.size <= 4 * 1024 * 1024);
    if (valid.length !== files.length) toast.error("Some images skipped (over 4 MB)");
    setShots((s) => [...s, ...valid]);
    setShotPreviews((s) => [...s, ...valid.map((f) => URL.createObjectURL(f))]);
  };

  const removeShot = (i) => {
    setShots((s) => s.filter((_, idx) => idx !== i));
    setShotPreviews((s) => s.filter((_, idx) => idx !== i));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    if (form.description.trim().length < 30) return toast.error("Description should be at least 30 characters");
    if (!cover) return toast.error("Cover image required");

    setSaving(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("demoUrl", form.demoUrl);
    fd.append("githubUrl", form.githubUrl);
    fd.append("tags", JSON.stringify(form.tags.split(",").map((t) => t.trim()).filter(Boolean)));
    fd.append("coverImage", cover);
    shots.forEach((s) => fd.append("screenshots", s));

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post("/api/v1/project/submit", fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success(data.message || "Submitted for review");
        router.push("/profile");
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !userData) return <div className="min-h-[40vh] flex items-center justify-center"><LoaderCircle className="animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 md:px-10 py-12 max-w-3xl">
      <SectionTitle
        title="Submit Your Project"
        subtitle="Show off what you've built — admins approve submissions before they go live in the public showcase."
      />

      <div className="rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-4 py-3 mb-6 flex items-start gap-3">
        <ShieldCheck className="text-indigo-500 mt-0.5 shrink-0" size={18} />
        <div className="text-sm text-indigo-700 dark:text-indigo-300">
          <strong>Tips:</strong> include a clean cover image, a few screenshots, a demo URL, and a GitHub link.
          The clearer the description, the faster you'll get approved.
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Cover image *</Label>
              {coverPreview ? (
                <div className="relative">
                  <img src={coverPreview} alt="cover" className="w-full max-h-64 object-cover rounded-md border" />
                  <button type="button" onClick={() => { setCover(null); setCoverPreview(null); }} className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1 rounded-md text-xs">Replace</button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 cursor-pointer rounded-md border-2 border-dashed border-gray-300 dark:border-white/10 py-10 hover:border-indigo-500 transition">
                  <ImageIcon className="text-gray-400" size={28} />
                  <span className="text-sm text-gray-500">Upload a cover image</span>
                  <input type="file" accept="image/*" onChange={onCover} className="hidden" />
                </label>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Project title *</Label>
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="My Awesome App" />
            </div>

            <div className="space-y-1.5">
              <Label>Description *</Label>
              <Textarea required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does it do? What tech did you use? What did you learn?" />
              <p className="text-xs text-gray-500">{form.description.length} characters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Live demo URL</Label>
                <Input type="url" value={form.demoUrl} onChange={(e) => setForm({ ...form, demoUrl: e.target.value })} placeholder="https://your-project.com" />
              </div>
              <div className="space-y-1.5">
                <Label>GitHub repo URL</Label>
                <Input type="url" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/you/repo" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Tags (comma-separated)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="React, MongoDB, Tailwind" />
            </div>

            <div className="space-y-2">
              <Label>Screenshots (up to 6)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {shotPreviews.map((p, i) => (
                  <div key={i} className="relative aspect-video rounded-md overflow-hidden border">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeShot(i)} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {shots.length < 6 && (
                  <label className="flex flex-col items-center justify-center gap-1 cursor-pointer rounded-md border-2 border-dashed border-gray-300 dark:border-white/10 aspect-video hover:border-indigo-500 transition">
                    <ImageIcon className="text-gray-400" size={20} />
                    <span className="text-xs text-gray-500">Add image</span>
                    <input type="file" accept="image/*" multiple onChange={onShots} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
              <p className="text-xs text-muted-foreground">Submitting as <strong className="text-gray-900 dark:text-white">{userData.fullName}</strong></p>
              <div className="flex gap-2">
                <Link href="/projects"><Button type="button" variant="outline">Cancel</Button></Link>
                <Button type="submit" disabled={saving} className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white">
                  {saving ? <LoaderCircle className="animate-spin" size={16} /> : <><Send size={15} className="mr-1.5" /> Submit project</>}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
