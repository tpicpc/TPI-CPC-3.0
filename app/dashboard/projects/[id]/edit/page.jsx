"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  ImageIcon,
  Info,
  LoaderCircle,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function EditProjectPage() {
  const router = useRouter();
  const { id } = useParams();
  const { userData, loading: userLoading } = useUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    demoUrl: "",
    githubUrl: "",
    tags: "",
  });

  // Cover
  const [cover, setCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // Screenshots: existing URLs we want to keep + new files we just selected
  const [existingShots, setExistingShots] = useState([]);
  const [newShots, setNewShots] = useState([]);
  const [newShotPreviews, setNewShotPreviews] = useState([]);

  useEffect(() => {
    if (!userLoading && !userData) router.push(`/login?redirect=/dashboard/projects/${id}/edit`);
  }, [userData, userLoading, router, id]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`/api/v1/project/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
          router.push("/dashboard/projects");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load project");
        router.push("/dashboard/projects");
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

  const removeExistingShot = (i) =>
    setExistingShots((s) => s.filter((_, idx) => idx !== i));

  const removeNewShot = (i) => {
    setNewShots((s) => s.filter((_, idx) => idx !== i));
    setNewShotPreviews((s) => s.filter((_, idx) => idx !== i));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    if (form.description.trim().length < 30)
      return toast.error("Description should be at least 30 characters");

    setSaving(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("demoUrl", form.demoUrl);
    fd.append("githubUrl", form.githubUrl);
    fd.append(
      "tags",
      JSON.stringify(form.tags.split(",").map((t) => t.trim()).filter(Boolean))
    );
    if (cover) fd.append("coverImage", cover);
    existingShots.forEach((url) => fd.append("existingScreenshots", url));
    newShots.forEach((s) => fd.append("screenshots", s));

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(`/api/v1/project/${id}`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success(data.message || "Project updated");
        router.push("/dashboard/projects");
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (userLoading || loading)
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <LoaderCircle className="animate-spin" />
      </div>
    );

  if (!project) return null;

  return (
    <div className="container mx-auto max-w-3xl">
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-4"
      >
        <ArrowLeft size={14} /> Back to my projects
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Edit Project
        </h1>
        <span
          className={`text-xs px-2.5 py-1 rounded-full ${
            project.status === "approved"
              ? "bg-green-500/15 text-green-700"
              : project.status === "rejected"
                ? "bg-red-500/15 text-red-700"
                : "bg-amber-500/15 text-amber-700"
          }`}
        >
          Current status: {project.status}
        </span>
      </div>

      {project.status === "approved" && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-4 py-3 mb-5 flex items-start gap-3">
          <AlertCircle className="text-amber-500 mt-0.5 shrink-0" size={18} />
          <div className="text-sm text-amber-700 dark:text-amber-300">
            <strong>Heads up:</strong> editing a published project sends it back to <strong>pending</strong> review.
            It will be hidden from <code>/projects</code> until an admin re-approves your changes.
          </div>
        </div>
      )}

      {project.status === "rejected" && project.rejectionReason && (
        <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 mb-5 flex items-start gap-3">
          <Info className="text-red-500 mt-0.5 shrink-0" size={18} />
          <div className="text-sm text-red-700 dark:text-red-300">
            <strong>Admin feedback:</strong> {project.rejectionReason}
          </div>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Cover image *</Label>
              {coverPreview ? (
                <div className="relative">
                  <img
                    src={coverPreview}
                    alt="cover"
                    className="w-full max-h-64 object-cover rounded-md border"
                  />
                  <label className="absolute top-2 right-2 cursor-pointer bg-black/60 text-white px-3 py-1 rounded-md text-xs">
                    Replace
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onCover}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 cursor-pointer rounded-md border-2 border-dashed border-gray-300 dark:border-white/10 py-10 hover:border-indigo-500 transition">
                  <ImageIcon className="text-gray-400" size={28} />
                  <span className="text-sm text-gray-500">Upload a cover image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onCover}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Project title *</Label>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
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
                <Input
                  type="url"
                  value={form.demoUrl}
                  onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
                  placeholder="https://your-project.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label>GitHub repo URL</Label>
                <Input
                  type="url"
                  value={form.githubUrl}
                  onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                  placeholder="https://github.com/you/repo"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Tags (comma-separated)</Label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="React, MongoDB, Tailwind"
              />
            </div>

            <div className="space-y-2">
              <Label>Screenshots ({totalShots}/6)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {existingShots.map((url, i) => (
                  <div
                    key={`old-${i}`}
                    className="relative aspect-video rounded-md overflow-hidden border"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingShot(i)}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {newShotPreviews.map((p, i) => (
                  <div
                    key={`new-${i}`}
                    className="relative aspect-video rounded-md overflow-hidden border-2 border-indigo-400"
                  >
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 text-[10px] bg-indigo-500 text-white px-1.5 rounded">
                      New
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNewShot(i)}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {totalShots < 6 && (
                  <label className="flex flex-col items-center justify-center gap-1 cursor-pointer rounded-md border-2 border-dashed border-gray-300 dark:border-white/10 aspect-video hover:border-indigo-500 transition">
                    <ImageIcon className="text-gray-400" size={20} />
                    <span className="text-xs text-gray-500">Add image</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={onAddShots}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 flex-wrap">
              <Link href="/dashboard/projects">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white"
              >
                {saving ? (
                  <LoaderCircle className="animate-spin" size={16} />
                ) : (
                  <>
                    <Save size={15} className="mr-1.5" /> Save changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
