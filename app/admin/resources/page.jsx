"use client";

import PageHeader from "@/components/admin/PageHeader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api-client";
import { Download, Edit, FileText, LoaderCircle, Plus, Star, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const COMMON_CATEGORIES = ["Notes", "Cheat Sheets", "E-books", "Tutorials", "Templates", "Slides"];

const EMPTY = { title: "", description: "", fileUrl: "", fileType: "PDF", fileSize: "", category: "Notes", tags: "", featured: false };

export default function AdminResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | "new" | id
  const [form, setForm] = useState(EMPTY);
  const [thumb, setThumb] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const { confirm, Dialog } = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi().get("/api/v1/resources");
      if (data.success) setResources(data.resources);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing("new"); setForm(EMPTY); setThumb(null); setThumbPreview(null); };
  const startEdit = (r) => {
    setEditing(r._id);
    setForm({
      title: r.title, description: r.description || "", fileUrl: r.fileUrl, fileType: r.fileType || "",
      fileSize: r.fileSize || "", category: r.category, tags: (r.tags || []).join(", "), featured: !!r.featured,
    });
    setThumb(null);
    setThumbPreview(r.thumbnailUrl || null);
  };
  const cancel = () => { setEditing(null); setForm(EMPTY); setThumb(null); setThumbPreview(null); };

  const onThumb = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setThumb(f);
    setThumbPreview(URL.createObjectURL(f));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.fileUrl || !form.category) return toast.error("Title, file URL, and category required");
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "tags") fd.append("tags", JSON.stringify(v.split(",").map((t) => t.trim()).filter(Boolean)));
      else fd.append(k, String(v));
    });
    if (thumb) fd.append("thumbnail", thumb);
    try {
      const isNew = editing === "new";
      const { data } = await adminApi()[isNew ? "post" : "put"](isNew ? "/api/v1/resources" : `/api/v1/resources/${editing}`, fd);
      if (data.success) { toast.success(isNew ? "Added" : "Updated"); cancel(); load(); }
      else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const onDelete = async (id) => {
    if (!(await confirm({ title: "Delete resource?" }))) return;
    try {
      const { data } = await adminApi().delete(`/api/v1/resources/${id}`);
      if (data.success) { toast.success("Deleted"); load(); }
    } catch (err) { toast.error("Failed"); }
  };

  return (
    <div>
      <PageHeader
        title="Resource Library"
        description="Upload notes, cheat sheets, and e-books for members."
        action={!editing && <Button onClick={startNew}><Plus size={16} className="mr-1" /> Add resource</Button>}
      />

      {editing && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5 md:col-span-2"><Label>Title *</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. JavaScript ES6 Cheat Sheet" /></div>
                <div className="space-y-1.5 md:col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Download URL *</Label>
                  <Input required type="url" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://drive.google.com/... or any direct link" />
                  <p className="text-xs text-muted-foreground">Use Google Drive, Dropbox, GitHub release, or any public hosting.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Category *</Label>
                  <Input required list="cat-list" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                  <datalist id="cat-list">{COMMON_CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
                </div>
                <div className="space-y-1.5"><Label>File type</Label><Input value={form.fileType} onChange={(e) => setForm({ ...form, fileType: e.target.value })} placeholder="PDF, ZIP, DOCX..." /></div>
                <div className="space-y-1.5"><Label>File size (display)</Label><Input value={form.fileSize} onChange={(e) => setForm({ ...form, fileSize: e.target.value })} placeholder="2.4 MB" /></div>
                <div className="space-y-1.5"><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="javascript, beginner" /></div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Thumbnail (optional)</Label>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-16 rounded border bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center shrink-0">
                      {thumbPreview ? <img src={thumbPreview} alt="" className="w-full h-full object-cover" /> : <FileText className="text-gray-400" size={20} />}
                    </div>
                    <Input type="file" accept="image/*" onChange={onThumb} className="flex-1" />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm md:col-span-2">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={cancel}><X size={14} className="mr-1" /> Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? <LoaderCircle className="animate-spin" size={14} /> : "Save"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin" /></div>
      ) : resources.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No resources yet.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r) => (
            <Card key={r._id} className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-indigo-500/15 to-violet-500/15 relative flex items-center justify-center">
                {r.thumbnailUrl ? <img src={r.thumbnailUrl} alt="" className="w-full h-full object-cover" /> : <FileText className="text-indigo-400" size={36} />}
                {r.featured && <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><Star size={11} /> Featured</span>}
              </div>
              <CardContent className="p-4">
                <span className="text-[10px] uppercase tracking-wide text-indigo-600 font-bold">{r.category}</span>
                <h3 className="font-bold mt-0.5 line-clamp-2">{r.title}</h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Download size={11} /> {r.downloads} {r.fileSize && `· ${r.fileSize}`}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => startEdit(r)}><Edit size={13} /></Button>
                  <Button size="sm" variant="outline" onClick={() => onDelete(r._id)} className="text-red-600"><Trash2 size={13} /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog />
    </div>
  );
}
