"use client";

import PageHeader from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api-client";
import { ArrowLeft, ImageIcon, LoaderCircle, Save, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminEditProjectPage() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", demoUrl: "", githubUrl: "", tags: "" });
  const [cover, setCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [existingShots, setExistingShots] = useState([]);
  const [newShots, setNewShots] = useState([]);
  const [newShotPreviews, setNewShotPreviews] = useState([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await adminApi().get(`/api/v1/project/${id}`);
        if (data.success) {
          const p = data.project;
          setProject(p);
          setForm({
            title: p.title || "",
            description: p.description || "",
            demoUrl: p.demoUrl || "",
            githubUrl: p.githubUrl || "",
            tags: (p.tags || []).join(", "),
          });
          setCoverPreview(p.coverImage || null);
          setExistingShots(p.screenshots || []);
        } else {
          toast.error(data.message || "Project not found");
          router.push("/admin/projects");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load");
        router.push("/admin/projects");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const onCover = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) return toast.error("Cover image must be under 4 MB");
    setCover(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const totalShots = existingShots.length + newShots.length;

  const onAddShots = (e) => {
    const room = 6 - totalShots;
    if (room <= 0) return toast.error("Maximum 6 screenshots");
    const files = Array.from(e.target.files || []).slice(0, room);
    const valid = files.filter((f) => f.size <= 4 * 1024 * 1024);
    if (valid.length !== files.length) toast.error("Some images skipped (over 4 MB)");
    setNewShots((s) => [...s, ...valid]);
    setNewShotPreviews((s) => [...s, ...valid.map((f) => URL.createObjectURL(f))]);
  };

  const removeExistingShot = (i) => setExistingShots((s) => s.filter((_, idx) => idx !== i));
  const removeNewShot = (i) => {
    setNewShots((s) => s.filter((_, idx) => idx !== i));
    setNewShotPreviews((s) => s.filter((_, idx) => idx !== i));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    if (form.description.trim().length < 30) return toast.error("Description should be at least 30 characters");

    setSaving(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("demoUrl", form.demoUrl);
    fd.append("githubUrl", form.githubUrl);
    fd.append("tags", JSON.stringify(form.tags.split(",").map((t) => t.trim()).filter(Boolean)));
    if (cover) fd.append("coverImage", cover);
    existingShots.forEach((url) => fd.append("existingScreenshots", url));
    newShots.forEach((s) => fd.append("screenshots", s));

    try {
      const { data } = await adminApi().put(`/api/v1/project/${id}`, fd);
      if (data.success) {
        toast.success(data.message || "Project updated");
        router.push("/admin/projects");
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <LoaderCircle className="animate-spin" />
      </div>
    );

  if (!project) return null;

  return (
    <div>
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-3"
      >
        <ArrowLeft size={14} /> Back to projects
      </Link>

      <PageHeader
        title="Edit Project"
        description={`By ${project.owner?.fullName || "—"} · current status: ${project.status}`}
      />

      <Card className="max-w-3xl">
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Cover image *</Label>
              {coverPreview ? (
                <div className="relative">
                  <img src={coverPreview} alt="cover" className="w-full max-h-64 object-cover rounded-md border" />
                  <label className="absolute top-2 right-2 cursor-pointer bg-black/60 text-white px-3 py-1 rounded-md text-xs">
                    Replace
                    <input type="file" accept="image/*" onChange={onCover} className="hidden" />
                  </label>
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
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <Label>Description *</Label>
              <Textarea
                required
                rows={6}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <p className="text-xs text-gray-500">{form.description.length} characters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Live demo URL</Label>
                <Input type="url" value={form.demoUrl} onChange={(e) => setForm({ ...form, demoUrl: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>GitHub repo URL</Label>
                <Input type="url" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Tags (comma-separated)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Screenshots ({totalShots}/6)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {existingShots.map((url, i) => (
                  <div key={`old-${i}`} className="relative aspect-video rounded-md overflow-hidden border">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeExistingShot(i)} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {newShotPreviews.map((p, i) => (
                  <div key={`new-${i}`} className="relative aspect-video rounded-md overflow-hidden border-2 border-indigo-400">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 text-[10px] bg-indigo-500 text-white px-1.5 rounded">New</span>
                    <button type="button" onClick={() => removeNewShot(i)} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {totalShots < 6 && (
                  <label className="flex flex-col items-center justify-center gap-1 cursor-pointer rounded-md border-2 border-dashed border-gray-300 dark:border-white/10 aspect-video hover:border-indigo-500 transition">
                    <ImageIcon className="text-gray-400" size={20} />
                    <span className="text-xs text-gray-500">Add image</span>
                    <input type="file" accept="image/*" multiple onChange={onAddShots} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 flex-wrap">
              <Link href="/admin/projects">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={saving}>
                {saving ? <LoaderCircle className="animate-spin" size={16} /> : <><Save size={15} className="mr-1.5" /> Save changes</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
