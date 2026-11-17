"use client";

/* eslint-disable @next/next/no-img-element */
import { excerpt, slugify } from "@/lib/blog-content";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertCircle, Globe, ImagePlus, LoaderCircle, ShieldCheck, X } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

const MAX_TAGS = 5;

function Counter({ value, max }) {
  const n = value.length;
  return <span className={`text-[11px] tabular-nums ${n > max ? "text-amber-600" : "text-gray-400"}`}>{n}/{max}</span>;
}

const inputCls =
  "mt-1.5 w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400";

/** SEO & social sharing settings. Empty fields fall back to sensible defaults (shown as placeholders). */
function SeoPanel({ title, subtitle, html, cover, tags, slug, setSlug, seo, setSeo, uploadImage }) {
  const [uploading, setUploading] = useState(false);
  const set = (k, v) => setSeo({ ...seo, [k]: v });
  const defTitle = title || "Untitled story";
  const defDesc = subtitle || excerpt(html, 155);
  const defSlug = slugify(title) || "your-story";
  const effSlug = slugify(slug) || defSlug;
  const host = typeof window !== "undefined" ? window.location.host : "tpicpc.com";
  const effTitle = seo.title || defTitle;
  const effDesc = seo.description || defDesc;

  const onOg = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setUploading(true);
    try {
      set("ogImage", await uploadImage(f));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search preview */}
      <div className="rounded-lg border bg-gray-50 dark:bg-white/[0.03] p-3.5">
        <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1"><Globe size={11} /> Search preview</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{host} › blogs › {effSlug}</p>
        <p className="text-[17px] leading-snug text-[#1a0dab] dark:text-[#8ab4f8] truncate">{effTitle} | TPI CPC</p>
        <p className="text-[13px] text-gray-600 dark:text-gray-400 line-clamp-2">{effDesc || "Add a description so people know what your story is about."}</p>
      </div>

      <label className="block">
        <span className="flex items-center justify-between text-sm font-medium">SEO title <Counter value={effTitle} max={60} /></span>
        <input value={seo.title} onChange={(e) => set("title", e.target.value)} placeholder={defTitle} maxLength={120} className={inputCls} />
      </label>

      <label className="block">
        <span className="flex items-center justify-between text-sm font-medium">Meta description <Counter value={effDesc} max={160} /></span>
        <textarea
          value={seo.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder={defDesc || "A one or two sentence summary of your story"}
          maxLength={320}
          rows={3}
          className={`${inputCls} h-auto py-2 resize-none`}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">URL slug</span>
        <div className="mt-1.5 flex items-center rounded-lg border bg-background focus-within:ring-2 focus-within:ring-indigo-500 overflow-hidden">
          <span className="pl-3 pr-1 text-sm text-gray-400 whitespace-nowrap">/blogs/</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
            placeholder={defSlug}
            maxLength={80}
            className="flex-1 h-10 pr-3 bg-transparent text-sm focus:outline-none placeholder:text-gray-400"
          />
        </div>
        <span className="text-[11px] text-gray-500">The old /blogs/&lt;id&gt; link keeps working.</span>
      </label>

      <label className="block">
        <span className="text-sm font-medium">Keywords</span>
        <input
          value={(seo.keywords || []).join(", ")}
          onChange={(e) => set("keywords", e.target.value.split(",").map((k) => k.trimStart()).slice(0, 15))}
          onBlur={() => set("keywords", (seo.keywords || []).map((k) => k.trim()).filter(Boolean))}
          placeholder={tags.length ? tags.join(", ") : "Defaults to your topics"}
          className={inputCls}
        />
      </label>

      <div>
        <span className="text-sm font-medium">Social image</span>
        <div className="mt-1.5 flex items-center gap-3">
          <div className="w-24 aspect-[1.91/1] rounded-md overflow-hidden bg-gray-100 dark:bg-white/5 shrink-0">
            {(seo.ogImage || cover) && <img src={seo.ogImage || cover} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <label className="cursor-pointer font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
              {uploading ? "Uploading…" : "Upload image"}
              <input type="file" accept="image/*" className="sr-only" onChange={onOg} />
            </label>
            {seo.ogImage && (
              <button type="button" onClick={() => set("ogImage", "")} className="text-gray-500 hover:underline">Use cover image</button>
            )}
          </div>
        </div>
        <span className="text-[11px] text-gray-500">{seo.ogImage ? "Custom image for link previews." : "Uses your cover image. 1200×630 works best."}</span>
      </div>

      <label className="block">
        <span className="text-sm font-medium">Canonical URL <span className="font-normal text-gray-400">(optional)</span></span>
        <input
          value={seo.canonicalUrl}
          onChange={(e) => set("canonicalUrl", e.target.value.trim())}
          placeholder="https://… if this story was first published elsewhere"
          type="url"
          className={inputCls}
        />
      </label>
    </div>
  );
}

function TagInput({ tags, setTags }) {
  const [value, setValue] = useState("");
  const add = (raw) => {
    const parts = raw.split(",").map((t) => t.trim().replace(/\s+/g, " ")).filter(Boolean);
    if (!parts.length) return;
    const next = [...tags];
    for (const p of parts) {
      if (next.length >= MAX_TAGS) break;
      if (!next.some((t) => t.toLowerCase() === p.toLowerCase())) next.push(p.slice(0, 30));
    }
    setTags(next);
    setValue("");
  };
  return (
    <div className="rounded-lg border bg-background px-2 py-2 flex flex-wrap gap-1.5 focus-within:ring-2 focus-within:ring-indigo-500">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-white/10 pl-3 pr-1.5 py-1 text-sm">
          {t}
          <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} className="rounded-full p-0.5 hover:bg-gray-200 dark:hover:bg-white/15" aria-label={`Remove ${t}`}>
            <X size={12} />
          </button>
        </span>
      ))}
      {tags.length < MAX_TAGS && (
        <input
          value={value}
          onChange={(e) => (e.target.value.includes(",") ? add(e.target.value) : setValue(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(value);
            } else if (e.key === "Backspace" && !value && tags.length) {
              setTags(tags.slice(0, -1));
            }
          }}
          onBlur={() => add(value)}
          placeholder={tags.length ? "Add another…" : "e.g. JavaScript, Web Development"}
          className="flex-1 min-w-[140px] bg-transparent px-1.5 py-1 text-sm focus:outline-none"
          aria-label="Add a topic"
        />
      )}
    </div>
  );
}

