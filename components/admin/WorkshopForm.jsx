"use client";

import LessonsManager from "@/components/admin/LessonsManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api-client";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const levels = ["Beginner", "Intermediate", "Advanced"];
const statuses = [
  { value: "Draft", label: "Draft (hidden from public)" },
  { value: "ComingSoon", label: "Coming Soon (preview only)" },
  { value: "Published", label: "Published (live)" },
];

export default function WorkshopForm({ id }) {
  const router = useRouter();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    title: "", description: "", instructor: "", category: "General",
    level: "Beginner", playlistUrl: "", status: "Draft", featured: false, tags: "",
    releaseDate: "",
  });
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    adminApi().get(`/api/v1/workshop/id/${id}`).then(({ data }) => {
      if (data.success) {
        const w = data.workshop;
        setForm({
          title: w.title, description: w.description, instructor: w.instructor,
          category: w.category, level: w.level, playlistUrl: w.playlistUrl || "",
          status: w.status, featured: !!w.featured, tags: (w.tags || []).join(", "),
          releaseDate: w.releaseDate ? new Date(w.releaseDate).toISOString().slice(0, 10) : "",
        });
        setLessons(w.lessons || []);
        setPreview(w.thumbnail);
      }
    }).finally(() => setLoading(false));
  }, [id, isEdit]);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const validateLessons = () => {
    for (const [i, l] of lessons.entries()) {
      if (!l.title || !l.videoUrl) {
        toast.error(`Lesson ${i + 1}: title and YouTube URL are required`);
        return false;
      }
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && !file) return toast.error("Upload a thumbnail");
    // Skip lesson validation for ComingSoon (no lessons needed yet)
    if (form.status !== "ComingSoon" && !validateLessons()) return;

    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "tags") fd.append("tags", JSON.stringify(v.split(",").map((t) => t.trim()).filter(Boolean)));
      else fd.append(k, String(v ?? ""));
    });
    fd.append("lessons", JSON.stringify(lessons));
    if (file) fd.append("thumbnail", file);

    try {
      const url = isEdit ? `/api/v1/workshop/id/${id}` : `/api/v1/workshop`;
      const method = isEdit ? "put" : "post";
      const { data } = await adminApi()[method](url, fd);
      if (data.success) { toast.success(isEdit ? "Updated" : "Created"); router.push("/admin/workshops"); }
      else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin" /></div>;

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Course details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5"><Label>Title *</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Description *</Label><Textarea rows={4} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Instructor *</Label><Input required value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Web Dev, Python" /></div>
              <div className="space-y-1.5">
                <Label>Level</Label>
                <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{levels.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {form.status === "ComingSoon" && (
                <div className="space-y-1.5 md:col-span-2 rounded-lg border border-amber-300/40 bg-amber-500/5 p-3">
                  <Label className="text-amber-700 dark:text-amber-400">Expected release date (optional)</Label>
                  <Input
                    type="date"
                    value={form.releaseDate}
                    onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
                  />
                  <p className="text-xs text-amber-700 dark:text-amber-400/80">
                    Shown on the public Coming Soon card. Leave empty if you haven't picked a date yet.
                  </p>
                </div>
              )}
              <div className="space-y-1.5 md:col-span-2"><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="javascript, frontend" /></div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Full YouTube playlist URL (optional)</Label>
                <Input value={form.playlistUrl} onChange={(e) => setForm({ ...form, playlistUrl: e.target.value })} placeholder="https://www.youtube.com/playlist?list=..." />
                <p className="text-xs text-muted-foreground">Used as fallback if no lessons added — embeds entire playlist.</p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded" />
              Featured course
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Lessons</CardTitle></CardHeader>
          <CardContent>
            <LessonsManager lessons={lessons} onChange={setLessons} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Thumbnail</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {preview && <img src={preview} alt="preview" className="w-full aspect-video object-cover rounded border" />}
            <Input type="file" accept="image/*" onChange={onFile} />
            <p className="text-xs text-muted-foreground">{isEdit ? "Optional — leave empty to keep existing." : "Required."}</p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2 sticky top-20">
          <Button type="submit" disabled={saving}>{saving ? <LoaderCircle className="animate-spin" size={18} /> : isEdit ? "Save changes" : "Create course"}</Button>
          <Button type="button" variant="outline" onClick={() => router.push("/admin/workshops")}>Cancel</Button>
        </div>
      </div>
    </form>
  );
}
