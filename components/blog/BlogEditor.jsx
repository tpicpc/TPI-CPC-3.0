"use client";

/* eslint-disable @next/next/no-img-element */
import ArticleView from "@/components/blog/ArticleView";
import PublishDialog from "@/components/blog/PublishDialog";
import { normalizeLegacyHtml, slugify, stripHtml } from "@/lib/blog-content";
import { articleSerif } from "@/lib/fonts";
import { sanitizeBlogHtmlClient } from "@/lib/sanitize-blog-client";
import CharacterCount from "@tiptap/extension-character-count";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import {
  ArrowLeft,
  Bold,
  Code,
  Eye,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  LoaderCircle,
  Minus,
  PenLine,
  Quote,
  Redo2,
  SquareCode,
  Strikethrough,
  Trash2,
  Undo2,
  Unlink,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

const MAX_IMAGE_MB = 4;
const MIN_USER_CHARS = 100;
const EMPTY_SEO = { title: "", description: "", keywords: [], canonicalUrl: "", ogImage: "" };

function useStickyOffset() {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const measure = () => {
      const header = document.querySelector("header.sticky");
      setOffset(header ? Math.round(header.getBoundingClientRect().height) : 0);
    };
    measure();
    window.addEventListener("resize", measure);
    const t = setTimeout(measure, 500);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, []);
  return offset;
}