export default function PublishDialog({
  open,
  onOpenChange,
  isAdmin,
  isEdit,
  title,
  subtitle,
  cover,
  html,
  tags,
  setTags,
  author,
  setAuthor,
  currentUser,
  problems,
  saving,
  onChangeCover,
  onSubmit,
  minutes,
  slug,
  setSlug,
  seo,
  setSeo,
  uploadImage,
}) {
  const [tab, setTab] = useState("publish");
  const cta = isAdmin ? (isEdit ? "Save changes" : "Publish now") : "Submit for review";
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed z-[71] inset-x-0 bottom-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[min(880px,calc(100vw-2rem))] max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-950 border shadow-2xl focus:outline-none">
          <div className="flex items-center justify-between px-6 pt-5">
            <Dialog.Title className="text-lg font-semibold">{isAdmin ? "Ready to publish?" : "Ready to share your story?"}</Dialog.Title>
            <Dialog.Close className="w-9 h-9 inline-flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10" aria-label="Close">
              <X size={18} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Review how your story will appear, add topics and publish.</Dialog.Description>

          <div className="grid md:grid-cols-2 gap-8 px-6 pb-6 pt-4">
            {/* Story preview card */}
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Story preview</p>
              {cover ? (
                <button type="button" onClick={onChangeCover} className="group relative block w-full aspect-[16/9] overflow-hidden rounded-lg bg-gray-100 dark:bg-white/5">
                  <img src={cover} alt="" className="w-full h-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition">Change cover</span>
                </button>
              ) : (
                <button type="button" onClick={onChangeCover} className="w-full aspect-[16/9] rounded-lg border-2 border-dashed border-gray-300 dark:border-white/15 flex flex-col items-center justify-center gap-2 text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition">
                  <ImagePlus size={22} />
                  Add a cover image
                  <span className="text-xs text-gray-400">Shown on the blog list and when shared</span>
                </button>
              )}
              <h3 className="mt-4 font-article text-xl font-bold leading-snug line-clamp-2">{title || <span className="text-gray-400">Untitled story</span>}</h3>
              <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                {subtitle || excerpt(html, 180) || "Your subtitle or the first lines of your story appear here."}
              </p>
              <p className="mt-2 text-xs text-gray-500">{minutes} min read</p>
            </div>

            {/* Settings */}
            <div className="flex flex-col min-w-0">
              <div role="tablist" className="mb-5 inline-flex self-start rounded-full bg-gray-100 dark:bg-white/[0.06] p-1 text-sm">
                {[
                  ["publish", "Publishing"],
                  ["seo", "SEO & sharing"],
                ].map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    role="tab"
                    aria-selected={tab === k}
                    onClick={() => setTab(k)}
                    className={`px-4 h-8 rounded-full font-medium transition ${tab === k ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {tab === "seo" ? (
                <SeoPanel title={title} subtitle={subtitle} html={html} cover={cover} tags={tags} slug={slug} setSlug={setSlug} seo={seo} setSeo={setSeo} uploadImage={uploadImage} />
              ) : (
              <>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Publishing to <strong className="text-gray-900 dark:text-white">TPI CPC Blog</strong>
                {!isAdmin && currentUser?.fullName && <> as <strong className="text-gray-900 dark:text-white">{currentUser.fullName}</strong></>}
              </p>

              {isAdmin && (
                <label className="mt-5 block">
                  <span className="text-sm font-medium">Author name</span>
                  <input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="mt-1.5 w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
              )}

              <div className="mt-5">
                <span className="text-sm font-medium">Topics</span>
                <p className="text-xs text-gray-500 mb-1.5">Add up to {MAX_TAGS} so readers can find your story.</p>
                <TagInput tags={tags} setTags={setTags} />
              </div>

              {!isAdmin && (
                <div className="mt-5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-3.5 py-3 flex gap-2.5">
                  <ShieldCheck size={17} className="text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed text-indigo-800 dark:text-indigo-200">
                    An admin reviews every story before it goes live. Original content only, no spam or promotion.
                  </p>
                </div>
              )}

              </>
              )}

              {problems.length > 0 && (
                <ul className="mt-5 space-y-1.5" aria-live="polite">
                  {problems.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
                      <AlertCircle size={15} className="shrink-0 mt-0.5" /> {p}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-auto pt-6 flex items-center justify-end gap-2">
                <Dialog.Close className="h-10 px-4 rounded-full text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/10">Keep editing</Dialog.Close>
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={saving || problems.length > 0}
                  className="h-10 px-5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 shadow-md shadow-indigo-500/20"
                >
                  {saving && <LoaderCircle size={16} className="animate-spin" />}
                  {cta}
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
