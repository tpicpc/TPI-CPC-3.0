"use client";

import RichTextEditor from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/lib/api-client";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function BlogForm({ id }) {
  const router = useRouter();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", author: "TPI CPC", tags: "" });

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    adminApi().get(`/api/v1/blog/${id}`).then(({ data }) => {
      if (data.success) {
        setForm({
          title: data.blog.title,
          description: data.blog.description,
          author: data.blog.author || "TPI CPC",
          tags: (data.blog.tags || []).join(", "),
        });
        setPreview(data.blog.image);
      }
    }).finally(() => setLoading(false));
  }, [id, isEdit]);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || form.description === "<p><br></p>") return toast.error("Write some content");
    if (!isEdit && !file) return toast.error("Upload a cover image");
    setSaving(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("author", form.author);
    fd.append("tags", JSON.stringify(form.tags.split(",").map((t) => t.trim()).filter(Boolean)));
    if (file) fd.append("image", file);
    try {
      const url = isEdit ? `/api/v1/blog/${id}` : `/api/v1/blog`;
      const method = isEdit ? "put" : "post";
      const { data } = await adminApi()[method](url, fd);
      if (data.success) { toast.success(isEdit ? "Updated" : "Published"); router.push("/admin/blogs"); }
      else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin" /></div>;

  return (
    <Card className="max-w-4xl">
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Cover image {isEdit ? "(optional)" : "*"}</Label>
            {preview && <img src={preview} alt="preview" className="w-full max-h-64 object-cover rounded-md border" />}
            <Input type="file" accept="image/*" onChange={onFile} />
          </div>
          <div className="space-y-1.5"><Label>Title *</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Author</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="JavaScript, Web Dev" /></div>
          </div>
          <div className="space-y-1.5">
            <Label>Content *</Label>
            <RichTextEditor value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Write your blog post..." />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>{saving ? <LoaderCircle className="animate-spin" size={18} /> : isEdit ? "Save changes" : "Publish"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/blogs")}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