function AutoTextarea({ value, onChange, className, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return <textarea ref={ref} rows={1} value={value} onChange={(e) => onChange(e.target.value)} className={className} {...rest} />;
}

function ToolButton({ onClick, active, disabled, label, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active || undefined}
      className={`inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-md transition disabled:opacity-30 ${
        active
          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/**
 * Medium-style, distraction-free blog editor shared by the admin panel and the public
 * "Write a story" page.
 *
 * Props:
 *  - mode: "admin" | "user"
 *  - blogId: when set (admin only), edits an existing post
 *  - api: () => axios instance carrying the right auth token
 *  - currentUser: { fullName, profileImage, username } for user mode
 *  - backHref: where the back arrow / cancel goes
 *  - onDone: called after a successful publish/submit
 */
export default function BlogEditor({ mode = "user", blogId = null, api, currentUser, backHref = "/blogs", onDone }) {
  const isAdmin = mode === "admin";
  const isEdit = !!blogId;
  const draftKey = `tpicpc:blog-draft:${mode}:${blogId || "new"}`;
  const stickyTop = useStickyOffset();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [cover, setCover] = useState("");
  const [tags, setTags] = useState([]);
  const [author, setAuthor] = useState("TPI CPC");
  const [html, setHtml] = useState("");
  const [slug, setSlug] = useState("");
  const [seo, setSeo] = useState(EMPTY_SEO);

  const [loaded, setLoaded] = useState(!isEdit);
  const [initialContent, setInitialContent] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const [pendingDraft, setPendingDraft] = useState(null); // edit mode: newer local draft available
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [preview, setPreview] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(0);
  const [linkEditor, setLinkEditor] = useState(null); // { href }

  const coverInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const hydratedRef = useRef(false);

  // ------------------------------------------------------------------ uploads
  const uploadImage = useCallback(
    async (file) => {
      if (!file || !file.type?.startsWith("image/")) throw new Error("Please choose an image file");
      let toSend = file;
      try {
        const { default: compress } = await import("browser-image-compression");
        toSend = await compress(file, { maxSizeMB: 1, maxWidthOrHeight: 2000, useWebWorker: true });
      } catch {
        // fall back to the original file
      }
      if (toSend.size > MAX_IMAGE_MB * 1024 * 1024) throw new Error(`Image must be under ${MAX_IMAGE_MB} MB`);
      const fd = new FormData();
      fd.append("image", toSend, file.name);
      const { data } = await api().post("/api/v1/upload", fd);
      if (!data.success || !data.url) throw new Error(data.message || "Upload failed");
      return data.url;
    },
    [api]
  );

  const editorRef = useRef(null);
  const insertImageFiles = useCallback(
    async (files, pos) => {
      const list = Array.from(files || []).filter((f) => f.type?.startsWith("image/"));
      for (const file of list) {
        setUploadingInline((n) => n + 1);
        try {
          const url = await uploadImage(file);
          const ed = editorRef.current;
          if (!ed) return;
          const chain = ed.chain().focus();
          (typeof pos === "number" ? chain.insertContentAt(pos, { type: "image", attrs: { src: url, alt: "" } }) : chain.setImage({ src: url, alt: "" })).run();
        } catch (err) {
          toast.error(err.response?.data?.message || err.message || "Image upload failed");
        } finally {
          setUploadingInline((n) => n - 1);
        }
      }
    },
    [uploadImage]
  );

  // ------------------------------------------------------------------ editor
  // Options are memoised once: Tiptap re-applies changed options on every render, which
  // (combined with re-rendering on transactions) would loop. Callbacks go through refs.
  const insertImageFilesRef = useRef(insertImageFiles);
  insertImageFilesRef.current = insertImageFiles;
  const editorOptions = useMemo(
    () => ({
      immediatelyRender: false,
      shouldRerenderOnTransaction: true,
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3, 4] },
          link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
        }),
        Image.configure({ inline: false, allowBase64: false }),
        Placeholder.configure({
          placeholder: ({ node }) => (node.type.name === "heading" ? "Heading" : "Tell your story…"),
        }),
        CharacterCount,
        Typography,
      ],
      editorProps: {
        attributes: { class: "article-content font-article", spellcheck: "true" },
        handleDrop: (view, event, _slice, moved) => {
          if (moved || !event.dataTransfer?.files?.length) return false;
          const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
          event.preventDefault();
          insertImageFilesRef.current(event.dataTransfer.files, coords?.pos);
          return true;
        },
        handlePaste: (_view, event) => {
          const files = event.clipboardData?.files;
          if (!files?.length) return false;
          event.preventDefault();
          insertImageFilesRef.current(files);
          return true;
        },
      },
      onUpdate: ({ editor }) => setHtml(editor.isEmpty ? "" : editor.getHTML()),
    }),
    []
  );
  const editor = useEditor(editorOptions, []);
  // Stable reference: BubbleMenu re-dispatches when this prop changes identity.
  const bubbleShouldShow = useCallback(
    ({ editor: ed, state }) => !state.selection.empty && !ed.isActive("image") && !ed.isActive("codeBlock"),
    []
  );
  editorRef.current = editor;

  // ------------------------------------------------------------------ load
  useEffect(() => {
    let draft = null;
    try {
      draft = JSON.parse(localStorage.getItem(draftKey) || "null");
    } catch {}

    if (!isEdit) {
      if (draft && (draft.title || stripHtml(draft.html))) {
        setTitle(draft.title || "");
        setSubtitle(draft.subtitle || "");
        setCover(draft.cover || "");
        setTags(draft.tags || []);
        if (draft.author) setAuthor(draft.author);
        setSlug(draft.slug || "");
        setSeo({ ...EMPTY_SEO, ...(draft.seo || {}) });
        setInitialContent(draft.html || "");
        setSavedAt(draft.savedAt);
        setRestoredDraft(true);
      } else {
        setInitialContent("");
      }
      return;
    }

    api()
      .get(`/api/v1/blog/${blogId}`)
      .then(({ data }) => {
        if (!data.success) throw new Error(data.message);
        const b = data.blog;
        setTitle(b.title || "");
        setSubtitle(b.subtitle || "");
        setCover(b.image || "");
        setTags(b.tags || []);
        setAuthor(b.author || "TPI CPC");
        setSlug(b.slug || "");
        setSeo({ ...EMPTY_SEO, ...(b.seo || {}) });
        setInitialContent(normalizeLegacyHtml(b.description || ""));
        if (draft?.savedAt && draft.savedAt > new Date(b.updatedAt || 0).getTime()) setPendingDraft(draft);
      })
      .catch(() => toast.error("Couldn't load this post"))
      .finally(() => setLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogId]);

  useEffect(() => {
    if (!editor || initialContent === null || hydratedRef.current) return;
    hydratedRef.current = true;
    editor.commands.setContent(initialContent || "", { emitUpdate: false });
    setHtml(editor.isEmpty ? "" : editor.getHTML());
  }, [editor, initialContent]);

  // ------------------------------------------------------------------ autosave
  const saveDraft = useCallback(() => {
    if (!hydratedRef.current) return;
    const data = { title, subtitle, cover, tags, author, html, slug, seo, savedAt: Date.now() };
    try {
      localStorage.setItem(draftKey, JSON.stringify(data));
      setSavedAt(data.savedAt);
    } catch {}
  }, [title, subtitle, cover, tags, author, html, slug, seo, draftKey]);

  const dirtyRef = useRef(false);
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (!dirtyRef.current) {
      dirtyRef.current = true;
      return; // skip the initial hydration render
    }
    const t = setTimeout(saveDraft, 800);
    return () => clearTimeout(t);
  }, [saveDraft]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveDraft();
        toast.success("Draft saved on this device");
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && editorRef.current?.isFocused) {
        e.preventDefault();
        setLinkEditor({ href: editorRef.current.getAttributes("link").href || "" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saveDraft]);

  const restorePending = () => {
    const d = pendingDraft;
    setTitle(d.title || "");
    setSubtitle(d.subtitle || "");
    setCover(d.cover || "");
    setTags(d.tags || []);
    if (d.author) setAuthor(d.author);
    setSlug(d.slug || "");
    setSeo({ ...EMPTY_SEO, ...(d.seo || {}) });
    editor?.commands.setContent(d.html || "");
    setHtml(d.html || "");
    setPendingDraft(null);
    toast.success("Local changes restored");
  };

  const discardDraft = () => {
    localStorage.removeItem(draftKey);
    setPendingDraft(null);
    if (restoredDraft) {
      setTitle("");
      setSubtitle("");
      setCover("");
      setTags([]);
      setAuthor("TPI CPC");
      setSlug("");
      setSeo(EMPTY_SEO);
      editor?.commands.setContent("");
      setHtml("");
      setRestoredDraft(false);
      setSavedAt(null);
    }
  };

  // ------------------------------------------------------------------ stats
  const words = editor?.storage.characterCount?.words?.() ?? 0;
  const chars = stripHtml(html).length;
  const minutes = Math.max(1, Math.round(words / 225));

  // ------------------------------------------------------------------ actions
  const onCoverFile = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setUploadingCover(true);
    try {
      setCover(await uploadImage(f));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Cover upload failed");
    } finally {
      setUploadingCover(false);
    }
  };

  const openLinkEditor = () => {
    if (!editor) return;
    setLinkEditor({ href: editor.getAttributes("link").href || "" });
  };

  const applyLink = (href) => {
    if (!editor) return;
    const value = href.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (!value) chain.unsetLink().run();
    else chain.setLink({ href: /^(https?:|mailto:|\/|#)/i.test(value) ? value : `https://${value}` }).run();
    setLinkEditor(null);
  };

  const problems = useMemo(() => {
    const list = [];
    if (!title.trim()) list.push("Add a title");
    if (!cover) list.push("Add a cover image");
    if (!isAdmin && chars < MIN_USER_CHARS) list.push(`Write at least ${MIN_USER_CHARS} characters (${chars} so far)`);
    if (isAdmin && chars === 0) list.push("Write some content");
    if (uploadingInline > 0 || uploadingCover) list.push("Wait for image uploads to finish");
    return list;
  }, [title, cover, chars, isAdmin, uploadingInline, uploadingCover]);

  const submit = async () => {
    if (problems.length) return toast.error(problems[0]);
    setSaving(true);
    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("subtitle", subtitle.trim());
    fd.append("description", html);
    fd.append("tags", JSON.stringify(tags));
    fd.append("image", cover);
    if (isAdmin) fd.append("author", author.trim() || "TPI CPC");
    fd.append("slug", slugify(slug || title));
    fd.append("seo", JSON.stringify(seo));
    try {
      const client = api();
      const { data } = isAdmin
        ? isEdit
          ? await client.put(`/api/v1/blog/${blogId}`, fd)
          : await client.post("/api/v1/blog", fd)
        : await client.post("/api/v1/blog/submit", fd);
      if (!data.success) throw new Error(data.message);
      localStorage.removeItem(draftKey);
      toast.success(data.message || (isAdmin ? (isEdit ? "Changes saved" : "Published") : "Submitted for review"));
      setPublishOpen(false);
      onDone?.(data);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------------------ render
  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoaderCircle className="animate-spin text-indigo-500" />
      </div>
    );
  }

  const previewAuthor = isAdmin
    ? { name: author || "TPI CPC", isClub: !author || author === "TPI CPC" }
    : { name: currentUser?.fullName, avatar: currentUser?.profileImage, username: currentUser?.username };

  const statusText = uploadingInline > 0 || uploadingCover
    ? "Uploading image…"
    : savedAt
      ? `Saved locally · ${formatTime(savedAt)}`
      : isEdit ? "Editing" : "Draft";

  return (
    <div className={`${articleSerif.variable} blog-editor`}>
      {/* Top bar */}
      <div
        className="sticky z-30 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-200/80 dark:border-white/10"
        style={{ top: stickyTop }}
      >
        <div className="mx-auto max-w-5xl px-3 sm:px-5 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={backHref} className="w-9 h-9 shrink-0 inline-flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300" aria-label="Back">
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {isAdmin ? (isEdit ? "Edit post" : "New post") : "Write a story"}
              </p>
              <p className="text-xs text-gray-500 truncate" aria-live="polite">
                {statusText}
                <span className="hidden sm:inline"> · {words} words · {minutes} min read</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreview((p) => !p)}
              className="inline-flex items-center gap-1.5 h-9 px-3 sm:px-4 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition"
            >
              {preview ? <PenLine size={16} /> : <Eye size={16} />}
              <span className="hidden sm:inline">{preview ? "Edit" : "Preview"}</span>
            </button>
            <button
              type="button"
              onClick={() => setPublishOpen(true)}
              className="inline-flex items-center h-9 px-4 sm:px-5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 shadow-md shadow-indigo-500/20 transition"
            >
              {isAdmin ? (isEdit ? "Save" : "Publish") : "Publish"}
            </button>
          </div>
        </div>

        {!preview && (
          <div className="border-t border-gray-100 dark:border-white/5">
            <div className="mx-auto max-w-5xl px-2 sm:px-5 h-11 flex items-center gap-0.5 overflow-x-auto [scrollbar-width:none]">
              <ToolButton label="Heading" active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={17} /></ToolButton>
              <ToolButton label="Subheading" active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={17} /></ToolButton>
              <span className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1 shrink-0" />
              <ToolButton label="Bold (Ctrl+B)" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}><Bold size={16} /></ToolButton>
              <ToolButton label="Italic (Ctrl+I)" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic size={16} /></ToolButton>
              <ToolButton label="Strikethrough" active={editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()}><Strikethrough size={16} /></ToolButton>
              <ToolButton label="Inline code" active={editor?.isActive("code")} onClick={() => editor?.chain().focus().toggleCode().run()}><Code size={16} /></ToolButton>
              <ToolButton label="Link (Ctrl+K)" active={editor?.isActive("link")} onClick={openLinkEditor}><Link2 size={16} /></ToolButton>
              <span className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1 shrink-0" />
              <ToolButton label="Quote" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()}><Quote size={16} /></ToolButton>
              <ToolButton label="Code block" active={editor?.isActive("codeBlock")} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}><SquareCode size={16} /></ToolButton>
              <ToolButton label="Bulleted list" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}><List size={17} /></ToolButton>
              <ToolButton label="Numbered list" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}><ListOrdered size={17} /></ToolButton>
              <ToolButton label="Image" onClick={() => imageInputRef.current?.click()}>
                {uploadingInline > 0 ? <LoaderCircle size={16} className="animate-spin" /> : <ImagePlus size={17} />}
              </ToolButton>
              <ToolButton label="Divider" onClick={() => editor?.chain().focus().setHorizontalRule().run()}><Minus size={17} /></ToolButton>
              <span className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1 shrink-0" />
              <ToolButton label="Undo" disabled={!editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()}><Undo2 size={16} /></ToolButton>
              <ToolButton label="Redo" disabled={!editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()}><Redo2 size={16} /></ToolButton>
            </div>
            {linkEditor && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  applyLink(linkEditor.href);
                }}
                className="mx-auto max-w-5xl px-3 sm:px-5 pb-2 flex items-center gap-2"
              >
                <input
                  autoFocus
                  value={linkEditor.href}
                  onChange={(e) => setLinkEditor({ href: e.target.value })}
                  onKeyDown={(e) => e.key === "Escape" && setLinkEditor(null)}
                  placeholder="Paste or type a link, then press Enter"
                  className="flex-1 h-9 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" className="h-9 px-3 rounded-md bg-indigo-500 text-white text-sm font-medium">Apply</button>
                {editor?.isActive("link") && (
                  <button type="button" onClick={() => applyLink("")} className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-white/10" aria-label="Remove link"><Unlink size={16} /></button>
                )}
                <button type="button" onClick={() => setLinkEditor(null)} className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-white/10" aria-label="Close"><X size={16} /></button>
              </form>
            )}
          </div>
        )}
      </div>

      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={onCoverFile} />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          insertImageFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {(pendingDraft || restoredDraft) && !preview && (
        <div className="mx-auto max-w-[728px] px-5 sm:px-6 mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2.5 text-sm text-indigo-800 dark:text-indigo-200">
            {pendingDraft ? (
              <>
                <span>You have unsaved changes on this device from {formatTime(pendingDraft.savedAt)}.</span>
                <span className="flex gap-3 font-medium">
                  <button type="button" onClick={restorePending} className="hover:underline">Restore</button>
                  <button type="button" onClick={discardDraft} className="hover:underline opacity-80">Discard</button>
                </span>
              </>
            ) : (
              <>
                <span>We restored your unfinished draft.</span>
                <span className="flex gap-3 font-medium">
                  <button type="button" onClick={() => setRestoredDraft(false)} className="hover:underline">Keep writing</button>
                  <button type="button" onClick={discardDraft} className="hover:underline opacity-80">Start over</button>
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {preview ? (
        <div className="pt-6 pb-16">
          <ArticleView
            preview
            blog={{ title, subtitle, image: cover, tags, author, createdAt: new Date().toISOString() }}
            author={previewAuthor}
            html={sanitizeBlogHtmlClient(html)}
          />
        </div>
      ) : (
        <div className="mx-auto max-w-[728px] px-5 sm:px-6 pt-8 md:pt-12">
          {/* Cover */}
          {cover ? (
            <figure className="group relative -mx-5 sm:mx-0 mb-8">
              <img src={cover} alt="Cover" className="w-full max-h-[420px] object-cover sm:rounded-xl" />
              <div className="absolute top-3 right-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                <button type="button" onClick={() => coverInputRef.current?.click()} className="h-8 px-3 rounded-full bg-black/60 hover:bg-black/75 text-white text-xs font-medium backdrop-blur">
                  {uploadingCover ? "Uploading…" : "Change cover"}
                </button>
                <button type="button" onClick={() => setCover("")} className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-black/60 hover:bg-black/75 text-white backdrop-blur" aria-label="Remove cover">
                  <Trash2 size={14} />
                </button>
              </div>
            </figure>
          ) : (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-dashed border-gray-300 dark:border-white/15 px-4 py-2 text-sm text-gray-500 hover:text-indigo-600 hover:border-indigo-400 transition"
            >
              {uploadingCover ? <LoaderCircle size={16} className="animate-spin" /> : <ImagePlus size={16} />}
              {uploadingCover ? "Uploading cover…" : "Add a cover image"}
            </button>
          )}

          <AutoTextarea
            value={title}
            onChange={setTitle}
            placeholder="Title"
            maxLength={150}
            aria-label="Title"
            className="w-full resize-none overflow-hidden bg-transparent font-article text-[34px] sm:text-[42px] leading-[1.2] font-bold tracking-[-0.016em] text-gray-950 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                document.getElementById("blog-subtitle")?.focus();
              }
            }}
          />
          <AutoTextarea
            id="blog-subtitle"
            value={subtitle}
            onChange={setSubtitle}
            placeholder="Add a subtitle (optional)"
            maxLength={300}
            aria-label="Subtitle"
            className="mt-2 w-full resize-none overflow-hidden bg-transparent font-article text-[20px] sm:text-[22px] leading-snug text-gray-600 dark:text-gray-400 placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                editor?.commands.focus("start");
              }
            }}
          />

          <div className="mt-6">
            {editor && (
              <BubbleMenu
                editor={editor}
                shouldShow={bubbleShouldShow}
                className="flex items-center gap-0.5 rounded-lg bg-gray-900 dark:bg-gray-800 text-white shadow-xl px-1 py-1"
              >
                {[
                  ["Bold", "bold", () => editor.chain().focus().toggleBold().run(), <Bold key="b" size={15} />],
                  ["Italic", "italic", () => editor.chain().focus().toggleItalic().run(), <Italic key="i" size={15} />],
                  ["Link", "link", openLinkEditor, <Link2 key="l" size={15} />],
                  ["Heading", ["heading", { level: 2 }], () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 key="h2" size={16} />],
                  ["Subheading", ["heading", { level: 3 }], () => editor.chain().focus().toggleHeading({ level: 3 }).run(), <Heading3 key="h3" size={16} />],
                  ["Quote", "blockquote", () => editor.chain().focus().toggleBlockquote().run(), <Quote key="q" size={15} />],
                  ["Code", "code", () => editor.chain().focus().toggleCode().run(), <Code key="c" size={15} />],
                ].map(([label, name, fn, icon]) => {
                  const active = Array.isArray(name) ? editor.isActive(...name) : editor.isActive(name);
                  return (
                    <button
                      key={label}
                      type="button"
                      title={label}
                      aria-label={label}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={fn}
                      className={`w-8 h-8 inline-flex items-center justify-center rounded-md transition ${active ? "text-indigo-300 bg-white/10" : "hover:bg-white/10"}`}
                    >
                      {icon}
                    </button>
                  );
                })}
              </BubbleMenu>
            )}
            <EditorContent editor={editor} />
          </div>
        </div>
      )}

      <PublishDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        isAdmin={isAdmin}
        isEdit={isEdit}
        title={title}
        subtitle={subtitle}
        cover={cover}
        html={html}
        tags={tags}
        setTags={setTags}
        author={author}
        setAuthor={setAuthor}
        currentUser={currentUser}
        problems={problems}
        saving={saving}
        onChangeCover={() => coverInputRef.current?.click()}
        onSubmit={submit}
        minutes={minutes}
        slug={slug}
        setSlug={setSlug}
        seo={seo}
        setSeo={setSeo}
        uploadImage={uploadImage}
      />
    </div>
  );
}
