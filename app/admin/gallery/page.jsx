"use client";

import PageHeader from "@/components/admin/PageHeader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import imageCompression from "browser-image-compression";
import { ExternalLink, ImagePlus, LoaderCircle, Trash2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const EMPTY_META = { title: "", caption: "", category: "" };
const COMMON_CATEGORIES = ["Events", "Workshops", "Contests", "Seminars", "Club Life"];

// Resize to max 1920px and re-encode (WebP when the browser supports it) before upload.
async function compress(file) {
  if (file.type === "image/gif") return file; // keep animations intact
  const out = await imageCompression(file, {
    maxWidthOrHeight: 1920,
    maxSizeMB: 1.5,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.85,
  });
  const name = file.name.replace(/\.[^.]+$/, "") + (out.type === "image/webp" ? ".webp" : "");
  return new File([out], name || file.name, { type: out.type || file.type });
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]); // [{ file, preview }]
  const [meta, setMeta] = useState(EMPTY_META);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [filter, setFilter] = useState("all");
  const inputRef = useRef(null);
  const { confirm, Dialog } = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi().get("/api/v1/gallery");
      if (data.success) { setImages(data.images); setCategories(data.categories || []); }
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  useEffect(() => () => files.forEach((f) => URL.revokeObjectURL(f.preview)), [files]);

  const onPick = (e) => {
    const picked = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...picked.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
    e.target.value = "";
  };

  const removePicked = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));
  const reset = () => { setFiles([]); setMeta(EMPTY_META); setProgress({ done: 0, total: 0 }); };

  const onUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return toast.error("Choose at least one image");
    setUploading(true);
    setProgress({ done: 0, total: files.length });
    let ok = 0;
    // One request per image keeps each body small (serverless body limits) and gives progress.
    for (const { file } of files) {
      try {
        const compressed = await compress(file);
        const fd = new FormData();
        fd.append("images", compressed);
        Object.entries(meta).forEach(([k, v]) => fd.append(k, v.trim()));
        const { data } = await adminApi().post("/api/v1/gallery", fd);
        if (data.success) ok++;
        else toast.error(`${file.name}: ${data.message}`);
      } catch (err) {
        toast.error(`${file.name}: ${err.response?.data?.message || err.message || "Upload failed"}`);
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    setUploading(false);
    if (ok) { toast.success(`${ok} image(s) uploaded`); reset(); load(); }
  };

  const onDelete = async (img) => {
    if (!(await confirm({ title: "Delete image?", description: "It will be removed from the public gallery." }))) return;
    try {
      const { data } = await adminApi().delete(`/api/v1/gallery/${img._id}`);
      if (data.success) {
        toast.success("Deleted");
        setImages((prev) => prev.filter((i) => i._id !== img._id));
      } else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const visible = filter === "all" ? images : images.filter((i) => (i.category || "") === filter);

  return (
    <div>
      <PageHeader
        title="Gallery"
        description="Upload photos to the public gallery. Images are resized (max 1920px) and compressed before upload to ImgBB."
      />

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Upload images</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onUpload} className="space-y-4">
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            >
              <ImagePlus className="mx-auto mb-2 text-indigo-500" />
              <p className="text-sm">Click to choose one or more images</p>
              <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onPick} />
            </div>

            {files.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2">
                {files.map((f, i) => (
                  <div key={f.preview} className="relative aspect-square rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.preview} alt="" className="w-full h-full object-cover" />
                    {!uploading && (
                      <button type="button" onClick={() => removePicked(i)} className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white"><X size={14} /></button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Title (optional)</Label><Input value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} placeholder="Intra-club contest 2026" /></div>
              <div className="space-y-1.5">
                <Label>Category (optional)</Label>
                <Input list="gallery-categories" value={meta.category} onChange={(e) => setMeta({ ...meta, category: e.target.value })} placeholder="Events" />
                <datalist id="gallery-categories">
                  {[...new Set([...COMMON_CATEGORIES, ...categories])].map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Caption (optional)</Label><Textarea rows={2} value={meta.caption} onChange={(e) => setMeta({ ...meta, caption: e.target.value })} /></div>
            <p className="text-xs text-muted-foreground">Title, caption and category apply to every image in this batch.</p>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={uploading || files.length === 0}>
                {uploading
                  ? <><LoaderCircle className="animate-spin mr-1" size={16} /> Uploading {progress.done}/{progress.total}</>
                  : <><Upload size={16} className="mr-1" /> Upload {files.length || ""}</>}
              </Button>
              {files.length > 0 && !uploading && <Button type="button" variant="outline" onClick={reset}>Clear</Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {["all", ...categories].map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`text-xs px-3 py-1.5 rounded-full border ${filter === c ? "bg-indigo-500 text-white border-indigo-500" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
            {c === "all" ? `All (${images.length})` : c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin" /></div>
      ) : visible.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No images yet.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {visible.map((img) => (
            <Card key={img._id} className="overflow-hidden">
              <a href={img.url} target="_blank" rel="noopener noreferrer" className="block aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.thumbUrl || img.mediumUrl || img.url} alt={img.title || ""} loading="lazy" className="w-full h-full object-cover" />
              </a>
              <CardContent className="p-3 space-y-1">
                <p className="text-sm font-medium truncate">{img.title || <span className="text-muted-foreground">Untitled</span>}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">{img.category || "—"} · {formatDate(img.createdAt)}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {img.deleteUrl && (
                      <a href={img.deleteUrl} target="_blank" rel="noopener noreferrer" title="Open ImgBB delete page" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><ExternalLink size={14} /></a>
                    )}
                    <button onClick={() => onDelete(img)} title="Delete" className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950 text-red-600"><Trash2 size={14} /></button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-4">
        Note: deleting removes the image from the site. ImgBB&apos;s API has no delete endpoint, so to also remove the hosted file use the <ExternalLink size={11} className="inline" /> link (ImgBB delete page) before deleting.
      </p>
      <Dialog />
    </div>
  );
}
