"use client";

import RichTextEditor from "@/components/admin/RichTextEditor";
import SectionTitle from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import { ImageIcon, LoaderCircle, Send, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SubmitBlogPage() {
  const router = useRouter();
  const { userData, loading } = useUser();
  const [form, setForm] = useState({ title: "", description: "", tags: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !userData) router.push("/login?redirect=/submit-blog");
    if (userData && userData.emailVerified === false) {
      router.push("/verify-email?redirect=/submit-blog");
    }
  }, [userData, loading, router]);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) return toast.error("Image must be under 4 MB");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    if (!file) return toast.error("Please add a cover image");
    const text = form.description.replace(/<[^>]+>/g, "").trim();
    if (text.length < 100) return toast.error("Content is too short — please write at least 100 characters");

    setSaving(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("tags", JSON.stringify(form.tags.split(",").map((t) => t.trim()).filter(Boolean)));
    fd.append("image", file);

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post("/api/v1/blog/submit", fd, {
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

  if (loading || !userData) {
    return <div className="min-h-[40vh] flex items-center justify-center"><LoaderCircle className="animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto px-4 md:px-10 py-12 max-w-3xl">
      <SectionTitle
        title="Write a Blog Post"
        subtitle="Share what you've learned with the TPI CPC community. Posts are reviewed by an admin before going live."
      />

      <div className="rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-4 py-3 mb-6 flex items-start gap-3">
        <ShieldCheck className="text-indigo-500 mt-0.5 shrink-0" size={18} />
        <div className="text-sm text-indigo-700 dark:text-indigo-300">
          <strong>Submission guidelines:</strong> original content only, minimum 100 characters,
          one cover image, no spam or promotional content. Your post will appear publicly once an admin approves it.
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Cover image *</Label>
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="preview" className="w-full max-h-72 object-cover rounded-md border" />
                  <button type="button" onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1 rounded-md text-xs">
                    Replace
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 cursor-pointer rounded-md border-2 border-dashed border-gray-300 dark:border-white/10 py-10 hover:border-indigo-500 transition">
                  <ImageIcon className="text-gray-400" size={28} />
                  <span className="text-sm text-gray-500">Click to upload a cover image</span>
                  <span className="text-xs text-gray-400">JPG, PNG up to 4 MB</span>
                  <input type="file" accept="image/*" onChange={onFile} className="hidden" />
                </label>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="A clear, descriptive title"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Tags (optional, comma-separated)</Label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="JavaScript, Web Development, Tutorial"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Content *</Label>
              <RichTextEditor
                value={form.description}
                onChange={(v) => setForm({ ...form, description: v })}
                placeholder="Write your blog post here..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 100 characters · {form.description.replace(/<[^>]+>/g, "").trim().length} so far
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
              <p className="text-xs text-muted-foreground">
                Submitting as <strong className="text-gray-900 dark:text-white">{userData.fullName}</strong>
              </p>
              <div className="flex gap-2">
                <Link href="/profile"><Button type="button" variant="outline">Cancel</Button></Link>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white"
                >
                  {saving ? <LoaderCircle className="animate-spin" size={16} /> : <><Send size={15} className="mr-1.5" /> Submit for review</>}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
